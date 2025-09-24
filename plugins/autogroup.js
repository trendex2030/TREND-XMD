// groupControl.js
import config from "../config.cjs";

const groupControl = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";

    // ===== CLOSE GROUP =====
    if (cmd === "close") {
      if (!m.isGroup) return m.reply("⚠️ This command only works in groups.");
      if (!m.isAdmins && !m.isCreator) return m.reply("❌ Only admins can close the group.");
      if (!m.isBotAdmins) return m.reply("⚠️ I need to be an admin to close the group.");

      await gss.groupSettingUpdate(m.chat, "announcement"); // group closed
      return m.reply("🔒 Group has been *closed*.\nOnly admins can send messages now.");
    }

    // ===== OPEN GROUP =====
    if (cmd === "open") {
      if (!m.isGroup) return m.reply("⚠️ This command only works in groups.");
      if (!m.isAdmins && !m.isCreator) return m.reply("❌ Only admins can open the group.");
      if (!m.isBotAdmins) return m.reply("⚠️ I need to be an admin to open the group.");

      await gss.groupSettingUpdate(m.chat, "not_announcement"); // group open
      return m.reply("🔓 Group has been *opened*.\nEveryone can send messages now.");
    }
  } catch (err) {
    console.error("❌ GroupControl Error:", err);
    await m.reply("⚠️ An error occurred while processing group commands.");
  }
};

export default groupControl;
