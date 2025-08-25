console.clear();
console.log('Starting bot...');
require('./setting/config');
process.on("uncaughtException", console.error);

const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  jidDecode,
  proto
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const PhoneNumber = require('awesome-phonenumber');
const { File } = require('megajs');

// --- utils & libs ---
const {
  smsg,
  getBuffer,
  sleep
} = require('./start/lib/myfunction');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./start/lib/exif');
const { color } = require('./start/lib/color');

// Paths
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// Download session from MEGA if SESSION_ID provided
async function downloadSessionData() {
  const sess = process.env.SESSION_ID || global.SESSION_ID;
  if (!sess) {
    console.log('No SESSION_ID provided, will use QR login.');
    return false;
  }
  const parts = sess.split("TREND-XMD~")[1];
  if (!parts || !parts.includes("#")) {
    console.error('Invalid SESSION_ID format, expected TREND-XMD~fileID#key');
    return false;
  }
  const [fileID, decryptKey] = parts.split("#");
  try {
    console.log("Downloading session from MEGA...");
    const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);
    const data = await new Promise((resolve, reject) => {
      file.download((err, data) => (err ? reject(err) : resolve(data)));
    });
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
    printQRInTerminal: !fs.existsSync(credsPath), // show QR only if no creds
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

  const { makeInMemoryStore } = require("@rodrigogs/baileys-store");
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
  store.bind(conn.ev);

  // Load your system handlers, group events, sticker helpers, etc. (copied from your old version)
  conn.ev.on('messages.upsert', async chatUpdate => {
    try {
      let mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = mek.message.ephemeralMessage?.message || mek.message;
      if (mek.key.remoteJid === 'status@broadcast') return;
      let m = smsg(conn, mek, store);
      require("./start/system")(conn, m, chatUpdate, mek, store);
    } catch (err) {
      console.log(chalk.yellow("[ ERROR ]"), err);
    }
  });

  // decodeJid, sendTextWithMentions, sticker funcs, etc.
  conn.decodeJid = (jid) => jidDecode(jid)?.user ? jidDecode(jid).user + '@' + jidDecode(jid).server : jid;
  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(jid, {
      text,
      contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + "@s.whatsapp.net") },
      ...options
    }, { quoted });

  conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : fs.existsSync(path) ? fs.readFileSync(path) : await (await getBuffer(path));
    let buffer = (options.packname || options.author) ? await writeExifImg(buff, options) : await imageToWebp(buff);
    await conn.sendMessage(jid, { sticker: buffer }, { quoted });
    return buffer;
  };

  conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : fs.existsSync(path) ? fs.readFileSync(path) : await (await getBuffer(path));
    let buffer = (options.packname || options.author) ? await writeExifVid(buff, options) : await videoToWebp(buff);
    await conn.sendMessage(jid, { sticker: buffer }, { quoted });
    return buffer;
  };

  // Group participant updates (welcome/goodbye), anticall, etc. - reuse your code
  conn.ev.on('group-participants.update', async (anu) => {
    if (global.welcome) {
      const groupMetadata = await conn.groupMetadata(anu.id);
      for (const participant of anu.participants) {
        let ppUrl;
        try { ppUrl = await conn.profilePictureUrl(participant, 'image'); }
        catch { ppUrl = 'https://i.ibb.co/sFjX3nP/default.jpg'; }
        if (anu.action === 'add') {
          await conn.sendMessage(anu.id, {
            image: { url: ppUrl },
            caption: `Welcome @${participant.split('@')[0]} to ${groupMetadata.subject}`,
            mentions: [participant]
          });
        } else if (anu.action === 'remove') {
          await conn.sendMessage(anu.id, {
            image: { url: ppUrl },
            caption: `Goodbye @${participant.split('@')[0]}`,
            mentions: [participant]
          });
        }
      }
    }
  });

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log('Logged out.');
      }
    } else if (connection === 'open') {
      console.log(chalk.green('Bot connected successfully!'));
    }
  });

  conn.ev.on('creds.update', saveCreds);
}

(async () => {
  if (!fs.existsSync(credsPath)) {
    const ok = await downloadSessionData();
    if (!ok) console.log('Using QR login (scan printed QR).');
  }
  await startBot();
})();

// Hot reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
