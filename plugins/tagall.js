import config from "../config.cjs";

const tagall = async (m, sock) => {
  const prefix = config.PREFIX || ".";
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  if (cmd !== "tagall") return;

  try {
    if (!m.isGroup) {
      return await m.reply("❌ This command only works in groups!");
    }

    await m.React("📢");

    // fetch group metadata
    const metadata = await sock.groupMetadata(m.from);
    const participants = metadata.participants || [];

    const mentions = participants.map((p) => p.id);
    const listText = participants
      .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
      .join("\n");

    const message = `
*📢 TAG ALL MEMBERS 📢*

${listText}
    `.trim();

    await sock.sendMessage(
      m.from,
      {
        text: message,
        mentions,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error("❌ Error in .tagall command:", err.message);
    await m.reply("❌ Failed to tag all members.");
  }
};

export default tagall;
