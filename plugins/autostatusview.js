import config from "../config.cjs";

// 🔧 Main Command Handler
const anticallCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, `${config.OWNER_NUMBER}@s.whatsapp.net`].includes(m.sender);

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ["autostatus", "autosview", "autostatusview"];

  // 🛠 Handle Auto Status View Toggles
  if (validCommands.includes(cmd)) {
    if (!isCreator) {
      return m.reply("⛔ *OWNER ONLY COMMAND!*\n\n> _You are not authorized to perform this action._");
    }

    let responseMessage;

    if (text === "on") {
      config.AUTO_STATUS_SEEN = true;
      responseMessage = "✅ *AUTO STATUS VIEW has been ENABLED.*\n\n> _Bot will now auto-view all statuses._";
    } else if (text === "off") {
      config.AUTO_STATUS_SEEN = false;
      responseMessage = "❎ *AUTO STATUS VIEW has been DISABLED.*\n\n> _Bot will no longer view statuses._";
    } else {
      responseMessage =
        `📘 *Auto Status View Control:*\n\n` +
        `• *${prefix + cmd} on* – Enable auto status viewing\n` +
        `• *${prefix + cmd} off* – Disable auto status viewing`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error("❌ Error processing AutoStatus command:", error);
      await Matrix.sendMessage(m.from, { text: "⚠️ *Error processing your request.*" }, { quoted: m });
    }
  }
};

export default anticallCommand;
