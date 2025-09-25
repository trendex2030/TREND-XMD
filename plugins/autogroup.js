// 📂 plugins/groupControl.js
import config from "../config.cjs";

const groupControl = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const cmd = body.startsWith(prefix)
      ? body.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";

    if (cmd !== "open" && cmd !== "close") return;

    if (!m.isGroup) return m.reply("⚠️ This command only works in groups.");

    const metadata = await Matrix.groupMetadata(m.chat);
    const admins = metadata.participants
      .filter((p) => p.admin !== null)
      .map((p) => p.id);

    const botId = Matrix.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmin = admins.includes(botId);
    const isUserAdmin = admins.includes(m.sender);

    if (!isUserAdmin) return m.reply("❌ Only *group admins* can use this.");
    if (!isBotAdmin) return m.reply("⚠️ I must be *admin* to manage the group.");

    if (cmd === "close") {
      await Matrix.groupSettingUpdate(m.chat, "announcement"); // only admins can send
      return m.reply("🔒 Group has been *closed* (only admins can chat).");
    }

    if (cmd === "open") {
      await Matrix.groupSettingUpdate(m.chat, "not_announcement"); // everyone can send
      return m.reply("🔓 Group has been *opened* (everyone can chat).");
    }
  } catch (err) {
    console.error("❌ GroupControl Error:", err);
    return m.reply("⚠️ Failed to update group settings. Check logs.");
  }
};

export default groupControl;
