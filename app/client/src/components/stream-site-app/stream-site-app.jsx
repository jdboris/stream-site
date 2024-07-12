import "normalize.css";
import { useState } from "react";
import { HiExternalLink } from "react-icons/hi";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChannelProvider, useChannels } from "../../contexts/channels";
import {
  FirebaseAuthProvider,
  useFirebaseAuth,
} from "../../contexts/firebase-auth";
import { SettingsProvider, useSettings } from "../../contexts/settings";
import {
  StreamEventProvider,
  useStreamEvents,
} from "../../contexts/stream-events";
import {
  SuggestionsProvider,
  useSuggestions,
} from "../../contexts/suggestions";
import theme from "../../css/theme.module.scss";
import { Banner } from "../banner";
import { Chat } from "../chat";
import { Schedule } from "../schedule";
import { StreamControls } from "../stream-controls/stream-controls";
import { Stream } from "../stream/stream";
import { SuggestionBox } from "../suggestion-box";
import css from "./stream-site-app.module.scss";

function StreamSitePage({
  footerLinks,
  errors,
  setErrors,
  streamErrors,
  setStreamErrors,
  callbackToTrigger,
  setCallbackToTrigger,
}) {
  const [streamModalMessages, setStreamModalMessages] = useState([]);
  const [maxWidth, setMaxWidth] = useState(
    localStorage.getItem("fitMode") === "1" ? "100%" : null
  );

  return (
    <div className={css.streamSite}>
      <header className={theme.theme}>
        {<Banner useSettings={useSettings} useAuth={useFirebaseAuth} />}
      </header>
      <main className={theme.container} style={maxWidth ? { maxWidth } : {}}>
        <div className={css.wrapper}>
          <Stream
            className={css.stream + " " + theme.theme}
            useChannels={useChannels}
            modalMessages={streamModalMessages}
            errors={[...errors, ...streamErrors]}
          />
          <Chat
            className={css.chat}
            useAuth={useFirebaseAuth}
            useChannels={useChannels}
            useSettings={useSettings}
            setErrors={setErrors}
            callbackToTrigger={callbackToTrigger}
            headerLinks={[
              <a
                key={`chat-header-link-0`}
                href="/chat"
                target="_blank"
                rel="noreferrer"
              >
                <HiExternalLink />
              </a>,
            ]}
          />
        </div>

        <div className={theme.theme + " " + css.row}>
          <StreamControls
            useAuth={useFirebaseAuth}
            setStreamModalMessages={setStreamModalMessages}
            setErrors={setStreamErrors}
            setCallbackToTrigger={setCallbackToTrigger}
            maxWidth={maxWidth}
            setMaxWidth={setMaxWidth}
          />
        </div>
        <div className={theme.theme + " " + theme.container + " " + css.row}>
          <StreamEventProvider useAuth={useFirebaseAuth}>
            <Schedule
              useStreamEvents={useStreamEvents}
              useAuth={useFirebaseAuth}
            />
          </StreamEventProvider>
          <section className={theme.column}>
            <SuggestionsProvider>
              <SuggestionBox
                useAuth={useFirebaseAuth}
                useSuggestions={useSuggestions}
              />
            </SuggestionsProvider>
            <footer>
              <nav>{footerLinks}</nav>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function StreamSiteApp({ footerLinks }) {
  const [errors, setErrors] = useState([]);
  const [streamErrors, setStreamErrors] = useState([]);
  const [callbackToTrigger, setCallbackToTrigger] = useState(null);

  return (
    <BrowserRouter>
      <FirebaseAuthProvider>
        <SettingsProvider
          streamErrors={streamErrors}
          setErrors={setStreamErrors}
        >
          <ChannelProvider
            useAuth={useFirebaseAuth}
            setErrors={setStreamErrors}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <StreamSitePage
                    footerLinks={footerLinks}
                    errors={errors}
                    setErrors={setErrors}
                    streamErrors={streamErrors}
                    setStreamErrors={setStreamErrors}
                    callbackToTrigger={callbackToTrigger}
                    setCallbackToTrigger={setCallbackToTrigger}
                  />
                }
              />
              <Route
                path="/chat"
                element={
                  <Chat
                    theme={theme}
                    isFullscreen={true}
                    className={css.chat}
                    useAuth={useFirebaseAuth}
                    useChannels={useChannels}
                    useSettings={useSettings}
                    setErrors={setErrors}
                    callbackToTrigger={callbackToTrigger}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ChannelProvider>
        </SettingsProvider>
      </FirebaseAuthProvider>
    </BrowserRouter>
  );
}
