import ChatRoomApp from "react-firebase-chat";
import { useMemo } from "react";
import { tryOperation } from "../../utils/utils";

export function Chat({
  theme,
  isFullscreen,
  className,
  useAuth,
  useChannels,
  useSettings,
  setErrors,
  callbackToTrigger,
  headerLinks,
}) {
  const { user, updateAuth } = useAuth();
  const { readLiveChannel, readAll } = useChannels();
  const { readAll: readAllSettings } = useSettings();

  const callbacks = useMemo(
    () => ({
      async refreshStream() {
        try {
          setErrors([]);
          await readLiveChannel();
          if (user?.isStreamer) {
            await readAll();
            await readAllSettings();
          }
        } catch (e) {
          setErrors([e.message]);
        }
      },
      refreshSite() {
        location.reload();
      },
    }),
    [readAll, readAllSettings, readLiveChannel, setErrors, user?.isStreamer]
  );

  return useMemo(
    () => (
      <ChatRoomApp
        className={className + " " + (isFullscreen ? theme.fullscreen : "")}
        onUserChange={(authUser, userData) => {
          tryOperation(async () => {
            await updateAuth(authUser, userData);
          }, setErrors);
        }}
        callbacks={callbacks}
        callbackToTrigger={callbackToTrigger}
        headerLinks={headerLinks}
      />
    ),

    [
      className,
      isFullscreen,
      theme?.fullscreen,
      callbacks,
      callbackToTrigger,
      headerLinks,
      setErrors,
      updateAuth,
    ]
  );
}
