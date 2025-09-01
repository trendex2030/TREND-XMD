import moment from "moment-timezone";
import fs from "fs";
import os from "os";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';

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
│ 🤖 ʙᴏᴛ : *ᴘᴏᴘᴋɪᴅ-xᴅ*
│ ⏱️ ʀᴜɴᴛɪᴍᴇ : ${uptime}
│ ⚡ sᴘᴇᴇᴅ : ${responseTime}s
│ 🌐 ᴍᴏᴅᴇ : public
│ 🧩 ᴘʀᴇғɪx : ${prefix}
│ 👑 ᴏᴡɴᴇʀ : ᴘᴏᴘᴋɪᴅ
│ 🛠️ ᴅᴇᴠ : *ᴘᴏᴘᴋɪᴅ*
│ 🧪 ᴠᴇʀ : *2.0.0*
╰───────────────⭓
━━━━━━━━━━━━━━━━━━
💥 *𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝙋𝙊𝙋𝙆𝙄𝘿-𝙓𝘿* 💥
━━━━━━━━━━━━━━━━━━

📜 『 *𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨* 』
❏ menu
❏ bugmenu
❏ speed
❏ alive
❏ sudo
❏ addpremium
❏ dev
❏ allvar
❏ ping
❏ owner

👑 『 *𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦* 』
❏ join
❏ autoread
❏ pair
❏ leave
❏ autostatusview
❏ autotyping
❏ autoblock
❏ autorecording
❏ autosticker
❏ antisticker
❏ restart
❏ block
❏ unblock
❏ anticall
❏ antidelete
❏ upload
❏ vv
❏ setstatusmsg
❏ allcmds
❏ calculater
❏ alwaysonline
❏ delete
❏ vv2
❏ setprefix
❏ setownername
❏ profile
❏ repo

🧠 『 *𝗔𝗜 & 𝗖𝗛𝗔𝗧* 』
❏ ai
❏ bug
❏ bot
❏ report
❏ gemini
❏ chatbot
❏ gpt
❏ lydia
❏ popkid-ai

🎨 『 *𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗥𝗦* 』
❏ security
❏ sessioncheck
❏ blockunknown
❏ autoblock
❏ host
❏ antispam
❏ antibugs
❏ attp
❏ gimage
❏ mp3
❏ ss
❏ fancy
❏ url
❏ url2
❏ shorten
❏ sticker
❏ take

🔍 『 *𝗦𝗘𝗔𝗥𝗖𝗛 & 𝗧𝗢𝗢𝗟𝗦* 』
❏ google
❏ mediafire
❏ quranvideo
❏ quraimage
❏ facebook
❏ instagram
❏ tiktok
❏ lyrics
❏ ytsearch
❏ app
❏ bing
❏ ipstalk
❏ imdb
❏ pinterest
❏ githubstalk
❏ image
❏ ringtone
❏ playstore
❏ shazam

🎮 『 *𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦* 』
❏ getpp
❏ avatar
❏ wcg
❏ joke
❏ ttt
❏ yesorno
❏ connect4
❏ rank
❏ quizz
❏ movie
❏ flirt
❏ givetext
❏ roast
❏ anime
❏ profile
❏ ebinary
❏ fetch
❏ qc
❏ couple
❏ poll
❏ score
❏ toqr
❏ tempmail

👥 『 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟* 』
❏ kickall
❏ remove
❏ tagall
❏ hidetag
❏ forward
❏ getall
❏ group open
❏ group close
❏ add
❏ vcf
❏ left
❏ promoteall
❏ demoteall
❏ setdescription
❏ linkgc
❏ antilink
❏ antilink2
❏ antisticker
❏ antispam
❏ create
❏ setname
❏ promote
❏ demote
❏ groupinfo
❏ balance

🔞 『 *𝗛𝗘𝗡𝗧𝗔𝗜* 』
❏ hneko
❏ trap
❏ hwaifu
❏ hentai

🎧 『 *𝗔𝗨𝗗𝗜𝗢 𝗘𝗙𝗙𝗘𝗖𝗧𝗦* 』
❏ earrape
❏ deep
❏ blown
❏ bass
❏ nightcore
❏ fat
❏ fast
❏ robot
❏ tupai
❏ smooth
❏ slow
❏ reverse

💫 『 *𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦* 』
❏ bonk
❏ bully
❏ yeet
❏ slap
❏ nom
❏ poke
❏ awoo
❏ wave
❏ smile
❏ dance
❏ smug
❏ blush
❏ cringe
❏ sad
❏ happy
❏ shinobu
❏ cuddle
❏ glomp
❏ handhold
❏ highfive
❏ kick
❏ kill
❏ kiss
❏ cry
❏ bite
❏ lick
❏ pat
❏ hug

━━━━━━━━━━━━━━━━━━
⚡ *POPᴋID GLE V2.0* ⚡
━━━━━━━━━━━━━━━━━━
    `.trim();

    const newsletterContext = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "Popkid-Gle",
        newsletterJid: "120363420342566562@newsletter"
      }
    };

    // menu image message
    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      contextInfo: newsletterContext
    }, { quoted: m });

    // 🎵 popkid random songs
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
