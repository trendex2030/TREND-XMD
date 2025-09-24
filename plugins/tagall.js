import config from '../config.cjs';

const tagAll = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "tagall") return;

    if (!m.isGroup) return m.reply("*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;

    // ❌ Removed botAdmin and senderAdmin restrictions

    // Build the tag message
    let message = `乂 *Attention Everyone* 乂\n\n`;
    message += text ? `*Message:* ${text}\n\n` : '';
    message += participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

    await gss.sendMessage(
      m.from,
      { text: message, mentions: participants.map(p => p.id) },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error:', error);
    await m.reply('An error occurred while processing the command.');
  }
};

export default tagAll;
