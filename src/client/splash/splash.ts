import { context, requestExpandedMode } from "@devvit/web/client";

{
  const { subredditName, username } = context;
  document.querySelectorAll<HTMLElement>('.placeholder-username').forEach(m => m.innerText = username ?? '[Anonymous]');
  document.querySelectorAll<HTMLElement>('.placeholder-subredditName').forEach(m => m.innerText = subredditName);
}

// const docsLink = document.getElementById("docs-link") as HTMLDivElement;
// const playtestLink = document.getElementById("playtest-link") as HTMLDivElement;
// const discordLink = document.getElementById("discord-link") as HTMLDivElement;
const startButton = document.getElementById("start-button") as HTMLButtonElement;

startButton.addEventListener("click", (e) => { requestExpandedMode(e, "game"); });

// docsLink.addEventListener("click", () => { navigateTo("https://developers.reddit.com/docs"); });
// playtestLink.addEventListener("click", () => { navigateTo("https://www.reddit.com/r/Devvit"); });
// discordLink.addEventListener("click", () => { navigateTo("https://discord.com/invite/R7yu2wh9Qz"); });

const titleElement = document.getElementById("title") as HTMLHeadingElement;

function init() {
  titleElement.textContent = `Hey ${context.username ?? "user"} 👋`;
}

init();
