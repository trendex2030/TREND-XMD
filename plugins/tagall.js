import config from '../config.cjs';

const tagAll = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "tagall") {
    if (!m.isGroup) return m.reply("*❌ This command only works in groups.*");

    // Fetch group metadata
    const metadata = await Matrix.groupMetadata(m.chat);
    const participants = metadata.participants || [];

    // Optional: restrict to admins only
    const sender = m.sender;
    const senderData = participants.find((p) => p.id === sender);
    const isAdmin = senderData?.admin !== null && senderData?.admin !== undefined;

    if (!isAdmin) return m.reply("*❌ Only group admins can use this command.*");

    // Extract custom message after command
    let q = m.text.split(' ').slice(1).join(' ').trim();
    let teks = `*👥 TAGGED BY:* @${sender.split("@")[0]}\n\n*📩 MESSAGE:* ${q || "No message"}\n\n`;

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
