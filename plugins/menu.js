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

    const menuSections = {
    header: {
      title: '☘ 𝗞𝗘𝗩𝗜𝗡 𝗧𝗘𝗖𝗛 ☘',
      content: [
        `👤 ᴏᴡɴᴇʀ: ☘ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ ☘`,
        `👤 ᴜsᴇʀ: ${pushname || 'Unknown'}`,
        `🤖 ʙᴏᴛɴᴀᴍᴇ: ᴠɪɴɪᴄ xᴍᴅ`,
        `🌍 ᴍᴏᴅᴇ: ${conn.public ? 'ᴘᴜʙʟɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}`,
        `🛠️ ᴘʀᴇғɪx: [ ${prefix} ]`,
        `📈 ᴄᴍᴅs: 100+`, // Replace with actual command count if available
        `🧪 ᴠᴇʀsɪᴏɴ: 1.0.0-beta`,
      ],
    },
    bug: {
      title: '> 𝗕𝗨𝗚 𝗠𝗘𝗡𝗨 ',
      commands: [
        '𝖨𝗇𝗏𝗂𝗌', '𝖷𝖼𝗋𝖺𝗌𝗁', '𝖢𝗋𝖺𝗌𝗁', '𝖣𝖾𝗅𝖺𝗒',
        '𝙲𝚛𝚊𝚡', '𝖣𝖾𝗅𝖺𝗒𝖼𝗈𝗆𝖻𝗈', '𝖣𝖺𝗋𝗄', '𝖣𝗂𝗆', 'Vinic-crash',
      ],
    },
    owner: {
      title: '> 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨  ',
      commands: [
        '𝖠𝖽𝖽𝗉𝗋𝖾𝗆 <number>', '𝖣𝖾𝗅𝗉𝗋𝖾𝗆 <number>', '𝖯𝗎𝖻𝗅𝗂𝖼', 'private',
        '𝙸𝚍𝚌𝚑', '𝙲𝚛𝚎𝚊𝚝𝚎𝚌𝚑',
        'antidelete', 'delete', 'setpp', 'lastseen', 'groupid', 'reportbug',
        'listblocked', 'online', 'join', 'leave', 'setbio', 'reqeust', 'block', 'toviewonce', 'autoviewstatus', 'unblock', 'unblockall',
        'anticall', 'antibug', 'vv', 'idch','autorecording', 'autotyping', 'getpp',
      ],
    },
    group: {
      title: '> 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨  ',
      commands: [
        '𝖧𝗂𝖽𝖾𝗍𝖺𝗀', '𝖪𝗂𝖼𝗄', '𝖱𝖾𝗌𝖾𝗍𝗅𝗂𝗇𝗄', 'linkgc', 'checkchan',
        'antilink', 'listonline', 'add', 'listactive', 'listinactive', 'close',
        'open', 'kick', 'closetime', 'disappear', 'opentime', 'poll', 'totalmembers', 'mediatag', 'getgrouppp', 'antilink', 'tagall', 'tagadmin', 'setgroupname', 'delgrouppp', 'invite', 'editinfo', 'promote', 'demote', 'setdisc', 
      ],
    },
    download: {
      title: '> 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨 ',
      commands: ['play', 'play2', 'song', 'gitclone', 'mediafire',  'ytmp4', 'apk',  'tiktok', 'tiktok2', 'facebook'],
    },
    convert: {
      title: '> 𝗖𝗢𝗡𝗩𝗘𝗥𝗧 𝗠𝗘𝗡𝗨 ',
      commands: ['toaudio', 'toimage', 'url', 'tovideo', 'sticker'],
    },
    cmdTool: {
      title: '> 𝗖𝗠𝗗 𝗧𝗢𝗢𝗟 𝗠𝗘𝗡𝗨 ',
      commands: ['ping', 'repo', 'botstatus', 'botinfo', 'sc', 'serverinfo', 'alive'],
    },
    other: {
      title: '> 𝗢𝗧𝗛𝗘𝗥 𝗠𝗘𝗡𝗨  ',
      commands: ['time', 'calculate', 'sticker', 'owner', 'dev', 'fliptext', 'say', 'getdevice', 'getabout', 'sswebtab'],
    },
    ephoto: {
      title: '> 𝗘𝗣𝗛𝗢𝗧𝗢𝟯𝟲𝟬 𝗠𝗔𝗞𝗘𝗥 ',
      commands: ['blackpinklogo', 'blackpinkstyle', 'glossysilver', 'glitchtext', 'flux', 'dragonball'],
    },
    search: {
      title: '> 𝗦𝗘𝗔𝗥𝗖𝗛 𝗠𝗘𝗡𝗨 ',
      commands: ['lyrics', 'chord', 'weather', 'movie', 'shazam'],
    },
    fun: {
      title: '> 𝗙𝗨𝗡 𝗠𝗘𝗡𝗨 ',
      commands: ['dare', 'Quotes', 'truth', 'compatibility', 'compliment', 'hack', 'jokes'],
    },
    religion: {
      title: '> 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 𝗠𝗘𝗡𝗨 ',
      commands: ['Bible', 'Quran'],
    },
    };
  

  // Function to format the menu
  const formatMenu = () => {
    let menu = `╭═✦〔 🤖 ᴠɪɴɪᴄ xᴅ 〕✦═╮\n`;
    menu += menuSections.header.content.map(line => `│ ${line}`).join('\n') + '\n';
    menu += `╰═✦═════════════╯\n\n`;

    for (const section of Object.values(menuSections).slice(1)) {
      menu += `${section.title}\n`;
      menu += section.commands.map(cmd => `│ ✦ ${prefix}${cmd}`).join('\n') + '\n';
      menu += `╰─────────\n\n`;
    }
    menu += `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ `;
    return menu;
  };

  try {
    // Send menu with image
    await conn.sendMessage(m.chat, {
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
          title: global.botname || 'ᴠɪɴɪᴄ xᴍᴅ',
          body: '☘ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ ☘',
          mediaType: 3,
          renderLargerThumbnail: false,
          thumbnail: cina, // Ensure 'cina' is defined or replace with valid thumbnail
          sourceUrl: 'https://whatsapp.com/channel/0029Vb6eR1r05MUgYul6Pc2W',
        },
      },
    }, { quoted: m });

    // Send audio
    await conn.sendMessage(m.chat, {
      audio: { url: 'https://files.catbox.moe/jdozs7.mp3' },
      mimetype: 'audio/mpeg',
      ptt: true,
    }, { quoted: m });
  } catch (error) {
    console.error('Error sending menu:', error);
    await conn.sendMessage(m.chat, {
      text: '⚠️ Error displaying menu. Please try again!',
    }, { quoted: m });
        }
};

export default menu;
