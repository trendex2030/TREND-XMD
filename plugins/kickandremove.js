import config from '../config.cjs';

const kick = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['kick', 'remove'];
    if (!validCommands.includes(cmd)) return;
    if (!m.isGroup) return m.reply("🚫 *GROUP ONLY COMMAND*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    if (!botAdmin) return m.reply("❌ *BOT MUST BE ADMIN TO EXECUTE THIS*");
    if (!senderAdmin) return m.reply("⚠️ *YOU MUST BE AN ADMIN TO KICK USERS*");

    if (!m.mentionedJid) m.mentionedJid = [];
    if (m.quoted?.participant) m.mentionedJid.push(m.quoted.participant);

    const users = m.mentionedJid.length > 0
      ? m.mentionedJid
      : text.replace(/[^0-9]/g, '').length > 0
        ? [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        : [];

    if (users.length === 0) return m.reply("💡 *MENTION OR QUOTE A USER TO REMOVE*");

    const validUsers = users.filter(Boolean);

    await gss.groupParticipantsUpdate(m.from, validUsers, 'remove')
      .then(async () => {
        const kickedMentions = validUsers.map(u => `@${u.split("@")[0]}`);

        const responseText = `
╭━━━「 𝗨𝗦𝗘𝗥 𝗞𝗜𝗖𝗞𝗘𝗗 」━━⬣
┃ 🚫 *Group:* ${groupMetadata.subject}
┃ 👢 *Removed:* ${kickedMentions.join(', ')}
┃ 🔒 *Executed By:* @${m.sender.split('@')[0]}
╰━━━━━━━━━━━━━━━━━━⬣`;

        await gss.sendMessage(m.from, {
          text: responseText,
          mentions: [...validUsers, m.sender],
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
              title: "TREND-X",
              body: "⚙️ Member Removed | Control Center",
              thumbnailUrl: "https://i.imgur.com/Qo0Qo0p.jpeg",
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: "https://chat.whatsapp.com/"
            }
          }
        });
      })
      .catch(() => m.reply('❗ *FAILED TO REMOVE USER(S)*'));
  } catch (error) {
    console.error('Error:', error);
    m.reply('⚠️ *AN ERROR OCCURRED DURING EXECUTION*');
  }
};

export default kick;
