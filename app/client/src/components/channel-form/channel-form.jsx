import {
  MdFileCopy as FileCopy,
  MdBadge as Badge,
  MdLink as Link,
  MdShare as Share,
  MdVpnKey as VpnKey,
} from "react-icons/md";
import { useEffect, useState } from "react";
import css from "./channel-form.module.scss";
import theme from "../../css/theme.module.scss";
import { tryOperation } from "../../utils/utils";

const defaultChannel = {
  name: "",
  service: "",
  source: "",
  streamUrl: "",
  key: "",
};

export function ChannelForm({ useChannels, resetToLive, ...props }) {
  const { readAll, validate, saveChannel, deleteChannel, loading } =
    useChannels();
  const [mode, setMode] = useState(props.mode || "read");
  const [channel, setChannel] = useState(
    props.channel ? { ...props.channel } : { ...defaultChannel }
  );
  const [willFocus, setWillFocus] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // NOTE: Must define properties to avoid bug
    setChannel(props.channel ? { ...props.channel } : { ...defaultChannel });
  }, [props.channel]);

  useEffect(() => {
    if (willFocus) {
      willFocus.focus();
      setWillFocus(null);
    }
  }, [willFocus]);

  function setChannelProperty(e) {
    setChannel((old) => ({ ...old, [e.target.name]: e.target.value }));
  }

  return (
    <form
      className={css.channelForm + " " + css[mode]}
      onSubmit={(e) => {
        e.preventDefault();
        tryOperation(async () => {
          if (mode === "read") {
            setMode("update");
            setWillFocus(e.target.name);
          } else if (mode === "create" || mode === "update") {
            validate(channel);

            await saveChannel(channel);
            await readAll();
            setMode("read");
          }
        }, setErrors);
      }}
    >
      <fieldset disabled={loading}>
        <div className={css.errors}>
          {errors.map((error, i) => (
            <div key={`channel-form-error-message-${i}`}>{error}</div>
          ))}
        </div>
        <label>
          {mode !== "read" && <>Name</>}
          <div>
            {mode !== "read" && <Badge />}

            <input
              name="name"
              value={channel.name}
              onChange={setChannelProperty}
              disabled={mode === "read"}
              autoFocus={true}
            />
          </div>
        </label>
        <label>
          Embed URL
          <div>
            <Share />
            <input
              name="source"
              value={channel.source}
              onChange={setChannelProperty}
              disabled={mode === "read"}
            />{" "}
            {mode === "read" && (
              <FileCopy
                onClick={() => {
                  navigator.clipboard.writeText(channel.source);
                }}
              />
            )}
          </div>
        </label>
        <label>
          Stream URL
          <div>
            <Link />
            <input
              name="streamUrl"
              value={channel.streamUrl}
              onChange={setChannelProperty}
              disabled={mode === "read"}
            />
            {mode === "read" && (
              <FileCopy
                onClick={() => {
                  navigator.clipboard.writeText(channel.streamUrl);
                }}
              />
            )}
          </div>
        </label>
        <label>
          Stream Key
          <div>
            <VpnKey />
            <input
              name="key"
              value={channel.key}
              onChange={setChannelProperty}
              disabled={mode === "read"}
            />
            {mode === "read" && (
              <FileCopy
                onClick={() => {
                  navigator.clipboard.writeText(channel.key);
                }}
              />
            )}
          </div>
        </label>

        {mode === "create" || mode === "update" ? (
          <button className={loading ? theme.loading : ""}>Save</button>
        ) : (
          <>
            <button
              className={`${theme.dangerBg} ${theme.leftButton} ${
                loading ? theme.loading : ""
              }`}
              onClick={async (e) => {
                e.preventDefault();

                tryOperation(async () => {
                  await deleteChannel(channel);
                  readAll();
                  resetToLive();
                }, setErrors);
              }}
            >
              Delete
            </button>
            <button className={loading ? theme.loading : ""}>Edit</button>
          </>
        )}
      </fieldset>
    </form>
  );
}
