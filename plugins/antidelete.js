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
        const validEntries = entries.filter(([_, msg]) => now - msg.timestamp <= this.cacheExpiry);
        this.messageCache = new Map(validEntries);
        console.log(`📦 Loaded ${validEntries.length} cached messages`);
      }
    } catch (err) {
      console.error("🔴 DB Load Error:", err);
      this.messageCache = new Map();
    }
  }

  async saveDatabase() {
    try {
      const data = JSON.stringify(Array.from(this.messageCache.entries()));
      await fs.promises.writeFile(DB_FILE, data);
    } catch (err) {
      console.error("🔴 DB Save Error:", err);
    }
  }

  async addMessage(id, msg) {
    this.messageCache.set(id, msg);
    await this.saveDatabase();
  }

  async deleteMessage(id) {
    this.messageCache.delete(id);
    await this.saveDatabase();
  }

  startCleanup() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [key, msg] of this.messageCache.entries()) {
        if (now - msg.timestamp > this.cacheExpiry) {
          this.messageCache.delete(key);
          cleaned++;
        }
      }
      if (cleaned) this.saveDatabase();
    }, 5 * 60 * 1000);
  }

  formatTime(ts) {
    return new Date(ts).toLocaleString('en-US', { hour12: true });
  }
}

export const antiDelete = new AntiDeleteSystem();

// Attach listeners ONCE
export function registerAntiDelete(Matrix) {
  // Cache incoming messages
  Matrix.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!antiDelete.enabled || type !== 'notify' || !messages?.length) return;

    for (const msg of messages) {
      if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') continue;

      const id = msg.key.id;
      const sender = msg.key.participant || msg.key.remoteJid;

      const entry = {
        type: Object.keys(msg.message || {})[0],
        content: msg.message.conversation || msg.message.extendedTextMessage?.text || null,
        timestamp: Date.now(),
        sender,
        chatJid: msg.key.remoteJid
      };

      antiDelete.addMessage(id, entry);
    }
  });

  // Recover deleted messages
  Matrix.ev.on("messages.update", async updates => {
    if (!antiDelete.enabled) return;

    for (const update of updates) {
      const { key, update: status } = update;
      const isDeleted = status?.messageStubType === proto.WebMessageInfo.StubType.REVOKE ||
                        status?.status === proto.WebMessageInfo.Status.DELETED;

      if (!isDeleted || !antiDelete.messageCache.has(key.id)) continue;

      const cached = antiDelete.messageCache.get(key.id);
      await antiDelete.deleteMessage(key.id);

      const dest = config.OWNER_NUMBER + "@s.whatsapp.net"; // send recovered msg to owner

      await Matrix.sendMessage(dest, {
        text: `🚨 *Deleted Message Recovered!*
▪ Sender: @${cached.sender.split('@')[0]}
▪ Chat: ${cached.chatJid}
▪ Time: ${antiDelete.formatTime(cached.timestamp)}
📝 Content: ${cached.content || '⚠️ (media or empty)'}`
      }, { mentions: [cached.sender] });
    }
  });

  console.log("✅ Anti-Delete listeners registered");
      }
