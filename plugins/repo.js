import config from '../config.cjs';

const repo = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'repo') return; // popkid

  try {
    await m.React('📁');

    const owner = config.OWNER_NAME || 'Popkid';
    const githubRepo = 'https://github.com/trendex2030/TREND-XMD';
    const imageUrl = 'https://files.catbox.moe/j2h8dg.jpg'; 
    const { data } = await axios.get('https://github.com/trendex2030/TREND-XMD');

    const repoText = `
    *🔹 BOT REPOSITORY 🔹*
    
🔸 *Name:* ${data.name}
🔸 *Stars:* ${data.stargazers_count}
🔸 *Forks:* ${data.forks_count}
🔸 *GitHub Link:* https://github.com/trendex2030/TREND-XMD
│ 
│ 👑 *Owner:* ${owner}
│ ⚙️ *Prefix:* ${prefix}
│ 🧩 *Version:* 2.0
│ 📌 *Type:* Public • Open Source
└───────────◇

@${m.sender.split("@")[0]}👋, Don't forget to star and fork my repository!`;
💡 Report bugs using: *${prefix}report [your bug here]*
`.trim();

    // 🖼️ popkid images
    await sock.sendMessage(m.from, {
      image: { url: imageUrl },
      caption: repoText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "TREND-X",
          newsletterJid: "120363401765045963@newsletter"
        }
      }
    }, { quoted: m });

    // 🎵 Random song
    const songUrls = [
      'https://files.catbox.moe/2b33jv.mp3',
      'https://files.catbox.moe/0cbqfa.mp3',
      'https://files.catbox.moe/j4ids2.mp3',
      'https://files.catbox.moe/vv2qla.mp3'
    ];
    const randomSong = songUrls[Math.floor(Math.random() * songUrls.length)];

    // 🎧 music to the world
    await sock.sendMessage(m.from, {
      audio: { url: randomSong },
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "TREND-X",
          newsletterJid: "120363401765045963@newsletter"
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Error in .repo command:', err);
    await m.reply('❌ Failed to load repository info.');
  }
};

export default repo;
