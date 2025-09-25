// plugins/antidelete.js
import fs from "fs";
import path from "path";
import config from "../config.cjs";

const DB_FILE = path.join(process.cwd(), "antidelete.json");

// Load status from file
function loadStatus() {
  if (!fs.existsSync(DB_FILE)) return { enabled: false };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    return { enabled: false };
  }
}

// Save status
function saveStatus(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const antidelete = {
  bindAntiDelete(Matrix) {
    const status = loadStatus();
    if (!status.enabled) return;

    Matrix.ev.on("messages.delete", async (del) => {
      try {
        const jid = del.keys[0].remoteJid;
        const from = del.keys[0].participant || jid;
        const msgId = del.keys[0].id;

        // Fetch the deleted message
        const deletedMsg = await Matrix.loadMessage(jid, msgId);
        if (!deletedMsg) return;

        // Forward deleted message to owner inbox
        await Matrix.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
          text: `🗑 Deleted message detected\n\n👤 From: ${from}\n📍 Chat: ${jid}\n\nForwarded below 👇`
        });

        await Matrix.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
          forward: deletedMsg
        });
      } catch (e) {
        console.error("Error in AntiDelete:", e);
      }
    });

    console.log("✅ AntiDelete listeners bound");
  },

  async handleAntiDeleteCommand(m, Matrix) {
    const prefix = config.PREFIX;
    if (!m.message?.conversation?.startsWith(prefix)) return;

    const body = m.message.conversation.trim();
    const [cmd, arg] = body.slice(prefix.length).split(" ");

    if (cmd === "antidelete") {
      let status = loadStatus();

      if (!arg) {
        return Matrix.sendMessage(m.key.remoteJid, { 
          text: `📢 AntiDelete is currently: ${status.enabled ? "✅ ON" : "❌ OFF"}`
        });
      }

      if (arg.toLowerCase() === "on") {
        status.enabled = true;
        saveStatus(status);
        Matrix.sendMessage(m.key.remoteJid, { text: "✅ AntiDelete enabled!" });
        this.bindAntiDelete(Matrix); // bind immediately
      } else if (arg.toLowerCase() === "off") {
        status.enabled = false;
        saveStatus(status);
        Matrix.sendMessage(m.key.remoteJid, { text: "❌ AntiDelete disabled!" });
      }
    }
  }
};

export default antidelete;
