// plugins/antidelete.js
import config from "../config.cjs";

let antiDeleteEnabled = true; // default ON

const antidelete = async (m, Matrix) => {
  try {
    // === Command Handling ===
    if (m.body?.startsWith(config.PREFIX)) {
      const [cmd, arg] = m.body.slice(config.PREFIX.length).trim().split(" ");

      if (cmd.toLowerCase() === "antidelete") {
        if (!arg) {
          return m.reply(
            `📢 AntiDelete is currently: ${antiDeleteEnabled ? "✅ ON" : "❌ OFF"}`
          );
        }

        if (arg.toLowerCase() === "on") {
          antiDeleteEnabled = true;
          return m.reply("✅ AntiDelete has been enabled!");
        }

        if (arg.toLowerCase() === "off") {
          antiDeleteEnabled = false;
          return m.reply("❌ AntiDelete has been disabled!");
        }
      }
    }
  } catch (e) {
    console.error("Error in AntiDelete command:", e);
  }
};

// === Bind delete event listener ===
export function bindAntiDelete(Matrix) {
  Matrix.ev.on("messages.delete", async (del) => {
    try {
      if (!antiDeleteEnabled) return;

      const jid = del.keys[0].remoteJid;
      const from = del.keys[0].participant || jid;
      const msgId = del.keys[0].id;

      // Fetch deleted message
      const deletedMsg = await Matrix.loadMessage(jid, msgId);
      if (!deletedMsg) return;

      // Forward deleted message to OWNER inbox
      await Matrix.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
        text: `🗑 Deleted message detected\n\n👤 From: ${from}\n📍 Chat: ${jid}\n\nForwarded below 👇`
      });

      await Matrix.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
        forward: deletedMsg
      });
    } catch (err) {
      console.error("Error forwarding deleted message:", err);
    }
  });
}

export default antidelete;
