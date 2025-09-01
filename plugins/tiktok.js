import config from '../config.cjs';
import axios from 'axios';

const tiktokdl = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const q = m.body.split(' ').slice(1).join(' ');
  
  const reply = (text) => sock.sendMessage(m.from, {
    text,
    contextInfo: {
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "TREND-Xmd Updates",
        newsletterJid: "120363401765045963@newsletter"
      }
    }
  }, { quoted: m });

  if (cmd === "tiktokdl" || cmd === "tiktok") {
    if (!q) return reply(
      `🚫 *Missing TikTok Link!*\n\n` +
      `📌 Usage:\n` +
      `\`\`\`${prefix}${cmd} https://vm.tiktok.com/xxxx/\`\`\`\n\n` +
      `⚡ Powered by Bravo`
    );

    if (!q.includes("tiktok.com")) return reply("❗ *Invalid URL Detected!*\nPlease provide a valid TikTok link.");

    await reply("⏳ *Connecting to TikTok Servers...*\n📡 Fetching your video, please hold...");

    try {
      const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.data) return reply("💥 *Failed to download video!*\nTikTok link might be broken or server is offline.");

      const { title, like, comment, share, author, meta } = data.data;
      const videoUrl = meta.media.find(v => v.type === "video")?.org;
      const views = meta?.play_count || 'N/A';

      if (!videoUrl) return reply("🚫 *No video URL found!*\nSomething went wrong retrieving media.");

      const caption =
        `┏━━━━━━━━━━━━━━━┓\n` +
        `   ⚡ *TikTok Video Found!* ⚡\n` +
        `┗━━━━━━━━━━━━━━━┛\n\n` +
        `👤 *Creator:* ${author.nickname} (@${author.username})\n` +
        `📝 *Title:* ${title || 'Untitled'}\n` +
        `👀 *Views:* ${views}\n` +
        `❤️ *Likes:* ${like}\n` +
        `💬 *Comments:* ${comment}\n` +
        `🔁 *Shares:* ${share}\n\n` +
        `🔗 *Link:* ${q}\n` +
        `\n━━━━━━━━━━━━━━━━━━\n` +
        `🧠 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 *BRAVO*`;

      await sock.sendMessage(m.from, {
        video: { url: videoUrl },
        caption: caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          mentionedJid: [m.sender],
          forwardedNewsletterMessageInfo: {
            newsletterName: "🔥TRENDING BRAVO",
            newsletterJid: "120363401765045963@newsletter"
          }
        }
      }, { quoted: m });

    } catch (e) {
      console.error("🔥 TikTok Download Error:", e);
      return reply(`❌ *Internal Error!*\n\`\`\`${e.message}\`\`\``);
    }
  }
};

export default tiktokdl;
