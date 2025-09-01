import config from '../config.cjs';

const leaveGroup = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['leave', 'exit', 'left'];
    if (!validCommands.includes(cmd)) return;
    if (!m.isGroup) return m.reply("🚫 *GROUP ONLY COMMAND*");
    if (!isCreator) return m.reply("🛡️ *ONLY THE BOT OWNER CAN EXECUTE THIS COMMAND*");

    const groupMetadata = await gss.groupMetadata(m.from);

    await gss.sendMessage(m.from, {
      text: `
╭━━━「 𝗘𝗫𝗜𝗧 𝗦𝗘𝗤𝗨𝗘𝗡𝗖𝗘 𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗘𝗗 」━━⬣
┃ 📛 *Bot Leaving Group...*
┃ 👋 *Group:* ${groupMetadata.subject}
┃ 🔓 *Authorized By:* @${m.sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━⬣
      `.trim(),
      mentions: [m.sender],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "TREND-X",
          body: "👋 Goodbye Group | Mission Complete",
          thumbnailUrl: "https://i.imgur.com/z3SkZVb.png",
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "https://wa.me/" + config.OWNER_NUMBER
        }
      }
    });

    await gss.groupLeave(m.from);

  } catch (error) {
    console.error('Leave Group Error:', error);
    m.reply("❗ *SOMETHING WENT WRONG WHILE LEAVING THE GROUP*");
  }
};

export default leaveGroup;
