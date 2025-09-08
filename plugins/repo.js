import axios from "axios";
import config from '../config.cjs';

const repo = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  if (["repo", "sc", "script", "info"].includes(cmd)) {
    const githubRepoURL = "https://github.com/trendex2030/TREND-XMD";

    try {
      const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return m.reply("❌ Invalid GitHub URL format.");

      const [, username, repoName] = match;

      const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`);
      if (!response.data) throw new Error("GitHub API request failed.");

      const repoData = response.data;

      const formattedInfo = `*BOT NAME:*\n> ${repoData.name}\n\n*OWNER NAME:*\n> ${repoData.owner.login}\n\n*STARS:*\n> ${repoData.stargazers_count}\n\n*FORKS:*\n> ${repoData.forks_count}\n\n*GITHUB LINK:*\n> ${repoData.html_url}\n\n*DESCRIPTION:*\n> ${repoData.description || "No description"}\n\n*Don't Forget To Star and Fork Repository*\n\n> *© Powered By trendexOfficial 🖤*`;

      await gss.sendMessage(
        m.from,
        {
          image: { url: "https://files.catbox.moe/adymbp.jpg" },
          caption: formattedInfo,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363401765045963@newsletter",
              newsletterName: "TREND-X",
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("Error in repo command:", error);
      m.reply("❌ Failed to fetch repository info. Try again later.");
    }
  }
};

export default repo;