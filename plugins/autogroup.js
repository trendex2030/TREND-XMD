import config from "../config.cjs";

const groupSetting = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const cmd = body.startsWith(prefix)
      ? body.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";
    const args = body.slice(prefix.length + cmd.length).trim().split(/\s+/);

    if (cmd !== "group") return;
    if (!m.isGroup) return m.reply("📛 *This command only works in groups.*");

    const meta = await Matrix.groupMetadata(m.chat);
    const participants = meta.participants || [];

    const botJid = Matrix.decodeJid(Matrix.user.id);
    const botInfo = participants.find(p => p.id === botJid);
    const userInfo = participants.find(p => p.id === m.sender);

    const botAdmin = botInfo?.admin === "admin" || botInfo?.admin === "superadmin";
    const senderAdmin = userInfo?.admin === "admin" || userInfo?.admin === "superadmin";

    if (!botAdmin) return m.reply("📛 *I must be an admin to use this command.*");
    if (!senderAdmin) return m.reply("📛 *You must be an admin to use this command.*");

    if (!args[0]) {
      return m.reply(
        `⚙️ Usage:\n\n` +
        `• *${prefix}group open* → Open group (everyone can chat)\n` +
        `• *${prefix}group close* → Close group (only admins chat)`
      );
    }

    const action = args[0].toLowerCase();

    if (action === "open") {
      await Matrix.groupSettingUpdate(m.chat, "not_announcement");
      return m.reply("✅ Group is now *OPEN* (everyone can chat).");
    } else if (action === "close") {
      await Matrix.groupSettingUpdate(m.chat, "announcement");
      return m.reply("✅ Group is now *CLOSED* (only admins can chat).");
    } else {
      return m.reply("⚠️ Invalid option. Use `open` or `close`.");
    }
  } catch (err) {
    console.error("❌ Group command error:", err);
    return m.reply("⚠️ Failed to update group settings. Maybe I'm not admin?");
  }
};

export default groupSetting;
