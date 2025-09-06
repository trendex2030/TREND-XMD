import config from '../config.cjs';

const tagAll = async (m, Matrix, { participants, isAdmins, isGroupOwner, isCreator, isBotAdmins }) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "tagall") {
    if (!m.isGroup) return m.reply("*❌ This command only works in groups.*");
    if (!isAdmins && !isGroupOwner && !isCreator) return m.reply("*❌ Only admins can use this command.*");
    if (!isBotAdmins) return m.reply("*❌ I must be an admin to use this.*");

    let me = m.sender;
    let q = m.text.split(' ').slice(1).join(' ').trim(); // Message after command
    let teks = `*👥 TAGGED BY:* @${me.split("@")[0]}\n\n*📩 MESSAGE:* ${q || "No message"}\n\n`;

    for (let mem of participants) {
      teks += `@${mem.id.split("@")[0]}\n`;
    }

    await Matrix.sendMessage(
      m.chat,
      { text: teks, mentions: participants.map((a) => a.id) },
      { quoted: m }
    );
  }
};

export default tagAll;
