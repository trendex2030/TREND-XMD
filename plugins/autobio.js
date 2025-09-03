// plugins/autobio.js
let autobioEnabled = false;
let autobioInterval;

export default {
  name: "autobio",
  command: ["autobio"],
  async execute(m, sock, args) {
    const option = (args[0] || "").toLowerCase();

    if (option === "on") {
      if (autobioEnabled) return m.reply("✅ Autobio is already running");
      autobioEnabled = true;
      m.reply("✅ Real-time autobio started");

      autobioInterval = setInterval(async () => {
        try {
          const now = new Date();
          const timeString = now.toLocaleTimeString("en-GB", { hour12: false });
          const dateString = now.toLocaleDateString("en-GB");
          const bio = `🕒 ${dateString} ${timeString} | ⚡ TREND-XMD Bot`;

          await sock.updateProfileStatus(bio);
          console.log("🔄 Autobio updated:", bio);
        } catch (e) {
          console.error("❌ Autobio error:", e);
        }
      }, 60000); // updates every 1 minute
    }

    else if (option === "off") {
      if (!autobioEnabled) return m.reply("⛔ Autobio is already off");
      clearInterval(autobioInterval);
      autobioEnabled = false;
      m.reply("⛔ Autobio stopped");
    }

    else {
      m.reply("Usage: autobio on / autobio off");
    }
  }
};
