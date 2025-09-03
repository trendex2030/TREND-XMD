import axios from "axios";
import config from "../config.cjs";

const igdl = async (m, sock) => {
  const prefix = config.PREFIX || ".";
  const body = m.body || "";
  const args = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/ +/) : [];
  const cmd = args.shift()?.toLowerCase();

  if (cmd !== "ig" && cmd !== "instagram" && cmd !== "reel") return;

  try {
    if (!args[0]) {
      return await m.reply(`📸 Usage: *${prefix}${cmd} <instagram reel url>*`);
    }

    const url = args[0];

    await m.React("⏳");

    // ✅ Using API (no login required)
    const api = `https://api.davidcyriltech.my.id/instagram?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(api);

    if (!data || !data.result || data.result.length === 0) {
      await m.reply("❌ Failed to fetch video. Make sure the link is correct and public.");
      return;
    }

    const videoUrl = data.result[0].url;

    await sock.sendMessage(
      m.from,
      {
        video: { url: videoUrl },
        caption: `✅ *Instagram Reel Downloaded*\n\n🔗 ${url}`,
      },
      { quoted: m }
    );

    await m.React("✅");
  } catch (err) {
    console.error("❌ Error in .ig command:", err.message);
    await m.reply("❌ Failed to download Instagram Reel.");
  }
};

export default igdl;
