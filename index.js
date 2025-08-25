console.clear();
console.log('starting...');
require('./setting/config');
process.on("uncaughtException", console.error);

const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    jidDecode,
    proto,
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const { smsg } = require('./start/lib/myfunction');

const MEGA_SESSION_ID = process.env.MEGA_SESSION_ID || "TREND-XMD~YOUR_BASE64_SESSION_HERE";

async function clientstart() {
    // Decode Mega session
    const sessionJSON = Buffer.from(MEGA_SESSION_ID.replace('TREND-XMD~', ''), 'base64').toString('utf-8');
    const session = JSON.parse(sessionJSON);

    const conn = makeWASocket({
        version: (await (await fetch('https://github.com/kiuur/bails/raw/refs/heads/master/lib/Defaults/baileys-version.json')).json()).version,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger: pino({ level: 'fatal' }),
        auth: {
            creds: session.creds,
            keys: makeCacheableSignalKeyStore(session.keys, pino().child({ level: 'silent', stream: 'store' })),
        },
        printQRInTerminal: false,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: true,
    });

    // Bind store, message handling, etc. (rest of your logic remains unchanged)
    const { makeInMemoryStore } = require("@rodrigogs/baileys-store");
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    store.bind(conn.ev);

    conn.ev.on('messages.upsert', async chatUpdate => {
        try {
            let mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = Object.keys(mek.message)[0] === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
            if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            let m = smsg(conn, mek, store);
            require("./start/system")(conn, m, chatUpdate, mek, store);
        } catch (err) {
            console.log(chalk.yellow.bold("[ ERROR ] system.js :\n") + chalk.redBright(err));
        }
    });

    conn.ev.on('creds.update', (creds) => {
        // Update Mega session
        session.creds = creds;
        const newSession = "TREND-XMD~" + Buffer.from(JSON.stringify(session)).toString('base64');
        console.log(chalk.greenBright("Updated Mega session ID:"));
        console.log(newSession);
    });

    return conn;
}

clientstart();
