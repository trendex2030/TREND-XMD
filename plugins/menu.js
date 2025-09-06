import config from "../config.cjs";
import moment from "moment-timezone";

let antiDeleteMode = "off"; // default

const trendxPlugin = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");
  const text = args.join(" ");

  switch (cmd) {
    // 📜 MENU
    case "menu": {
      const start = new Date().getTime();
      await m.React?.("🪀");
      const end = new Date().getTime();
      const responseTime = ((end - start) / 1000).toFixed(2);

      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptime = `${hours}h ${minutes}m ${seconds}s`;

      let profilePictureUrl = "https://files.catbox.moe/j2h8dg.jpg";
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const pp = await sock.profilePictureUrl(m.sender, "image", {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (pp) profilePictureUrl = pp;
      } catch (error) {
        console.log("🖼️ Profile pic fetch failed.");
      }

      const menuText = `
┏▣ ─── 𝙏𝙍𝙀𝙉𝘿-𝙓 ──────
│   𓅓 ʙᴏᴛ : *TREND-X*
│ ⏱️ ʀᴜɴᴛɪᴍᴇ : ${uptime}
│ ⚡ sᴘᴇᴇᴅ : ${responseTime}s
│ 🌐 ᴍᴏᴅᴇ : public
│ 🧩 ᴘʀᴇғɪx : ${prefix}
│ 𓅓 ᴏᴡɴᴇʀ : TREND-X
│ 🛠️ ᴅᴇᴠ : *ᴘᴏᴘᴋɪᴅ*
│ 🧪 ᴠᴇʀ : *2.0.0*
┗▣───────────────⭓
...
(keep your long menu content here)
...
┗▣━━━━━━━━━━━━━━━━━━
│𓅓 *TREND-X* 𓅓
┗▣━━━━━━━━━━━━━━━━━━
      `.trim();

      const newsletterContext = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "TREND-X",
          newsletterJid: "120363401765045963@newsletter",
        },
      };

      await sock.sendMessage(
        m.from,
        {
          image: { url: profilePictureUrl },
          caption: menuText,
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );

      const songUrls = [
        "https://files.catbox.moe/2b33jv.mp3",
        "https://files.catbox.moe/0cbqfa.mp3",
        "https://files.catbox.moe/j4ids2.mp3",
        "https://files.catbox.moe/vv2qla.mp3",
      ];
      const random = songUrls[Math.floor(Math.random() * songUrls.length)];

      await sock.sendMessage(
        m.from,
        {
          audio: { url: random },
          mimetype: "audio/mpeg",
          ptt: false,
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
      break;
    }

    // 🧹 Delete bot messages
    case "del": {
      if (!m.quoted) {
        await sock.sendMessage(
          m.chat,
          { text: "❌ Reply to a bot message to delete." },
          { quoted: m }
        );
        break;
      }
      try {
        await sock.sendMessage(m.chat, { delete: m.quoted.key });
      } catch (err) {
        console.error("❌ Error in del:", err);
      }
      break;
    }

    // 🔒 Block
    case "block": {
      if (!m.isOwner)
        return sock.sendMessage(
          m.chat,
          { text: "❌ Owner only." },
          { quoted: m }
        );
      if (!m.quoted && !m.mentionedJid[0] && !text) {
        await sock.sendMessage(
          m.chat,
          { text: "Reply/mention/user ID to block." },
          { quoted: m }
        );
        break;
      }
      const userId =
        m.mentionedJid[0] ||
        m.quoted?.sender ||
        (text.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
      await sock.updateBlockStatus(userId, "block");
      await sock.sendMessage(
        m.chat,
        { text: "✅ User blocked." },
        { quoted: m }
      );
      break;
    }

    // 👀 Read ViewOnce
    case "readviewonce":
    case "vv": {
      if (!m.quoted) {
        await sock.sendMessage(
          m.chat,
          { text: "❌ Reply to a ViewOnce message." },
          { quoted: m }
        );
        break;
      }
      const quotedMsg = m.msg?.contextInfo?.quotedMessage;
      if (!quotedMsg) {
        await sock.sendMessage(
          m.chat,
          { text: "❌ No media found." },
          { quoted: m }
        );
        break;
      }

      try {
        if (quotedMsg.imageMessage) {
          let img = await sock.downloadAndSaveMediaMessage(
            quotedMsg.imageMessage
          );
          await sock.sendMessage(
            m.chat,
            {
              image: { url: img },
              caption: quotedMsg.imageMessage.caption || "",
            },
            { quoted: m }
          );
        }
        if (quotedMsg.videoMessage) {
          let vid = await sock.downloadAndSaveMediaMessage(
            quotedMsg.videoMessage
          );
          await sock.sendMessage(
            m.chat,
            {
              video: { url: vid },
              caption: quotedMsg.videoMessage.caption || "",
            },
            { quoted: m }
          );
        }
        if (quotedMsg.audioMessage) {
          let aud = await sock.downloadAndSaveMediaMessage(
            quotedMsg.audioMessage
          );
          await sock.sendMessage(
            m.chat,
            { audio: { url: aud }, mimetype: "audio/mp4" },
            { quoted: m }
          );
        }
      } catch (err) {
        console.error("❌ VV error:", err);
        await sock.sendMessage(
          m.chat,
          { text: "❌ Failed to process view-once." },
          { quoted: m }
        );
      }
      break;
    }

    // 👑 Owner
    case "owner": {
      try {
        const ownerNumber =
          global.ownernumber && typeof global.ownernumber === "string"
            ? global.ownernumber
            : "";
        const ownerJid = ownerNumber.includes("@")
          ? ownerNumber
          : `${ownerNumber}@s.whatsapp.net`;
        const displayName = await sock.getName(ownerJid);

        await sock.sendMessage(
          m.chat,
          {
            contacts: {
              displayName: displayName || global.ownername || "Owner",
              contacts: [
                {
                  vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${
                    global.ownername || "Owner"
                  }\nFN:${
                    global.ownername || "Owner"
                  }\nitem1.TEL;waid=${ownerJid.split("@")[0]}:${
                    ownerJid.split("@")[0]
                  }\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
                },
              ],
            },
          },
          { quoted: m }
        );
      } catch (err) {
        console.error("❌ Owner error:", err);
        await sock.sendMessage(
          m.chat,
          { text: `*Error:* ${err.message}` },
          { quoted: m }
        );
      }
      break;
    }

    // 🚨 Anti-delete toggle
    case "antidelete": {
      if (!m.isOwner)
        return sock.sendMessage(
          m.chat,
          { text: "❌ Owner only." },
          { quoted: m }
        );
      if (!args[0]) {
        await sock.sendMessage(
          m.chat,
          { text: `Usage: ${prefix}antidelete private/chat/off` },
          { quoted: m }
        );
        break;
      }
      const option = args[0].toLowerCase();
      if (!["private", "chat", "off"].includes(option)) {
        await sock.sendMessage(
          m.chat,
          { text: "❌ Invalid option. Use: private, chat, off" },
          { quoted: m }
        );
        break;
      }
      antiDeleteMode = option;
      await sock.sendMessage(
        m.chat,
        { text: `✅ Anti-delete set to *${option}*` },
        { quoted: m }
      );
      break;
    }
  }
};

// 🌍 Register antidelete globally
export const registerAntiDeleteHandler = (sock) => {
  sock.ev.on("messages.delete", async (item) => {
    try {
      if (antiDeleteMode === "off") return;
      const deletedMsg = item.messages[0];
      if (!deletedMsg?.message) return;

      const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;
      const deletedBy = item.keys[0].participant || item.keys[0].remoteJid;

      const chatName = deletedMsg.key.remoteJid.endsWith("@g.us")
        ? (await sock.groupMetadata(deletedMsg.key.remoteJid)).subject
        : "Private Chat";

      const xtipes = moment
        .tz(deletedMsg.messageTimestamp * 1000, config.TIMEZONE || "Africa/Nairobi")
        .format("HH:mm z");
      const xdptes = moment
        .tz(deletedMsg.messageTimestamp * 1000, config.TIMEZONE || "Africa/Nairobi")
        .format("DD/MM/YYYY");

      let info = `🚨 *DELETED MESSAGE!*\n\nCHAT: ${chatName}\nSENT BY: @${
        sender.split("@")[0]
      }\nTIME: ${xtipes}\nDATE: ${xdptes}\nDELETED BY: @${
        deletedBy.split("@")[0]
      }`;

      const content = deletedMsg.message;
      let target =
        antiDeleteMode === "private" ? sock.user.id : deletedMsg.key.remoteJid;

      if (content.imageMessage || content.videoMessage) {
        const media = await sock.downloadMediaMessage(deletedMsg);
        const cap =
          content.imageMessage?.caption || content.videoMessage?.caption || "";
        await sock.sendMessage(target, {
          [content.imageMessage ? "image" : "video"]: media,
          caption: `${info}\n\n${cap}`,
          mentions: [sender, deletedBy],
        });
      } else if (content.conversation || content.extendedTextMessage?.text) {
        const text = content.conversation || content.extendedTextMessage?.text;
        await sock.sendMessage(target, {
          text: `${info}\n\nMESSAGE: ${text}`,
          mentions: [sender, deletedBy],
        });
      }
    } catch (err) {
      console.error("❌ Anti-delete error:", err);
    }
  });
};

export default trendxPlugin;
