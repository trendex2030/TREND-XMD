import config from '../config.cjs';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

const ownerContact = async (m, sock) => {
  const prefix = config.PREFIX;
  const ownerNumber = config.OWNER_NUMBER;
  const cmd = m.body?.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'owner') return;

  console.log('📥 Owner command triggered');

  try {
    const newsletterJid = '120363401765045963@newsletter';
    const newsletterName = 'TREND-X';

    // 🔥 Your custom image URL
    const profilePictureUrl = 'https://files.catbox.moe/j2h8dg.jpg'; // replace this with your real image link

    const captionText = `
╭───〔 👑 *BOT OWNER* 〕───⬣
┃ 👤 *Name:* ${config.OWNER_NAME || 'trendex'}
┃ 📞 *Contact:* wa.me/${ownerNumber}
┃ 🌐 *GitHub:* github.com/${config.GITHUB || 'TREND-XMD'}
╰──────────────⬣`.trim();

    await sock.sendMessage(
      m.from,
      {
        image: { url: profilePictureUrl },
        caption: captionText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName,
            newsletterJid,
          },
        },
      },
      { quoted: m }
    );

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.OWNER_NAME || 'Popkid'}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`;

    await sock.sendMessage(
      m.from,
      {
        contacts: {
          displayName: config.OWNER_NAME || 'trendex',
          contacts: [{ vcard }],
        },
      },
      { quoted: m }
    );

    const songPath = path.join('mydata', 'owner-theme.mp3');

    if (fs.existsSync(songPath)) {
      const audioBuffer = fs.readFileSync(songPath);
      await sock.sendMessage(
        m.from,
        {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          ptt: false,
        },
        { quoted: m }
      );
    } else {
      console.warn('⚠️ Song file not found:', songPath);
    }

    await sock.sendMessage(m.from, {
      react: {
        text: '🎵',
        key: m.key,
      },
    });
  } catch (err) {
    console.error('❌ Error in owner command:', err);
    await sock.sendMessage(m.from, {
      text: '❌ *Could not send owner info. Try again later.*',
    }, { quoted: m });

    await sock.sendMessage(m.from, {
      react: {
        text: '❌',
        key: m.key,
      },
    });
  }
};

export default ownerContact;
