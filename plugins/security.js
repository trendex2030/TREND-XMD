import config from '../config.cjs';

const security = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const senderName = m.pushName || 'User';

  if (cmd === 'security') {
    const securityText = `
🔐 *SECURITY NOTICE — TREND-X*

Hey *${senderName}*, stay safe by following these security tips:

1️⃣ Never share your *SESSION_ID* with anyone.
2️⃣ Avoid clicking suspicious links.
3️⃣ Enable *2-Factor Authentication* on your WhatsApp.
4️⃣ Block and report suspicious accounts.
5️⃣ Contact only *official Trendex support* for help.

_Your privacy is our priority. Stay alert, stay safe!_

*— TREND-X Team 🔰*
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: 'https://files.catbox.moe/959dyk.jpg' },
      caption: securityText,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'TREND-Xmd',
          newsletterJid: '120363401765045963@newsletter',
        },
      },
    }, { quoted: m });
  }
};

export default security;
