import moment from "moment-timezone";
import config from "../config.cjs";

let autoBioInterval = null;
let autoBioEnabled = false;

const autoBio = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";
    const text = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();

    if (cmd !== "autobio") return;

    // Enable autobio
    if (text === "on") {
      if (autoBioEnabled) return m.reply("✅ AutoBio is already running.");

      autoBioEnabled = true;

      autoBioInterval = setInterval(async () => {
        try {
          const tz = config.TIMEZONE || "Africa/Nairobi"; // default timezone
          const timeNow = moment().tz(tz).format("hh:mm:ss A - dddd, MMMM Do YYYY");

          await gss.updateProfileStatus(`⏰ ${timeNow}`);
          console.log(`Bio updated: ${timeNow}`);
        } catch (err) {
          console.error("❌ Failed to update bio:", err);
        }
      }, 1000); // every second

      await m.reply("✅ AutoBio enabled! Your bio will now update *every second* with real time.");
    }

    // Disable autobio
    else if (text === "off") {
      if (!autoBioEnabled) return m.reply("⚠️ AutoBio is not running.");

      clearInterval(autoBioInterval);
      autoBioInterval = null;
      autoBioEnabled = false;

      await m.reply("❌ AutoBio disabled! Bio updates stopped.");
    }

    // Show status
    else if (text === "status") {
      const statusMsg = autoBioEnabled
        ? "✅ AutoBio is currently *enabled* and updating every second."
        : "❌ AutoBio is currently *disabled*.";
      await m.reply(statusMsg);
    }

    // Help menu
    else {
      await m.reply(
        `🛡️ *AutoBio Commands* 🛡️
        
• ${prefix}autobio on      → Enable autobio (real-time, every second)
• ${prefix}autobio off     → Disable autobio
• ${prefix}autobio status  → Show autobio status`
      );
    }
  } catch (error) {
    console.error("❌ AutoBio Error:", error);
    await m.reply("⚠️ An error occurred while processing AutoBio.");
  }
};

export default autoBio;
