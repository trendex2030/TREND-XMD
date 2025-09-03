import axios from "axios";
import config from "../config.cjs";

const repo = async (m, sock) => {
  const prefix = config.PREFIX || ".";
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  if (cmd !== "repo") return;

  try {
    await m.React("📁");

    const owner = config.OWNER_NAME || "TRENDEX";
    const githubRepo = "https://github.com/trendex2030/TREND-XMD";
    const apiUrl = "https://api.github.com/repos/trendex2030/TREND-XMD";
    const imageUrl = "https://files.catbox.moe/j2h8dg.jpg";

    // ✅ fetch repo data via GitHub API
    const { data } = await axios.get(apiUrl);

    const repoText = `
┏▣ *🔹 BOT REPOSITORY 🔹*
│
│🔸 *Name:* ${data.name}
│🔸 *Stars:* ${data.stargazers_count}
│🔸 *Forks:* ${data.forks_count}
│🔸 *GitHub Link:* ${githubRepo}
│🔸 *Owner:* ${owner}
│🔸 *Prefix:* ${prefix}
│🔸 *Version:* 2.0
│🔸 *Type:* Public • Open Source
┗▣

@${m.sender.split("@")[0]} 👋, Don't forget to star and fork my repository!
💡 Report bugs using: *${prefix}report [your bug here]*
    `.trim();

    // 🖼️ Repo image
    await sock.sendMessage(
      m.from,
      {
        image: { url: imageUrl },
        caption: repoText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "TREND-X",
            newsletterJid: "120363401765045963@newsletter",
          },
        },
      },
      { quoted: m }
    );

    // 🎵 Random song
    const songUrls = [
      "",
      "",
      "",
      "",
    ];
    const randomSong = songUrls[Math.floor(Math.random() * songUrls.length)];

    await sock.sendMessage(
      m.from,
      {
        audio: { url: randomSong },
        mimetype: "audio/mpeg",
        ptt: false,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "TREND-X",
            newsletterJid: "120363401765045963@newsletter",
          },
        },
      },
      { quoted: m }
    );
  } catch (err) {
    console.error("❌ Error in .repo command:", err.message);
    await m.reply("❌ Failed to load repository info.");
  }
};

export default repo;
