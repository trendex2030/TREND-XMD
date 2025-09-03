/*══════════════════════════════════════════════╗
║     🔓 TRENDEX - VIEW ONCE UNLOCKER ⚔️      ║
╠══════════════════════════════════════════════╝
║  🔁 Recovers view-once media with forwarding
║  🔐 Owner-only for vv2 & vv3
║  🧠 Commands: vv, vv2, vv3
╚══════════════════════════════════════════════*/

import pkg from '@whiskeysockets/baileys';
const { downloadMediaMessage } = pkg;
import config from '../config.cjs';

const OwnerCmd = async (m, Matrix) => {
  const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net';
  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  const isOwner = m.sender === ownerNumber;
  const isBot = m.sender === botNumber;

  if (!['vv', 'vv2', 'vv3'].includes(cmd)) return;
  if (!m.quoted) return m.reply('❗ *Reply to a View Once message!*');

  // 🔓 Extract ViewOnce
  let msg = m.quoted.message;
  if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
  else if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message;

  if (!msg) return m.reply('❌ *This is not a View Once message!*');

  // 🛑 Permission Checks
  if (['vv2', 'vv3'].includes(cmd) && !isOwner && !isBot) {
    return m.reply('🔐 *Only the owner or bot can use this command!*');
  }

  if (cmd === 'vv' && !isOwner && !isBot) {
    return m.reply('🚫 *Only the owner or bot can use this command to send media!*');
  }

  try {
    const messageType = Object.keys(msg)[0];
    let buffer;
    if (messageType === 'audioMessage') {
      buffer = await downloadMediaMessage(m.quoted, 'buffer', {}, { type: 'audio' });
    } else {
      buffer = await downloadMediaMessage(m.quoted, 'buffer');
    }

    if (!buffer) return m.reply('⚠️ *Failed to retrieve media!*');

    const mimetype = msg.audioMessage?.mimetype || 'audio/ogg';
    const caption = `🧠 *ᴠɪᴇᴡ ᴏɴᴄᴇ ʀᴇᴄᴏᴠᴇʀʏ*\n\n📨 *Forwarded by TREND-X*\n🔐 *Unlocked media recovered from view once.*\n\n💀 TREND-X - ᴛᴇᴄʜ\n━━━━━━━━━━━━━━━`;

    // 🎯 Recipient logic
    let recipient;
    if (cmd === 'vv') {
      recipient = m.from;
    } else if (cmd === 'vv2') {
      recipient = botNumber;
    } else if (cmd === 'vv3') {
      recipient = ownerNumber;
    }

    // 📩 Forward Style Context
    const forwardContext = {
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: 'TREND-X',
        newsletterJid: '120363401765045963@newsletter'
      }
    };

    // 📤 Send
    if (messageType === 'imageMessage') {
      await Matrix.sendMessage(recipient, {
        image: buffer,
        caption,
        contextInfo: forwardContext
      });
    } else if (messageType === 'videoMessage') {
      await Matrix.sendMessage(recipient, {
        video: buffer,
        caption,
        mimetype: 'video/mp4',
        contextInfo: forwardContext
      });
    } else if (messageType === 'audioMessage') {
      await Matrix.sendMessage(recipient, {
        audio: buffer,
        mimetype,
        ptt: true,
        contextInfo: forwardContext
      });
    } else {
      return m.reply('⚠️ *Unsupported media type!*');
    }

    // 🎉 Silent send complete

  } catch (error) {
    console.error(error);
    await m.reply('❌ *Failed to process View Once message!*');
  }
};

// 🧑‍💻 Coded by TRENDEX
export default OwnerCmd;

/*══════════════════════════════════════════════╗
║ 💡 Use `vv` for public resend                ║
║ 💡 Use `vv2` to send to Bot's inbox          ║
║ 💡 Use `vv3` to send privately to Owner      ║
╚══════════════════════════════════════════════*/
