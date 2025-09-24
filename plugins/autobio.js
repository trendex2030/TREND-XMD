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
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "autobio") return;

    // Enable autobio
    if (text.toLowerCase() === "on") {
      if (autoBioEnabled) return m.reply("✅ AutoBio is already running.");

      autoBioEnabled = true;

      autoBioInterval = setInterval(async () => {
        try {
          const tz = config.TIMEZONE || "Africa/Nairobi";
          const timeNow = moment().tz(tz).format("hh:mm A");

          const statusMsg = `TREND-X IS ONLINE ✅ | ⏰ ${timeNow}`;

          await gss.updateProfileStatus(statusMsg);
          console.log(`✅ Bio updated: ${statusMsg}`);
        } catch (err) {
          console.error("❌ Failed to update bio:", err);
        }
      }, 60 * 1000); // every 1 minute

      await m.reply("✅ AutoBio enabled! Bio will now show *TREND-X IS ONLINE + Time*.");
    }

    // Disable autobio
    else if (text.toLowerCase() === "off") {
      if (!autoBioEnabled) return m.reply("⚠️ AutoBio is not running.");

      clearInterval(autoBioInterval);
      autoBioInterval = null;
      autoBioEnabled = false;

      await m.reply("❌ AutoBio disabled! Bio updates stopped.");
    }

    // Show status
    else if (text.toLowerCase() === "status") {
      const statusMsg = autoBioEnabled
        ? "✅ AutoBio is currently *enabled* (showing 'TREND-X IS ONLINE + Time')."
        : "❌ AutoBio is currently *disabled*.";
      await m.reply(statusMsg);
    }

    // Help menu
    else {
      await m.reply(
        `🛡️ *AutoBio Commands* 🛡️
        
• ${prefix}autobio on      → Enable autobio (TREND-X IS ONLINE + Time)
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
