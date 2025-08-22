import config from './config.cjs';
import {
  makeWASocket,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './src/event/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

const sessionName = 'session';
const app = express();
const PORT = process.env.PORT || 3000;
let useQR = false;
let initialConnection = true;

const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({});
logger.level = 'trace';

const sessionDir = path.join(path.dirname(new URL(import.meta.url).pathname), sessionName);
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

async function downloadSessionData() {
  if (!config.SESSION_ID) {
    console.error('Please add your session to SESSION_ID env !!');
    return false;
  }
  const sessdata = config.SESSION_ID.split('TREND-XMD~')[1];
  const url = `https://mega.nz/file/${sessdata}`;
  try {
    const response = await axios.get(url);
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    await fs.promises.writeFile(credsPath, data);
    console.log('🔒 Session Successfully Loaded !!');
    return true;
  } catch (err) {
    console.error('Failed to download session data:', err.message);
    return false;
  }
}

async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🤖 Arslan-XD using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const Matrix = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ['Arslan-XD', 'safari', '3.3'],
      auth: state,
      getMessage: async () => ({ conversation: 'Arslan-XD whatsapp user bot' })
    });

    Matrix.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'close' &&
          lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        start();
      } else if (connection === 'open') {
        if (initialConnection) {
          console.log(chalk.green('😃 Integration Successful️ ✅'));
          Matrix.sendMessage(Matrix.user.id, { text: '😃 Integration Successful️ ✅' });
          initialConnection = false;
        } else {
          console.log(chalk.blue('♻️ Connection reestablished after restart.'));
        }
      }
    });

    Matrix.ev.on('creds.update', saveCreds);

    Matrix.ev.on('messages.upsert', async (chatUpdate) => {
      await Handler(chatUpdate, Matrix, logger);
      try {
        const mek = chatUpdate.messages[0];
        if (!mek.key.fromMe && config.AUTO_REACT && mek.message) {
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(randomEmoji, mek, Matrix);
        }
      } catch (err) {
        console.error('Error during auto reaction:', err);
      }
    });

    Matrix.ev.on('call', async (json) => Callupdate(json, Matrix));
    Matrix.ev.on('group-participants.update', async (msg) => GroupUpdate(Matrix, msg));

    Matrix.public = config.MODE === 'public';
  } catch (err) {
    console.error('Critical Error in start():', err);
    // don't exit; let reconnection logic or Heroku restart handle recovery
  }
}

async function init() {
  if (fs.existsSync(credsPath)) {
    console.log('🔒 Session file found, proceeding without QR code.');
    await start();
  } else {
    const downloaded = await downloadSessionData();
    if (downloaded) {
      console.log('🔒 Session downloaded, starting bot.');
      await start();
    } else {
      console.log('No session found; QR code will be printed.');
      useQR = true;
      await start();
    }
  }
}

init();

// Express keep-alive
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Top-level error handlers
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

// Graceful shutdown on Heroku dyno restart
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
