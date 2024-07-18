import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ChannelContext = createContext(null);

export function useChannels() {
  return useContext(ChannelContext);
}

function validate(channel) {
  const errors = [];

  if (!channel.name) {
    errors.push(new Error("Please enter a channel name."));
  }

  if (!channel.source) {
    errors.push(new Error("Please enter the embed URL."));
  }

  if (errors.length) {
    throw errors;
  }

  return true;
}

/**
 * @param {{
 *  useAuth: () => object,
 *  setErrors: (errors: Error[]) => void,
 *  children: import("react").ReactElement[]
 * }} props
 */
export function ChannelProvider({ useAuth, setErrors, children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [liveChannel, setLiveChannel] = useState(null);

  // NOTE: Must memoize to fix dependency warnings
  const readAll = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/channels/all", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setChannels(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const readLiveChannel = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await fetch("/api/channels/live", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (forceRefresh && data.source) {
        const url = new URL(data.source);
        url.searchParams.set("x-stream-site-refresh-key", Math.random());
        data.source = url.href;
      }

      setLiveChannel(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setErrors([]);

        await readLiveChannel();

        if (user?.isStreamer) {
          await readAll();
        }
      } catch (e) {
        console.error(e);
        setErrors([e]);
      }
    })();
  }, [user?.isStreamer, readAll, readLiveChannel, setErrors]);

  const saveChannel = useCallback(async (channel) => {
    try {
      setLoading(true);
      const response = await fetch("/api/channels", {
        method: channel.id ? "PUT" : "POST",
        body: JSON.stringify(channel),
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        // if (response.status === 401 || response.status === 403) {
        //   // NOTE: Likely the expired token bug
        //   if (repeatOnFailure && (await reauthenticate())) {
        //     return await saveChannel(false);
        //   }
        // }
        throw new Error(data.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChannel = useCallback(async (channel) => {
    try {
      setLoading(true);
      const response = await fetch("/api/channels", {
        method: "DELETE",
        body: JSON.stringify(channel),
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ChannelContext.Provider
      value={{
        loading,
        channels,
        liveChannel,
        readLiveChannel,
        setLiveChannel,
        readAll,
        validate,
        saveChannel,
        deleteChannel,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}
