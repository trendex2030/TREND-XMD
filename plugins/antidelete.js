// 📂 plugins/antidelete.js
import pkg from "@whiskeysockets/baileys";
const { downloadContentFromMessage, proto } = pkg;
import config from "../config.cjs";

let antiDeleteEnabled = false;
let cache = new Map(); // key = chatId + messageId

// Helper: collect stream into buffer
async function collectStream(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const AntiDelete = async (m) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = body.slice(prefix.length + cmd.length).trim().toLowerCase();

  if (cmd === "antidelete") {
    if (text === "on") {
      antiDeleteEnabled = true;
      return m.reply("🛡️ Anti-Delete is now *ON*.\nDeleted messages will be sent to your inbox.");
    }
    if (text === "off") {
      antiDeleteEnabled = false;
      cache.clear();
      return m.reply("⚠️ Anti-Delete is now *OFF*.");
    }
    if (text === "stats") {
      return m.reply(
        `📊 Anti-Delete Status:\n` +
        `• Status: ${antiDeleteEnabled ? "🟢 Active" : "🔴 Inactive"}\n` +
        `• Cached: ${cache.size} messages`
      );
    }
    return m.reply(
      `🛡️ *Anti-Delete Commands* 🛡️\n\n` +
      `• ${prefix}antidelete on → Enable\n` +
      `• ${prefix}antidelete off → Disable\n` +
      `• ${prefix}antidelete stats → Show stats`
    );
  }
};

// ====== Bind events ======
export function bindAntiDelete(Matrix) {
  // Cache incoming messages
  Matrix.ev.on("messages.upsert", async ({ messages }) => {
    if (!antiDeleteEnabled) return;
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;

        const keyId = msg.key.id;
        const chatId = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];

        let content = null, media = null, mimetype = null;

        if (["imageMessage", "videoMessage", "stickerMessage", "documentMessage", "audioMessage"].includes(type)) {
          const stream = await downloadContentFromMessage(msg.message[type], type.replace("Message", ""));
          media = await collectStream(stream);
          mimetype = msg.message[type].mimetype;
        } else if (msg.message.conversation) {
          content = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
          content = msg.message.extendedTextMessage.text;
        }

        cache.set(chatId + keyId, {
          type,
          content,
          media,
          mimetype,
          sender: msg.key.participant || msg.key.remoteJid,
          chat: chatId,
          timestamp: msg.messageTimestamp * 1000,
        });

        if (cache.size > 500) cache.delete([...cache.keys()][0]); // prevent memory leak
      } catch (err) {
        console.error("📥 Cache error:", err);
      }
    }
  });

  // Recover when deleted
  Matrix.ev.on("messages.update", async (updates) => {
    if (!antiDeleteEnabled) return;
    for (const { key, update } of updates) {
      try {
        const revoked =
          update?.messageStubType === proto.WebMessageInfo.StubType.REVOKE ||
          update?.message?.protocolMessage?.type === proto.Message.ProtocolMessage.Type.REVOKE;

        if (!revoked) continue;

        const cached = cache.get(key.remoteJid + key.id);
        if (!cached) continue;
        cache.delete(key.remoteJid + key.id);

        const destination = config.OWNER_NUMBER + "@s.whatsapp.net";
        const sender = cached.sender?.split("@")[0];

        // Send recovered text
        await Matrix.sendMessage(destination, {
          text:
            `🚨 *Deleted Message Recovered!*\n\n` +
            `👤 Sender: @${sender}\n` +
            `💬 Content: ${cached.content || "[Media]"}\n` +
            `🕒 Time: ${new Date(cached.timestamp).toLocaleString()}`,
          mentions: [cached.sender],
        });

        // Send recovered media if exists
        if (cached.media) {
          const msgObj = {};
          if (cached.type === "imageMessage") msgObj.image = cached.media;
          if (cached.type === "videoMessage") msgObj.video = cached.media;
          if (cached.type === "stickerMessage") msgObj.sticker = cached.media;
          if (cached.type === "documentMessage") msgObj.document = cached.media;
          if (cached.type === "audioMessage") msgObj.audio = cached.media;

          msgObj.mimetype = cached.mimetype;
          msgObj.caption = "📌 Recovered Media";

          await Matrix.sendMessage(destination, msgObj);
        }
      } catch (err) {
        console.error("♻️ Recovery error:", err);
      }
    }
  });
}

export default AntiDelete;
