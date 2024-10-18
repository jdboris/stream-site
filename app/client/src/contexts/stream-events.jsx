import { getAuth, getIdToken } from "firebase/auth";
import { createContext, useCallback, useContext, useState } from "react";

const StreamEventContext = createContext(null);

export function useStreamEvents() {
  return useContext(StreamEventContext);
}

function validate(streamEvent) {
  const errors = [];

  if (!streamEvent.title) {
    errors.push(new Error("Please enter an event title."));
  }

  if (streamEvent.title && streamEvent.title.length > 255) {
    errors.push(new Error("Event title too long (255 character limit)."));
  }

  if (!streamEvent.start) {
    errors.push(new Error("Please enter an event start time."));
  }

  if (!streamEvent.end) {
    errors.push(new Error("Please enter an event end time."));
  }

  if (errors.length) {
    throw errors;
  }

  return true;
}

export class StreamEvent {
  id = null;
  title = "";
  streamerId = null;
  streamer = { username: "" };
  start = null;
  end = null;

  constructor(data = null) {
    if (data) {
      Object.assign(this, data);

      // NOTE: Must replace "-" with "/" for Date.parse to work in firefox
      this.start =
        typeof this.start === "string"
          ? new Date(Date.parse(this.start))
          : this.start;
      this.end =
        typeof this.end === "string"
          ? new Date(Date.parse(this.end))
          : this.end;
    }
  }
}

export function StreamEventProvider({ useAuth, children }) {
  const { reauthenticate } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streamEvents, setStreamEvents] = useState([]);

  // NOTE: Must memoize to fix dependency warnings
  const readAll = useCallback(async (month, year) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/stream-events/all?month=${month}&year=${year}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setStreamEvents(
        data.map((streamEventData) => new StreamEvent(streamEventData))
      );
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }

    // NOTE: This could technically cause a bug if dependencies change (but they won't)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveStreamEvent(streamEvent, repeatOnFailure = true) {
    try {
      setLoading(true);

      streamEvent = { ...streamEvent };
      delete streamEvent.streamer;

      // NOTE: Must refresh firebase ID token before requests that require authentication
      getIdToken(getAuth().currentUser);

      const response = await fetch("/api/stream-events", {
        method: streamEvent.id ? "PUT" : "POST",
        body: JSON.stringify({
          ...streamEvent,
          start: streamEvent.start.toISOString().slice(0, 19).replace("T", " "),
          end: streamEvent.end.toISOString().slice(0, 19).replace("T", " "),
        }),
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        // NOTE: Likely the expired token bug
        if (response.status === 401 || response.status === 403) {
          if (repeatOnFailure && (await reauthenticate())) {
            return await saveStreamEvent(streamEvent, false);
          }
        }
        throw new Error(data.error);
      }
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }

  const deleteStreamEvent = useCallback(
    async (streamEvent, repeatOnFailure = true) => {
      setLoading(true);

      streamEvent = { ...streamEvent };
      delete streamEvent.streamer;

      try {
        // NOTE: Must refresh firebase ID token before requests that require authentication
        getIdToken(getAuth().currentUser);

        const response = await fetch("/api/stream-events", {
          method: "DELETE",
          body: JSON.stringify(streamEvent),
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // NOTE: Likely the expired token bug
            if (repeatOnFailure && (await reauthenticate())) {
              return await deleteStreamEvent(streamEvent, false);
            }
          }
          throw new Error(data.error);
        }

        return data;
      } catch (e) {
        throw e;
      } finally {
        setLoading(false);
      }
    }
  );

  return (
    <StreamEventContext.Provider
      value={{
        loading,
        streamEvents,
        readAll,
        validate,
        saveStreamEvent,
        deleteStreamEvent,
        StreamEvent,
      }}
    >
      {children}
    </StreamEventContext.Provider>
  );
}
