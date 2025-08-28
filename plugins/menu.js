import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "menu") {
    const start = new Date().getTime();
    await m.React('✨');
    const end = new Date().getTime();
    const responseTime = ((end - start) / 1000).toFixed(2);

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    let profilePictureUrl = 'https://files.catbox.moe/x18hgf.jpg'; 
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500); 
      const pp = await sock.profilePictureUrl(m.sender, 'image', { signal: controller.signal });
      clearTimeout(timeout);
      if (pp) profilePictureUrl = pp;
    } catch (error) {
      console.log('🖼️ Profile pic fetch timed out or failed.');
    }

    const menuText = `
╭───────────────⭓
│ 🤖 ʙᴏᴛ : *ᴋᴇʟᴠɪɴ-xᴍᴅ*
│ ⏱️ ʀᴜɴᴛɪᴍᴇ : ${uptime}
│ ⚡ sᴘᴇᴇᴅ : ${responseTime}s
│ 🌐 ᴍᴏᴅᴇ : ${config.PUBLIC ? 'public' : 'private'}
│ 🧩 ᴘʀᴇғɪx : ${prefix}
│ 👑 ᴏᴡɴᴇʀ : ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ
│ 🛠️ ᴅᴇᴠ : *ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ*
│ 🧪 ᴠᴇʀ : *1.0.0*
╰───────────────⭓
━━━━━━━━━━━━━━━━━━
💥 *𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 ᴋᴇʟᴠɪɴ-𝙓ᴍᴅ* 💥
━━━━━━━━━━━━━━━━━━

📜 『 *𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨* 』
❏ menu
❏ alive
❏ ping
❏ speed
❏ owner
❏ allvar
❏ addpremium
❏ repo
❏ sudo

👑 『 *𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦* 』
❏ join
❏ leave
❏ restart
❏ block
❏ unblock
❏ setprefix
❏ alwaysonline
❏ setownername
❏ profile

🧠 『 *𝗔𝗜 & 𝗖𝗛𝗔𝗧* 』
❏ ai
❏ gpt
❏ gemini
❏ chatbot
❏ report

🎨 『 *𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗥𝗦* 』
❏ sticker
❏ take
❏ attp
❏ mp3
❏ ss
❏ fancy
❏ url
❏ shorten

🔍 『 *𝗦𝗘𝗔𝗥𝗖𝗛 & 𝗧𝗢𝗢𝗟𝗦* 』
❏ google
❏ pinterest
❏ youtube
❏ tiktok
❏ instagram
❏ imdb
❏ playstore
❏ mediafire

🎮 『 *𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦* 』
❏ ttt
❏ yesorno
❏ connect4
❏ joke
❏ roast
❏ anime
❏ profile
❏ poll
❏ quizz
❏ tempmail

👥 『 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟* 』
❏ kick
❏ remove
❏ tagall
❏ hidetag
❏ promote
❏ demote
❏ linkgc
❏ antilink
❏ groupinfo
❏ setname
❏ setdescription

━━━━━━━━━━━━━━━━━━
⚡ *𝗞𝗘𝗟𝗩𝗜𝗡 𝗧𝗘𝗖𝗛 𝗩1.0* ⚡
━━━━━━━━━━━━━━━━━━
    `.trim();

    const newsletterContext = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "☘ 𝗞𝗘𝗟𝗩𝗜𝗡 𝗧𝗘𝗖𝗛 ☘",
        newsletterJid: "120363401548261516@newsletter"
      }
    };

    // send menu
    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      contextInfo: newsletterContext
    }, { quoted: m });

    // 🎵 random bgm
    const songUrls = [
      'https://files.catbox.moe/jdozs7.mp3',
      'https://files.catbox.moe/2b33jv.mp3',
      'https://files.catbox.moe/0cbqfa.mp3',
      'https://files.catbox.moe/vv2qla.mp3'
    ];
    const random = songUrls[Math.floor(Math.random() * songUrls.length)];

    await sock.sendMessage(m.from, {
      audio: { url: random },
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: newsletterContext
    }, { quoted: m });
  }
};

export default menu;
