import { useMemo } from "react";
import ChatRoomApp from "react-firebase-chat";
import { tryOperation } from "../../utils/utils";
import modernSlateBlueChat from "./themes/modern-slate-blue.module.scss";

const chatThemes = [
  { id: "default", name: "Default" },
  {
    id: "modern-slate-blue",
    name: "Modern Slate Blue",
    className: modernSlateBlueChat.modern,
  },
];

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
    [readAll, readAllSettings, readLiveChannel, setErrors, user?.isStreamer],
  );

  return useMemo(
    () => (
      <ChatRoomApp
        klipyApiKey={import.meta.env.VITE_KLIPY_API_KEY}
        className={[className, isFullscreen ? theme.fullscreen : ""]
          .filter(Boolean)
          .join(" ")}
        onUserChange={(authUser, userData) => {
          tryOperation(async () => {
            await updateAuth(authUser, userData);
          }, setErrors);
        }}
        callbacks={callbacks}
        callbackToTrigger={callbackToTrigger}
        headerLinks={headerLinks}
        themes={chatThemes}
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
    ],
  );
}
