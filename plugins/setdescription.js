import config from '../config.cjs';

const setDescription = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['setdescription', 'setdesc', 'setgroupbio'];
    if (!validCommands.includes(cmd)) return;

    if (!m.isGroup)
      return m.reply('🚫 *This command can only be used in group chats!*');

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    if (!botAdmin)
      return m.reply('🛑 *I need to be an admin to set the group description.*');

    if (!senderAdmin)
      return m.reply('⚠️ *Only group admins can use this command.*');

    if (!text)
      return m.reply(`✍️ *Please provide the new group description.*\n\n📌 Example:\n\`${prefix}setdesc Welcome to Popkid's World 🌍\``);

    await gss.groupUpdateDescription(m.from, text);

    await gss.sendMessage(m.from, {
      text: `✅ *Group Description Updated Successfully!*\n\n📝 *New Description:*\n➥ _${text}_`,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "TREND-X",
          newsletterJid: "120363401765045963@newsletter",
        },
        externalAdReply: {
          title: "TREND-X",
          body: "Group Bio Set Successfully!",
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          thumbnailUrl: 'https://files.catbox.moe/kiy0hl.jpg',
          sourceUrl: "https://github.com/popkid-xmd"
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Error in setDescription:', error);
    await m.reply('❌ *Oops! Something went wrong while setting the group description.*');
  }
};

export default setDescription;
