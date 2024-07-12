import {
  MdFitScreen,
  MdOutlineFitScreen,
  MdAdd,
  MdRefresh,
} from "react-icons/md";
import { useChannels } from "../../contexts/channels";
import { useSettings } from "../../contexts/settings";
import { ChannelForm } from "../channel-form";
import { ChannelSelector } from "../channel-selector";
import css from "./stream-controls.module.scss";
import { useCallback } from "react";

let keyCounter = 0;
function uniqueKey() {
  return keyCounter++;
}

export function StreamControls({
  useAuth,
  setStreamModalMessages,
  setErrors,
  setCallbackToTrigger,
  maxWidth,
  setMaxWidth,
}) {
  const { user } = useAuth();
  const { readLiveChannel, readAll } = useChannels();
  const { readAll: readAllSettings } = useSettings();

  const refreshStream = useCallback(async () => {
    try {
      setErrors([]);
      await readLiveChannel(true);
      if (user?.isStreamer) {
        await readAll();
        await readAllSettings();
      }
    } catch (e) {
      setErrors([e.message]);
    }
  }, [readAll, readAllSettings, readLiveChannel, setErrors, user?.isStreamer]);

  return (
    <div className={css.streamControls}>
      {user && (user.isStreamer || user.isAdmin) ? (
        <ChannelSelector
          useSettings={useSettings}
          useChannels={useChannels}
          showInModal={(contents) => {
            setStreamModalMessages(contents ? [contents] : []);
          }}
          setErrors={setErrors}
          setCallbackToTrigger={setCallbackToTrigger}
        >
          <MdAdd
            onClick={async () => {
              setStreamModalMessages([
                <ChannelForm
                  mode="create"
                  useChannels={useChannels}
                  // NOTE: Required to fix props not updating bug
                  key={uniqueKey()}
                />,
              ]);
            }}
          />
        </ChannelSelector>
      ) : (
        <></>
      )}{" "}
      {maxWidth ? (
        <MdFitScreen
          onClick={() => {
            setMaxWidth(null);
            localStorage.setItem("fitMode", "0");
          }}
        />
      ) : (
        <MdOutlineFitScreen
          onClick={() => {
            setMaxWidth("100%");
            localStorage.setItem("fitMode", "1");
          }}
        />
      )}
      <MdRefresh
        onClick={() => {
          refreshStream();
        }}
      />
    </div>
  );
}
