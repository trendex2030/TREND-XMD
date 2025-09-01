import config from '../config.cjs';

const linkgc = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['linkgc', 'grouplink'];
    if (!validCommands.includes(cmd)) return;

    if (!m.isGroup) {
      return m.reply('🚫 *GROUP ONLY COMMAND*');
    }

    const groupMetadata = await gss.groupMetadata(m.from);
    const botNumber = await gss.decodeJid(gss.user.id);
    const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

    if (!isBotAdmin) {
      return m.reply('🛑 *BOT NEEDS TO BE ADMIN TO FETCH GROUP LINK*');
    }

    const groupCode = await gss.groupInviteCode(m.from);
    const groupLink = `https://chat.whatsapp.com/${groupCode}`;

    await gss.sendMessage(m.from, {
      text: `
╭━━━「 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗡𝗞 」━━⬣
┃ 🧷 *Group:* ${groupMetadata.subject}
┃ 🔗 *Link:* ${groupLink}
┃ 👤 *Requested By:* @${m.sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━⬣
      `.trim(),
      mentions: [m.sender],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "TREND-X GROUP LINK",
          body: "Tap to join or share this link",
          thumbnailUrl: "https://i.imgur.com/90MsvzN.png",
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: groupLink
        }
      }
    });

  } catch (error) {
    console.error('Group Link Error:', error);
    m.reply('❗ *AN ERROR OCCURRED WHILE FETCHING THE GROUP LINK*');
  }
};

export default linkgc;
