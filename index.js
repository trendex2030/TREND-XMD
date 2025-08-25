console.clear();
console.log('Starting TREND-X Bot...');
require('./setting/config');
process.on("uncaughtException", console.error);

const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { File } = require('megajs');

// Utils
const { smsg, getBuffer } = require('./start/lib/myfunction');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./start/lib/exif');
const { color } = require('./start/lib/color');

// Express for Heroku
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('TREND-X Bot is running'));
app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));

// Paths
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// Download session from MEGA if SESSION_ID provided
async function downloadSessionData() {
  const sess = process.env.SESSION_ID || global.SESSION_ID;
  if (!sess) return false;
  const parts = sess.split("TREND-XMD~")[1];
  if (!parts || !parts.includes("#")) return false;
  const [fileID, decryptKey] = parts.split("#");
  try {
    const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);
    const data = await new Promise((resolve, reject) => file.download((err, data) => err ? reject(err) : resolve(data)));
    fs.writeFileSync(credsPath, data);
    console.log("Session downloaded successfully.");
    return true;
  } catch (err) {
    console.error("Failed to download session:", err);
    return false;
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    printQRInTerminal: !fs.existsSync(credsPath),
    syncFullHistory: true,
    markOnlineOnConnect: true,
    browser: ["TREND-X", "Chrome", "1.0.0"],
    version,
    logger: pino({ level: 'fatal' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent' }))
    }
  });

  // In-memory store
  const { makeInMemoryStore } = require("@rodrigogs/baileys-store");
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent' }) });
  store.bind(conn.ev);

  // Messages
  conn.ev.on('messages.upsert', async chatUpdate => {
    try {
      let mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = mek.message.ephemeralMessage?.message || mek.message;
      if (mek.key.remoteJid === 'status@broadcast') return;
      let m = smsg(conn, mek, store);
      require("./start/system")(conn, m, chatUpdate, mek, store);
    } catch (err) {
      console.log(chalk.yellow.bold("[ ERROR ] system.js :\n"), err);
    }
  });

  // Helpers
  conn.decodeJid = (jid) => jidDecode(jid)?.user ? jidDecode(jid).user + '@' + jidDecode(jid).server : jid;
  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(jid, {
      text,
      contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + "@s.whatsapp.net") },
      ...options
    }, { quoted });

  conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : fs.existsSync(path) ? fs.readFileSync(path) : await getBuffer(path);
    let buffer = (options.packname || options.author) ? await writeExifImg(buff, options) : await imageToWebp(buff);
    await conn.sendMessage(jid, { sticker: buffer }, { quoted });
    return buffer;
  };

  conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : fs.existsSync(path) ? fs.readFileSync(path) : await getBuffer(path);
    let buffer = (options.packname || options.author) ? await writeExifVid(buff, options) : await videoToWebp(buff);
    await conn.sendMessage(jid, { sticker: buffer }, { quoted });
    return buffer;
  };

  // Connection updates
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) startBot();
      else console.log('Logged out.');
    } else if (connection === 'open') {
      console.log(chalk.green('Bot connected successfully!'));
    }
  });

  conn.ev.on('creds.update', saveCreds);
}

// Initialize bot
(async () => {
  if (!fs.existsSync(credsPath)) {
    const ok = await downloadSessionData();
    if (!ok) console.log('Using QR login (scan printed QR).');
  }
  await startBot();
})();
