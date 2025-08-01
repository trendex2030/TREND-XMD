const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, jidNormalizedUser } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const path = require('path');
const mega = require('megajs');
const axios = require('axios');
const moment = require('moment-timezone');

const SESSION_ID = 'trend-xmd~session'; // session prefix
const OWNER_NUMBER = '254734939236'; // change to your number
const CREATOR_NAME = 'trendex';

// === EXPRESS KEEP-ALIVE FOR HEROKU ===
const app = express();
app.get('/', (req, res) => res.send('TREND-X WhatsApp Bot is alive'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// === AUTHENTICATION ===
const SESSION_DIR = './auth_info';

async function startTRENDX() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['TREND-X', 'Chrome', '110.0']
    });

    // === CONNECTION HANDLING ===
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log('🔴 Logged out. Delete auth folder.');
                fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            }
            startTRENDX();
        } else if (connection === 'open') {
            console.log('🟢 Connected to WhatsApp.');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // === MESSAGE HANDLER ===
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // === SIMPLE COMMANDS ===
        if (body === 'ping') return sock.sendMessage(from, { text: '🏓 PONG!' });
        if (body === 'creator') return sock.sendMessage(from, { text: `👑 This bot was created by ${CREATOR_NAME}` });

        if (body === 'menu') {
            return sock.sendMessage(from, {
                text: `🤖 *TREND-X FEATURES*\n\n` +
                      `• ping\n` +
                      `• creator\n` +
                      `• chatbot on/off\n` +
                      `• fun, download, tools, group admin, and more...`
            });
        }

        if (body.toLowerCase() === 'chatbot on') {
            sock.sendMessage(from, { text: `🟢 Chatbot enabled.` });
        }

        if (body.toLowerCase() === 'chatbot off') {
            sock.sendMessage(from, { text: `🔴 Chatbot disabled.` });
        }

        // === OWNER / ADMIN COMMANDS ===
        const isOwner = [OWNER_NUMBER, `${OWNER_NUMBER}@s.whatsapp.net`].includes(sender);
        if (body.startsWith('.broadcast') && isOwner) {
            const bcText = body.split(' ').slice(1).join(' ');
            const groups = await sock.groupFetchAllParticipating();
            for (let gid in groups) {
                await sock.sendMessage(gid, { text: `📢 Broadcast:\n\n${bcText}` });
            }
        }
    });
}

startTRENDX();
