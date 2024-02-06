import React from "react";
import ReactDOM from "react-dom/client";
import StreamSiteApp from "@jdboris/stream-site";
import DiscordIcon from "./discord-icon.svg";
import SteamIcon from "./steam-icon.svg";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StreamSiteApp
      footerLinks={[
        <a
          key={`footer-link-0`}
          href="https://discord.gg/9KQd2AB3ZA"
          target="_blank"
          rel="noreferrer"
        >
          <img src={DiscordIcon} />
        </a>,
        <a
          key={`footer-link-1`}
          href="https://steamcommunity.com/groups/xxxxxxxx-2"
          target="_blank"
          rel="noreferrer"
        >
          <img src={SteamIcon} />
        </a>,
      ]}
    />
  </React.StrictMode>
);
