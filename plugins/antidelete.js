import config from '../config.cjs';
import fs from 'fs';

let antideleteStatus = false;

const antiDelete = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // Toggle command
    if (cmd === 'antidelete') {
      antideleteStatus = !antideleteStatus;
      return m.reply(
        `🛡️ Anti-Delete is now *${antideleteStatus ? 'ON ✅' : 'OFF ❌'}*`
      );
    }
  } catch (err) {
    console.error('Error in antidelete plugin:', err);
  }
};

// Detect deleted messages
const before = async (message, conn) => {
  try {
    if (!antideleteStatus) return;

    if (message.message?.protocolMessage?.type === 0) {
      const deletedKey = message.message.protocolMessage.key;
      const chat = deletedKey.remoteJid;
      const msgId = deletedKey.id;

      // recover the deleted message from store
      const storedMsg = await conn.loadMessage(chat, msgId);
      if (!storedMsg) return;

      const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';

      // handle media or text
      if (storedMsg.message?.conversation) {
        await conn.sendMessage(ownerJid, {
          text: `🗑️ *Deleted Message Detected!*\n\nFrom: ${
            deletedKey.participant || chat
          }\n\nContent: ${storedMsg.message.conversation}`,
        });
      } else {
        const type = Object.keys(storedMsg.message)[0];
        if (
          type === 'imageMessage' ||
          type === 'videoMessage' ||
          type === 'documentMessage' ||
          type === 'audioMessage' ||
          type === 'stickerMessage'
        ) {
          const buffer = await conn.downloadMediaMessage(storedMsg);
          const caption = `🗑️ *Deleted ${type.replace(
            'Message',
            ''
          )} detected!*\n\nFrom: ${deletedKey.participant || chat}`;
          await conn.sendMessage(
            ownerJid,
            { [type.replace('Message', '')]: buffer, caption },
            { quoted: storedMsg }
          );
        }
      }
    }
  } catch (err) {
    console.error('Error handling deleted message:', err);
  }
};

export default { onStart: antiDelete, before };
