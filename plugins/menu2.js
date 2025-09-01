import config from '../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : body.trim();
  const isNumberReply = /^[1-9]$/.test(cmd);

  const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: "TREND-X",
      newsletterJid: "120363401765045963@newsletter"
    }
  };

  const categoryMenus = {
    "1": `╭───[ 1️⃣ MAIN & BOT COMMANDS ]
│ ${prefix}menu
│ ${prefix}alive
│ ${prefix}ping
│ ${prefix}speed
│ ${prefix}sudo
│ ${prefix}dev
│ ${prefix}addpremium
╰────────────────────`,
    "2": `╭───[ 2️⃣ OWNER COMMANDS ]
│ ${prefix}restart
│ ${prefix}join
│ ${prefix}autoread
│ ${prefix}block
│ ${prefix}unblock
│ ${prefix}setprefix
│ ${prefix}repo
╰────────────────────`,
    "3": `╭───[ 3️⃣ AI & CHAT ]
│ ${prefix}ai
│ ${prefix}gpt
│ ${prefix}chatbot
│ ${prefix}gemini
│ ${prefix}lydia
│ ${prefix}TREND-X-ai
╰────────────────────`,
    "4": `╭───[ 4️⃣ SEARCH & TOOLS ]
│ ${prefix}google
│ ${prefix}ytsearch
│ ${prefix}facebook
│ ${prefix}instagram
│ ${prefix}lyrics
│ ${prefix}mediafire
╰────────────────────`,
    "5": `╭───[ 5️⃣ CONVERTERS & UTILITIES ]
│ ${prefix}sticker
│ ${prefix}mp3
│ ${prefix}attp
│ ${prefix}url
│ ${prefix}shorten
│ ${prefix}ss
│ ${prefix}sessioncheck
╰────────────────────`,
    "6": `╭───[ 6️⃣ GROUP CONTROL ]
│ ${prefix}tagall
│ ${prefix}hidetag
│ ${prefix}kick
│ ${prefix}add
│ ${prefix}group open
│ ${prefix}group close
│ ${prefix}antilink
│ ${prefix}antidelete
╰────────────────────`,
    "7": `╭───[ 7️⃣ FUN, GAMES & REACTIONS ]
│ ${prefix}flirt
│ ${prefix}quizz
│ ${prefix}anime
│ ${prefix}ttt
│ ${prefix}yesorno
│ ${prefix}movie
│ ${prefix}bonk
│ ${prefix}smile
│ ${prefix}hug
│ ${prefix}kiss
╰────────────────────`,
    "8": `╭───[ 8️⃣ AUDIO FX & MUSIC ]
│ ${prefix}bass
│ ${prefix}earrape
│ ${prefix}deep
│ ${prefix}robot
│ ${prefix}reverse
│ ${prefix}nightcore
╰────────────────────`,
    "9": `╭───[ 9️⃣ HENTAI (18+) ]
│ ${prefix}hneko
│ ${prefix}hwaifu
│ ${prefix}hentai
│ ${prefix}trap
╰────────────────────`
  };

  // i made the category for two days
  if (
    isNumberReply &&
    m.quoted?.key.fromMe &&
    m.quoted?.message?.imageMessage?.caption?.includes("REPLY WITH A NUMBER TO SEE A CATEGORY")
  ) {
    if (categoryMenus[cmd]) {
      return await sock.sendMessage(
        m.from,
        {
          text: categoryMenus[cmd],
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    } else {
      return await sock.sendMessage(
        m.from,
        {
          text: "❌ Invalid number. Please reply with a number from 1 to 9.",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }
  }

  // popkid menu2🖥️
  if (cmd === "menu2") {
    const start = new Date().getTime();
    await m.React('⚡');
    const end = new Date().getTime();
    const responseTime = ((end - start) / 1000).toFixed(2);

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    let profilePictureUrl = 'https://files.catbox.moe/j2h8dg.jpg';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const pp = await sock.profilePictureUrl(m.sender, 'image', { signal: controller.signal });
      clearTimeout(timeout);
      if (pp) profilePictureUrl = pp;
    } catch (err) {
      console.log("❌ Profile picture fetch failed.");
    }

    const mainMenu = `
╔═⧉ TREND-X 𝙼𝙴𝙽𝚄 ⧉═╗
┃ 🧠 BOT: TREND-X V2.0
┃ ⚡ SPEED: ${responseTime}s
┃ ⏱️ UPTIME: ${uptime}
┃ 🌍 MODE: Public
┃ 🔐 PREFIX: ${prefix}
╚════════════════════╝

💬 *REPLY WITH A NUMBER TO SEE A CATEGORY:*

1️⃣ ┋ MAIN & BOT COMMANDS  
2️⃣ ┋ OWNER COMMANDS  
3️⃣ ┋ AI & CHAT  
4️⃣ ┋ SEARCH & TOOLS  
5️⃣ ┋ CONVERTERS & UTILITIES  
6️⃣ ┋ GROUP CONTROL  
7️⃣ ┋ FUN, GAMES & REACTIONS  
8️⃣ ┋ AUDIO FX & MUSIC  
9️⃣ ┋ HENTAI (18+)

━━━━━━━━━━━━━━
⚡ *TREND-X SYSTEM* ⚡
━━━━━━━━━━━━━━`.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: mainMenu,
      contextInfo: newsletterContext,
    }, { quoted: m });

    const songUrls = [
      'https://files.catbox.moe/2b33jv.mp3',
      'https://files.catbox.moe/0cbqfa.mp3',
      'https://files.catbox.moe/j4ids2.mp3',
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
