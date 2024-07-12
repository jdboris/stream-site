import { useEffect, useState } from "react";
import theme from "../../css/theme.module.scss";
import { tryOperation } from "../../utils/utils";
import css from "./stream-event-form.module.scss";
import DatePicker from "react-datepicker";
import "./react-datepicker.scss";
import { MdDescription as Description } from "react-icons/md";

export function StreamEventForm({
  event,
  setEvent,
  useStreamEvents,
  defaultMode,
  useAuth,
}) {
  const { readAll, validate, saveStreamEvent, deleteStreamEvent, loading } =
    useStreamEvents();
  const { user } = useAuth();
  const [mode, setMode] = useState(defaultMode || "read");
  const [willFocus, setWillFocus] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (willFocus) {
      willFocus.focus();
      setWillFocus(null);
    }
  }, [willFocus]);

  function setEventProperty(e) {
    setEvent((old) => ({ ...old, [e.target.name]: e.target.value }));
  }

  return (
    <form
      className={css.streamEventForm + " " + css[mode]}
      onSubmit={(e) => {
        e.preventDefault();
        tryOperation(async () => {
          if (mode === "read") {
            setMode("update");
            setWillFocus(e.target.name);
          } else if (mode === "create" || mode === "update") {
            validate(event);
            await saveStreamEvent(event);
            await readAll(
              event.start.getMonth() + 1,
              event.start.getFullYear()
            );
            setEvent(null);
          }
        }, setErrors);
      }}
    >
      <fieldset disabled={loading}>
        <div className={css.errors}>
          {errors.map((error, i) => (
            <div key={`stream-event-form-error-message-${i}`}>{error}</div>
          ))}
        </div>
        {mode === "read" ? (
          <div className={css.title}>{event.title}</div>
        ) : (
          <label>
            Event Title
            <div>
              <Description />
              <input
                name="title"
                value={event.title}
                onChange={setEventProperty}
                disabled={mode === "read"}
                autoFocus={true}
              />
            </div>
          </label>
        )}
        {mode === "read" ? (
          <>
            <div className={css.row}>
              <label>
                {event.start.toLocaleDateString([], { dateStyle: "full" })}
              </label>
            </div>
            <div className={css.row + " " + css.time}>
              <label>
                {event.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                -
                {event.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </label>
            </div>
          </>
        ) : (
          <div className={css.row}>
            <label>
              Start
              <div>
                <DatePicker
                  name="start"
                  selected={event.start}
                  onChange={(date, e) => {
                    setEvent((old) => ({
                      ...old,
                      start: date,
                      end:
                        date > event.end ? new Date(date.getTime()) : event.end,
                    }));
                  }}
                  disabled={mode === "read"}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="Pp"
                />
              </div>
            </label>
            <label>
              End
              <div>
                <DatePicker
                  name="end"
                  selected={event.end}
                  onChange={(date) => {
                    setEvent((old) => ({
                      ...old,
                      end: date,
                      start:
                        date < event.start
                          ? new Date(date.getTime())
                          : event.start,
                    }));
                  }}
                  disabled={mode === "read"}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="Pp"
                />
              </div>
            </label>
          </div>
        )}

        <label>
          <div>Streamer: {event.streamer ? event.streamer.username : null}</div>
        </label>

        {user &&
          (user.isStreamer || user.isAdmin) &&
          (mode === "create" || mode === "update" ? (
            <button className={loading ? theme.loading : ""}>Save</button>
          ) : (
            <>
              <button
                className={
                  theme.dangerBg +
                  " " +
                  theme.leftButton +
                  " " +
                  (loading ? theme.loading : "")
                }
                onClick={(e) => {
                  e.preventDefault();
                  tryOperation(async () => {
                    await deleteStreamEvent(event);
                    await readAll(
                      event.start.getMonth() + 1,
                      event.start.getFullYear()
                    );
                    setEvent(null);
                  }, setErrors);
                }}
              >
                Delete
              </button>
              <button className={loading ? theme.loading : ""}>Edit</button>
            </>
          ))}
      </fieldset>
    </form>
  );
}
