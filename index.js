// index.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');
const { Boom } = require('@hapi/boom');
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

// ==========================
// CONFIG
// ==========================
const PORT = process.env.PORT || 3000;
const SESSION_ID = process.env.SESSION_ID || ''; // Example: TREND-XMD~https://mega.nz/file/EXAMPLE_LINK
const SESSION_DIR = path.join(__dirname, 'session');
const CREDS_FILE = path.join(SESSION_DIR, 'creds.json');

// ==========================
// EXPRESS SERVER (Heroku)
// ==========================
const app = express();
app.get('/', (req, res) => res.send('TREND-XMD Bot is running!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// ==========================
// SESSION LOADER
// ==========================
async function loadSessionFromEnv() {
    if (!SESSION_ID.startsWith('TREND-XMD~')) {
        console.error('❌ Invalid SESSION_ID format. It must start with TREND-XMD~');
        process.exit(1);
    }
    const sessionValue = SESSION_ID.split('TREND-XMD~')[1].trim();

    // Only download if creds.json does not exist
    if (!fs.existsSync(CREDS_FILE)) {
        if (sessionValue.startsWith('http')) {
            console.log('🔄 Downloading session from URL...');
            try {
                const { data } = await axios.get(sessionValue);
                fs.mkdirSync(SESSION_DIR, { recursive: true });
                fs.writeFileSync(CREDS_FILE, JSON.stringify(data));
                console.log('✅ Session downloaded & saved.');
            } catch (err) {
                console.error('❌ Failed to download session file:', err.message);
                process.exit(1);
            }
        } else {
            console.error('❌ SESSION_ID must contain a valid file URL.');
            process.exit(1);
        }
    } else {
        console.log('🔒 Using existing session creds.');
    }
}

// ==========================
// WHATSAPP BOT
// ==========================
async function startBot() {
    await loadSessionFromEnv();

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🤖 TREND-XMD using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // disable QR printing for Heroku
        version
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('Connection closed, reason:', reason);
            if (reason !== DisconnectReason.loggedOut) {
                console.log('Reconnecting...');
                startBot();
            } else {
                console.log('Logged out. Delete session and re-pair.');
            }
        } else if (connection === 'open') {
            console.log('✅ TREND-XMD Bot is connected and running!');
        }
    });

    sock.ev.on('messages.upsert', async (msg) => {
        const m = msg.messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const textMsg = m.message.conversation || m.message.extendedTextMessage?.text || '';
        console.log(`📩 Message from ${sender}: ${textMsg}`);

        // Simple ping command
        if (textMsg.toLowerCase() === 'ping') {
            await sock.sendMessage(sender, { text: 'pong' }, { quoted: m });
        }
    });
}

// ==========================
// START BOT
// ==========================
startBot();
