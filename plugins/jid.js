import config from '../config.cjs';

const jidCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const command = m.body?.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase()
    : '';

  if (command === 'jid') {
    const isGroup = m.from.endsWith('@g.us');
    const jid = isGroup ? m.from : `${m.sender}`;
    const text = isGroup
      ? `🌐 *Group JID:* \n\`\`\`${jid}\`\`\``
      : `👤 *User JID:* \n\`\`\`${jid}\`\`\``;

    return await Matrix.sendMessage(m.from, {
      text,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'TREND-X',
          newsletterJid: '120363401765045963@newsletter'
        }
      }
    }, { quoted: m });
  }
};

export default jidCommand;
