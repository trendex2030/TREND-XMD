import config from '../config.cjs' assert { type: 'json' }; // if config.cjs is actually JSON
// OR if it's JS export:
// import config from '../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "menu") {
    const start = new Date().getTime();
    if (m.React) await m.React('✨');
    const end = new Date().getTime();
    const responseTime = ((end - start) / 1000).toFixed(2);

    // uptime
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    // profile picture fallback
    let profilePictureUrl = 'https://files.catbox.moe/x18hgf.jpg';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const pp = await sock.profilePictureUrl(m.sender, 'image', { signal: controller.signal });
      clearTimeout(timeout);
      if (pp) profilePictureUrl = pp;
    } catch {
      console.log('🖼️ Profile pic fetch failed.');
    }

    // safe vars
    const pushname = m.pushName || 'Unknown';
    const botname = global.botname || 'ᴠɪɴɪᴄ xᴍᴅ';

    const menuSections = {
      header: {
        title: '☘ 𝗞𝗘𝗩𝗜𝗡 𝗧𝗘𝗖𝗛 ☘',
        content: [
          `👤 ᴏᴡɴᴇʀ: ☘ ᴋᴇʟᴠɪɴ ᴛᴇ𝗰𝗵 ☘`,
          `👤 ᴜsᴇʀ: ${pushname}`,
          `🤖 ʙᴏᴛɴᴀᴍᴇ: ${botname}`,
          `🌍 ᴍᴏᴅᴇ: ${config.PUBLIC ? 'ᴘᴜʙʟɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}`,
          `🛠️ ᴘʀᴇғɪx: [ ${prefix} ]`,
          `📈 ᴄᴍᴅs: 100+`,
          `🧪 ᴠᴇʀsɪᴏɴ: 1.0.0-beta`,
        ],
      },
      // ... keep the same sections as before ...
    };

    const formatMenu = () => {
      let out = `╭═✦〔 🤖 ${botname} 〕✦═╮\n`;
      out += menuSections.header.content.map(line => `│ ${line}`).join('\n') + '\n';
      out += `╰═✦═════════════╯\n\n`;
      for (const section of Object.values(menuSections).slice(1)) {
        out += `${section.title}\n`;
        out += section.commands.map(c => `│ ✦ ${prefix}${c}`).join('\n') + '\n';
        out += `╰─────────\n\n`;
      }
      out += `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇʟᴠɪɴ ᴛ𝗲𝗰𝗵 `;
      return out;
    };

    try {
      await sock.sendMessage(m.chat, {
        image: { url: 'https://files.catbox.moe/ptpl5c.jpeg' },
        caption: formatMenu(),
        contextInfo: {
          mentionedJid: [m.sender],
          forwardedNewsletterMessageInfo: {
            newsletterName: '☘ 𝗞𝗘𝗩𝗜𝗡 𝗧𝗘𝗖𝗛 ☘',
            newsletterJid: '120363401548261516@newsletter',
          },
          isForwarded: true,
          externalAdReply: {
            showAdAttribution: true,
            title: botname,
            body: '☘ ᴋᴇ𝗟ᴠɪɴ ᴛᴇ𝗰𝗵 ☘',
            mediaType: 3,
            renderLargerThumbnail: false,
            thumbnailUrl: profilePictureUrl,
            sourceUrl: 'https://whatsapp.com/channel/0029Vb6eR1r05MUgYul6Pc2W',
          },
        },
      }, { quoted: m });

      await sock.sendMessage(m.chat, {
        audio: { url: 'https://files.catbox.moe/jdozs7.mp3' },
        mimetype: 'audio/mpeg',
        ptt: true,
      }, { quoted: m });
    } catch (e) {
      console.error('Error sending menu:', e);
      await sock.sendMessage(m.chat, { text: '⚠️ Error displaying menu. Please try again!' }, { quoted: m });
    }
  }
};

export default menu;
