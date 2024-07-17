import React from "react";
import ReactDOM from "react-dom/client";
import StreamSiteApp from ".";
import DiscordIcon from "./img/discord-icon.svg";
import SteamIcon from "./img/steam-icon.svg";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <StreamSiteApp
    footerLinks={[
      <a
        key={`footer-link-0`}
        href={import.meta.VITE_DISCORD_URL}
        target="_blank"
        rel="noreferrer"
      >
        <img src={DiscordIcon} />
      </a>,
      <a
        key={`footer-link-1`}
        href={import.meta.VITE_STEAM_GROUP_URL}
        target="_blank"
        rel="noreferrer"
      >
        <img src={SteamIcon} />
      </a>,
    ]}
  />
  // </React.StrictMode>
);
