// plugins/antidelete.js
import config from "../config.cjs";

let antiDeleteEnabled = true; // default ON

const antidelete = async (m, Matrix) => {
  try {
    if (!m.body?.startsWith(config.PREFIX)) return;
    const [cmd, arg] = m.body.slice(config.PREFIX.length).trim().split(" ");

    if (cmd.toLowerCase() === "antidelete") {
      if (!arg) {
        return m.reply(
          `📢 AntiDelete is: ${antiDeleteEnabled ? "✅ ON" : "❌ OFF"}`
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
  } catch (e) {
    console.error("Error in AntiDelete command:", e);
  }
};

// === Bind deleted message recovery ===
export function bindAntiDelete(Matrix) {
  Matrix.ev.on("messages.update", async (updates) => {
    try {
      if (!antiDeleteEnabled) return;

      for (const { key, update } of updates) {
        // Check if it's a revoke event
        if (update.messageStubType !== 1) continue;

        const jid = key.remoteJid;
        const msgId = key.id;
        const from = key.participant || jid;

        // Load the deleted message from store
        const deletedMsg = await Matrix.loadMessage(jid, msgId);
        if (!deletedMsg) return;

        // Notify owner
        await Matrix.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
          text: `🚨 *Deleted Message Recovered!*\n\n👤 From: ${from}\n📍 Chat: ${jid}\n\nForwarded below 👇`
        });

        // Forward the deleted message itself
        await Matrix.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
          forward: deletedMsg,
        });
      }
    } catch (err) {
      console.error("❌ AntiDelete error:", err);
    }
  });
}

export default antidelete;
