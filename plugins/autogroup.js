// groupControl.js
import config from "../config.cjs";

const groupControl = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";

    if (cmd !== "close" && cmd !== "open") return;

    if (!m.isGroup) return m.reply("⚠️ This command only works in groups.");

    // Fetch group metadata
    const metadata = await gss.groupMetadata(m.chat);
    const admins = metadata.participants
      .filter((p) => p.admin !== null)
      .map((p) => p.id);

    const botNumber = gss.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmin = admins.includes(botNumber);
    const isUserAdmin = admins.includes(m.sender);

    // === CHECKS ===
    if (!isUserAdmin) return m.reply("❌ Only group admins can use this command.");
    if (!isBotAdmin) return m.reply("⚠️ I need to be an admin to manage the group.");

    // === CLOSE GROUP ===
    if (cmd === "close") {
      await gss.groupSettingUpdate(m.chat, "announcement"); // group closed
      return m.reply("🔒 Group has been *closed*.\nOnly admins can send messages now.");
    }

    // === OPEN GROUP ===
    if (cmd === "open") {
      await gss.groupSettingUpdate(m.chat, "not_announcement"); // group open
      return m.reply("🔓 Group has been *opened*.\nEveryone can send messages now.");
    }
  } catch (err) {
    console.error("❌ GroupControl Error:", err);
    await m.reply("⚠️ An error occurred while processing group commands.");
  }
};

export default groupControl;
