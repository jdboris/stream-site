import { StreamSiteApp } from "@jdboris/stream-site";
import DiscordIcon from "./discord-icon.svg";
import SteamIcon from "./steam-icon.svg";

function App() {
  return (
    <StreamSiteApp
      footerLinks={[
        <a href="https://discord.gg/9KQd2AB3ZA" target="_blank" rel="noreferrer">
          <img src={DiscordIcon} />
        </a>,
        <a
          href="https://steamcommunity.com/groups/xxxxxxxx-2"
          target="_blank"
          rel="noreferrer"
        >
          <img src={SteamIcon} />
        </a>,
      ]}
    />
  );
}

export default App;
