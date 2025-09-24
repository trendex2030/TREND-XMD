// anti-delete.js
import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;
import config from '../config.cjs';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), "antidelete.json");

class AntiDeleteSystem {
  constructor() {
    this.enabled = config.ANTI_DELETE || false;
    this.cacheExpiry = 1800000; // 30 mins
    this.messageCache = new Map();
    this.cleanupTimer = null;
    this.isSaving = false;
    this.saveQueue = [];

    this.loadDatabase();
    this.startCleanup();
    console.log("🛡️ Anti-Delete System Initialized");
  }

  async loadDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = await fs.promises.readFile(DB_FILE, 'utf8');
        const entries = JSON.parse(data);
        const now = Date.now();
        const validEntries = entries.filter(([_, message]) => now - message.timestamp <= this.cacheExpiry);

        this.messageCache = new Map(validEntries);
        console.log(`📦 Loaded ${validEntries.length} messages from database`);

        if (entries.length !== validEntries.length) await this.saveDatabase();
      }
    } catch (e) {
      console.error("🔴 Database load error:", e);
      this.messageCache = new Map();
    }
  }

  async saveDatabase() {
    if (this.isSaving) {
      return new Promise(resolve => this.saveQueue.push(resolve));
    }
    this.isSaving = true;
    try {
      const data = JSON.stringify(Array.from(this.messageCache.entries()));
      await fs.promises.writeFile(DB_FILE, data);
      console.log(`💾 Database saved (${this.messageCache.size} messages)`);

      while (this.saveQueue.length) {
        const resolve = this.saveQueue.shift();
        resolve();
      }
    } catch (e) {
      console.error("🔴 Database save error:", e);
    } finally {
      this.isSaving = false;
    }
  }

  async addMessage(id, message) {
    if (this.messageCache.size > 1000) {
      this.cleanExpiredMessages(true);
    }
    this.messageCache.set(id, message);
    console.log(`📥 Cached message: ${id}`);
    await this.saveDatabase();
  }

  async deleteMessage(id) {
    if (this.messageCache.has(id)) {
      this.messageCache.delete(id);
      console.log(`🗑️ Deleted from cache: ${id}`);
      await this.saveDatabase();
    }
  }

  cleanExpiredMessages(force = false) {
    const now = Date.now();
    let cleaned = 0;
    const limit = force ? this.messageCache.size : Math.min(100, this.messageCache.size);

    for (const [key, msg] of this.messageCache.entries()) {
      if (now - msg.timestamp > this.cacheExpiry) {
        this.messageCache.delete(key);
        cleaned++;
      }
      if (!force && cleaned >= limit) break;
    }
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired messages`);
      this.saveDatabase();
    }
  }

  startCleanup() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.cleanupTimer = setInterval(
      () => this.cleanExpiredMessages(),
      Math.min(this.cacheExpiry, 300000)
    );
    console.log("⏰ Cleanup scheduler started");
  }

  formatTime(ts) {
    return new Date(ts).toLocaleString('en-GB', {
      timeZone: "UTC",
      dateStyle: 'medium',
      timeStyle: 'medium'
    }) + " (UTC)";
  }
}

const antiDelete = new AntiDeleteSystem();

async function collectStream(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const AntiDelete = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const args = m.body?.slice(prefix.length).trim().split(" ") || [];
  const cmd = args[0]?.toLowerCase();
  const subcmd = args[1]?.toLowerCase();

  // ===== Command =====
  if (cmd === "antidelete") {
    const modes = {
      same: "🔄 Same Chat",
      inbox: "📥 Bot Inbox",
      owner: "👑 Owner PM"
    };
    const currentMode = modes[config.ANTI_DELETE_PATH] || modes.owner;

    if (subcmd === "on") {
      antiDelete.enabled = true;
      await m.reply(`🟢 Anti-Delete Enabled\nMode: ${currentMode}`);
      await m.React("🛡️");
    } else if (subcmd === "off") {
      antiDelete.enabled = false;
      antiDelete.messageCache.clear();
      await antiDelete.saveDatabase();
      await m.reply("🔴 Anti-Delete Disabled");
      await m.React("⚠️");
    } else if (subcmd === "stats") {
      await m.reply(
        `📊 Anti-Delete Stats\n` +
        `• Status: ${antiDelete.enabled ? "🟢 Active" : "🔴 Inactive"}\n` +
        `• Cached: ${antiDelete.messageCache.size} messages\n` +
        `• Mode: ${currentMode}`
      );
      await m.React("📊");
    } else {
      await m.reply(
        `🛡️ Anti-Delete Usage:\n` +
        `• ${prefix}antidelete on\n` +
        `• ${prefix}antidelete off\n` +
        `• ${prefix}antidelete stats`
      );
    }
    return;
  }

  // ===== Cache Messages =====
  Matrix.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!antiDelete.enabled || type !== 'notify' || !messages?.length) return;
    for (const msg of messages) {
      try {
        if (msg.key.fromMe || msg.key.remoteJid === "status@broadcast") continue;

        let entry = {
          type: "text",
          sender: msg.key.participant || msg.key.remoteJid,
          senderFormatted: '@' + (msg.key.participant || msg.key.remoteJid).replace(/@s\.whatsapp\.net|@g\.us/g, ''),
          timestamp: Date.now(),
          chatJid: msg.key.remoteJid
        };

        if (msg.message.conversation || msg.message.extendedTextMessage) {
          entry.type = "text";
          entry.content = msg.message.conversation || msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage) {
          const stream = await downloadContentFromMessage(msg.message.imageMessage, "image");
          entry.type = "image";
          entry.media = await collectStream(stream);
          entry.mimetype = msg.message.imageMessage.mimetype || "image/jpeg";
          entry.content = msg.message.imageMessage.caption || "";
        } else if (msg.message.videoMessage) {
          const stream = await downloadContentFromMessage(msg.message.videoMessage, "video");
          entry.type = "video";
          entry.media = await collectStream(stream);
          entry.mimetype = msg.message.videoMessage.mimetype || "video/mp4";
          entry.content = msg.message.videoMessage.caption || "";
        } else if (msg.message.audioMessage) {
          const stream = await downloadContentFromMessage(msg.message.audioMessage, "audio");
          entry.type = msg.message.audioMessage.ptt ? "ptt" : "audio";
          entry.media = await collectStream(stream);
          entry.mimetype = msg.message.audioMessage.mimetype || "audio/ogg; codecs=opus";
        } else if (msg.message.documentMessage) {
          const stream = await downloadContentFromMessage(msg.message.documentMessage, "document");
          entry.type = "document";
          entry.media = await collectStream(stream);
          entry.mimetype = msg.message.documentMessage.mimetype || "application/octet-stream";
          entry.content = msg.message.documentMessage.fileName || "document";
        } else if (msg.message.stickerMessage) {
          const stream = await downloadContentFromMessage(msg.message.stickerMessage, "sticker");
          entry.type = "sticker";
          entry.media = await collectStream(stream);
          entry.mimetype = msg.message.stickerMessage.mimetype || "image/webp";
        }

        if (entry.media || entry.content) {
          await antiDelete.addMessage(msg.key.id, entry);
        }
      } catch (e) {
        console.error("📥 Cache Error:", e);
      }
    }
  });

  // ===== Detect Deletes =====
  Matrix.ev.on("messages.update", async updates => {
    if (!antiDelete.enabled || !updates?.length) return;

    for (const update of updates) {
      try {
        const { key, update: st } = update;
        const isDeleted =
          st?.messageStubType === proto.WebMessageInfo.StubType.REVOKE ||
          st?.status === proto.WebMessageInfo.Status.DELETED;

        if (!isDeleted || key.fromMe || !antiDelete.messageCache.has(key.id)) continue;

        const cached = antiDelete.messageCache.get(key.id);
        await antiDelete.deleteMessage(key.id);

        let destination;
        if (config.ANTI_DELETE_PATH === "same") {
          destination = key.remoteJid;
        } else if (config.ANTI_DELETE_PATH === "inbox") {
          destination = botNumber;
        } else {
          destination = config.OWNER_NUMBER + "@s.whatsapp.net";
        }

        // Alert
        await Matrix.sendMessage(destination, {
          text: `🚨 *Deleted ${cached.type.toUpperCase()} Recovered!*\n` +
                `▫️ Sender: ${cached.senderFormatted}\n` +
                `▫️ Chat: ${cached.chatJid}\n` +
                `▫️ Time: ${antiDelete.formatTime(cached.timestamp)}`
        });

        // Restore
        if (cached.type === "text" && cached.content) {
          await Matrix.sendMessage(destination, { text: `📝 ${cached.content}` });
        } else if (cached.media) {
          await Matrix.sendMessage(destination, {
            [cached.type]: cached.media,
            mimetype: cached.mimetype,
            caption: cached.content || ""
          });
        }
      } catch (e) {
        console.error("🔴 Recovery Error:", e);
      }
    }
  });
};

export default AntiDelete;
