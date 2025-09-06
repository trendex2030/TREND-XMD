import fs from "fs";
import moment from "moment-timezone";

// 🔹 Plugin entry
const trendxPlugin = async (sock, m, prefix) => {
  try {
    const textMsg =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      "";

    m.body = textMsg.trim();
    m.sender = m.key.fromMe
      ? sock.user.id
      : m.key.participant || m.key.remoteJid;

    m.isOwner = [global.ownernumber + "@s.whatsapp.net"].includes(m.sender);

    m.quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ? {
          key: {
            remoteJid: m.message.extendedTextMessage.contextInfo.remoteJid,
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant,
          },
          message: m.message.extendedTextMessage.contextInfo.quotedMessage,
          sender: m.message.extendedTextMessage.contextInfo.participant,
        }
      : null;

    m.mentionedJid =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const isCmd = m.body.startsWith(prefix);
    if (!isCmd) return;

    const args = m.body.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    console.log(`📥 Command: ${cmd}, Args:`, args);

    // --- Commands ---
    switch (cmd) {
      case "menu": {
        const menuText = `
👑 *TREND-X BOT MENU* 👑

📂 *General*
➤ ${prefix}ping
➤ ${prefix}owner
➤ ${prefix}vv / readviewonce
➤ ${prefix}block @user
➤ ${prefix}unblock @user
➤ ${prefix}antidelete [private|chat|off]

⚡ *Admin Tools*
➤ ${prefix}kick
➤ ${prefix}add
➤ ${prefix}promote
➤ ${prefix}demote
➤ ${prefix}tagall
➤ ${prefix}hidetag

🎭 *Fun & Games*
➤ ${prefix}joke
➤ ${prefix}quote
➤ ${prefix}truth
➤ ${prefix}dare

🎶 *Media & Downloads*
➤ ${prefix}play <song name>
➤ ${prefix}video <yt link>
➤ ${prefix}ytmp3 <yt link>
➤ ${prefix}ytmp4 <yt link>

🤖 *AI Features*
➤ ${prefix}ai <ask>
➤ ${prefix}gpt <ask>
➤ ${prefix}img <prompt>
➤ ${prefix}sticker

🛡 *Owner Controls*
➤ ${prefix}broadcast <msg>
➤ ${prefix}restart
➤ ${prefix}shutdown
`;

        await sock.sendMessage(m.key.remoteJid, {
          text: menuText,
        });
        break;
      }

      case "ping": {
        const start = Date.now();
        const uptime = process.uptime(); // in seconds
        const speed = Date.now() - start;
        const days = Math.floor(uptime / (60 * 60 * 24));
        const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        await sock.sendMessage(m.key.remoteJid, {
          text: `🏓 *PONG!*\n⏱ Speed: *${speed}ms*\n⏳ Uptime: *${uptimeStr}*`,
        });
        break;
      }

      case "block": {
        if (!m.isOwner)
          return sock.sendMessage(m.key.remoteJid, { text: "❌ Owner only" });
        const target = m.mentionedJid[0] || (m.quoted && m.quoted.sender);
        if (!target)
          return sock.sendMessage(m.key.remoteJid, {
            text: "❌ Mention or reply a user",
          });

        await sock.updateBlockStatus(target, "block");
        await sock.sendMessage(m.key.remoteJid, {
          text: `✅ Blocked @${target.split("@")[0]}`,
          mentions: [target],
        });
        break;
      }

      case "unblock": {
        if (!m.isOwner)
          return sock.sendMessage(m.key.remoteJid, { text: "❌ Owner only" });
        const target = m.mentionedJid[0] || (m.quoted && m.quoted.sender);
        if (!target)
          return sock.sendMessage(m.key.remoteJid, {
            text: "❌ Mention or reply a user",
          });

        await sock.updateBlockStatus(target, "unblock");
        await sock.sendMessage(m.key.remoteJid, {
          text: `✅ Unblocked @${target.split("@")[0]}`,
          mentions: [target],
        });
        break;
      }

      case "antidelete": {
        if (!m.isOwner)
          return sock.sendMessage(m.key.remoteJid, { text: "❌ Owner only" });
        const option = args[0]?.toLowerCase();
        if (!["private", "chat", "off"].includes(option))
          return sock.sendMessage(m.key.remoteJid, {
            text: "❌ Use: private | chat | off",
          });

        global.antideleteMode = option;
        sock.sendMessage(m.key.remoteJid, {
          text: `✅ Anti-delete set to: *${option}*`,
        });
        break;
      }

      case "owner": {
        try {
          const ownerNum = global.ownernumber || "";
          const ownerName = global.ownername || "TREND-X Owner";

          const ownerJid = ownerNum.includes("@")
            ? ownerNum
            : `${ownerNum}@s.whatsapp.net`;

          const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${ownerName}\nFN:${ownerName}\nitem1.TEL;waid=${ownerJid.split("@")[0]}:${ownerJid.split("@")[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`;

          await sock.sendMessage(m.key.remoteJid, {
            contacts: {
              displayName: ownerName,
              contacts: [{ vcard }],
            },
          });
        } catch (err) {
          console.error("Owner command error:", err);
          await sock.sendMessage(m.key.remoteJid, {
            text: "❌ Failed to send owner contact.",
          });
        }
        break;
      }

      case "vv":
      case "readviewonce": {
        if (!m.quoted || !m.quoted.message?.viewOnceMessageV2) {
          return sock.sendMessage(m.key.remoteJid, {
            text: "❌ Reply to a *ViewOnce* message (image, video, audio).",
          });
        }

        try {
          const msg = m.quoted.message.viewOnceMessageV2.message;
          if (msg.imageMessage) {
            const buffer = await sock.downloadMediaMessage({
              message: msg,
              key: m.quoted.key,
            });
            await sock.sendMessage(m.key.remoteJid, {
              image: buffer,
              caption: msg.imageMessage.caption || "",
            });
          } else if (msg.videoMessage) {
            const buffer = await sock.downloadMediaMessage({
              message: msg,
              key: m.quoted.key,
            });
            await sock.sendMessage(m.key.remoteJid, {
              video: buffer,
              caption: msg.videoMessage.caption || "",
            });
          } else if (msg.audioMessage) {
            const buffer = await sock.downloadMediaMessage({
              message: msg,
              key: m.quoted.key,
            });
            await sock.sendMessage(m.key.remoteJid, {
              audio: buffer,
              mimetype: "audio/mp4",
            });
          } else {
            await sock.sendMessage(m.key.remoteJid, {
              text: "❌ Unsupported ViewOnce type.",
            });
          }
        } catch (err) {
          console.error("VV error:", err);
          await sock.sendMessage(m.key.remoteJid, {
            text: "⚠️ Failed to process ViewOnce.",
          });
        }
        break;
      }
    }
  } catch (e) {
    console.error("Plugin error:", e);
  }
};

// 🔹 Anti-delete handler
export const registerAntiDeleteHandler = (sock) => {
  sock.ev.on("messages.delete", async (item) => {
    if (global.antideleteMode === "off") return;
    const deletedMsg = item.messages[0];
    if (!deletedMsg) return;

    const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;
    const deletedBy = item.keys[0].participant || item.keys[0].remoteJid;
    const chat = deletedMsg.key.remoteJid;

    const xtime = moment(deletedMsg.messageTimestamp * 1000)
      .tz("Africa/Nairobi")
      .format("HH:mm");
    const xdate = moment(deletedMsg.messageTimestamp * 1000).format(
      "DD/MM/YYYY"
    );

    const info = `🚨 *Deleted Message* 🚨\n👤 From: @${sender.split("@")[0]}\n🗑 Deleted by: @${deletedBy.split("@")[0]}\n🕒 ${xtime} | 📅 ${xdate}`;

    const messageContent = deletedMsg.message || {};
    if (messageContent.conversation) {
      const text = messageContent.conversation;
      const targetChat =
        global.antideleteMode === "private" ? sock.user.id : chat;

      await sock.sendMessage(targetChat, {
        text: `${info}\n\n💬 ${text}`,
        mentions: [sender, deletedBy],
      });
    }
  });
};

export default trendxPlugin;
