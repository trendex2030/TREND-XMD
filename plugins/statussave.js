import fs from 'fs';
import config from '../config.cjs';

const handleGreeting = async (m, sock) => {
  try {
    const text = m.body.toLowerCase().trim();

    const triggerWords = [
      'send', 'statusdown', 'take', 'save', 'giv', 'gib', 'upload',
      'send me', 'sent me', 'znt', 'snt', 'ayak', 'do', 'mee'
    ];

    if (!triggerWords.includes(text)) return;

    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg) return;

    const senderMention = [m.sender];
    const contextInfo = {
      mentionedJid: senderMention,
      forwardingScore: 777,
      isForwarded: true,
      externalAdReply: {
        title: 'TREND-X',
        body: '🔥 Forwarded Media Utility',
        thumbnailUrl: 'https://telegra.ph/file/4d838ab7ffb49f30c8e18.jpg',
        mediaType: 1,
        mediaUrl: 'https://github.com/PopkidXmd',
        sourceUrl: 'https://github.com/PopkidXmd',
        showAdAttribution: true,
      },
    };

    const forwardMedia = async (mediaType, getUrl, caption = '') => {
      const mediaPath = await sock.downloadAndSaveMediaMessage(getUrl);
      await sock.sendMessage(m.from, {
        [mediaType]: { url: mediaPath },
        caption: `╭──⧉ *Media Resent*\n│👤 From: @${m.sender.split('@')[0]}\n│📎 Type: ${mediaType.toUpperCase()}\n╰─────────────⟡\n\n${caption || '_No caption_'}`,
        contextInfo
      }, { quoted: m });
    };

    if (quotedMsg.imageMessage) {
      await forwardMedia('image', quotedMsg.imageMessage, quotedMsg.imageMessage.caption);
    } else if (quotedMsg.videoMessage) {
      await forwardMedia('video', quotedMsg.videoMessage, quotedMsg.videoMessage.caption);
    }

  } catch (err) {
    console.error('[⚠️ handleGreeting Error]', err.message);
    await sock.sendMessage(m.from, {
      text: '❌ *Error while processing your request. Try again later.*',
    }, { quoted: m });
  }
};

export default handleGreeting;
