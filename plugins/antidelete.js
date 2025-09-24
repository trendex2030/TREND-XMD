// 📂 plugins/antidelete.js
import pkg from "@whiskeysockets/baileys";
const { proto, downloadContentFromMessage } = pkg;
import config from "../config.cjs";

let antiDeleteEnabled = false;
let cache = new Map(); // store messages temporarily

// Collect media stream into buffer
async function collectStream(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const AntiDelete = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = body.slice(prefix.length + cmd.length).trim().toLowerCase();

  // ===== COMMAND HANDLER =====
  if (cmd === "antidelete") {
    switch (text) {
      case "on":
        antiDeleteEnabled = true;
        await m.reply("🛡️ Anti-Delete is now *ON*.\nDeleted messages will be recovered.");
        break;

      case "off":
        antiDeleteEnabled = false;
        cache.clear();
        await m.reply("⚠️ Anti-Delete is now *OFF*.");
        break;

      case "stats":
        await m.reply(
          `📊 Anti-Delete Status:\n` +
          `• Status: ${antiDeleteEnabled ? "🟢 Active" : "🔴 Inactive"}\n` +
          `• Cached: ${cache.size} messages`
        );
        break;

      default:
        await m.reply(
          `🛡️ *Anti-Delete Commands* 🛡️\n\n` +
          `• ${prefix}antidelete on → Enable\n` +
          `• ${prefix}antidelete off → Disable\n` +
          `• ${prefix}antidelete stats → Show stats`
        );
    }
    return;
  }
};

// ====== EVENT LISTENERS (bind once in index.js) ======
export function bindAntiDelete(Matrix) {
  // Cache incoming messages
  Matrix.ev.on("messages.upsert", async ({ messages }) => {
    if (!antiDeleteEnabled || !messages) return;
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;

        let type = Object.keys(msg.message)[0];
        let content = null;
        let media = null;
        let mimetype = null;

        if (["imageMessage", "videoMessage", "stickerMessage", "documentMessage", "audioMessage"].includes(type)) {
          const stream = await downloadContentFromMessage(msg.message[type], type.replace("Message", ""));
          media = await collectStream(stream);
          mimetype = msg.message[type].mimetype;
        } else if (msg.message.conversation) {
          content = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
          content = msg.message.extendedTextMessage.text;
        }

        cache.set(msg.key.id, {
          type,
          content,
          media,
          mimetype,
          sender: msg.key.participant || msg.key.remoteJid,
          chat: msg.key.remoteJid,
          timestamp: msg.messageTimestamp * 1000
        });

        if (cache.size > 500) cache.delete([...cache.keys()][0]); // limit cache
      } catch (err) {
        console.error("📥 Cache error:", err);
      }
    }
  });

  // Recover deleted messages
  Matrix.ev.on("messages.update", async updates => {
    if (!antiDeleteEnabled || !updates) return;
    for (const { key, update } of updates) {
      try {
        const isDeleted =
          update?.status === proto.WebMessageInfo.Status.DELETED ||
          update?.messageStubType === proto.WebMessageInfo.StubType.REVOKE;

        if (!isDeleted || !cache.has(key.id)) continue;

        const cached = cache.get(key.id);
        cache.delete(key.id);

        const destination = config.OWNER_NUMBER + "@s.whatsapp.net"; // send to your inbox
        const sender = cached.sender?.split("@")[0];

        // Alert
        await Matrix.sendMessage(destination, {
          text:
            `🚨 *Deleted Message Recovered!*\n` +
            `• 👤 Sender: @${sender}\n` +
            `• 📅 Time: ${new Date(cached.timestamp).toLocaleString()}\n` +
            (cached.content ? `• 📝 Content: ${cached.content}` : ""),
          mentions: [cached.sender]
        });

        // Media resend
        if (cached.media) {
          await Matrix.sendMessage(destination, {
            [cached.type.replace("Message", "")]: cached.media,
            mimetype: cached.mimetype,
            caption: cached.type === "imageMessage" || cached.type === "videoMessage" ? "📌 Recovered Media" : ""
          });
        }
      } catch (err) {
        console.error("♻️ Recovery error:", err);
      }
    }
  });
}

export default AntiDelete;
