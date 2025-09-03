// plugins/autobio.js
let autobioEnabled = false;
let autobioInterval;

export default {
  name: "autobio",
  description: "Automatically updates WhatsApp bio in real-time",
  async execute({ m, sock, args }) {
    const command = args[0] ? args[0].toLowerCase() : '';

    if (command === "on") {
      if (autobioEnabled) return m.reply("✅ Real-time Autobio is already ON");
      autobioEnabled = true;
      m.reply("✅ Real-time Autobio is now ON");
      autobioInterval = setInterval(async () => {
        try {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
          const dateString = now.toLocaleDateString('en-GB');
          const bio = `🕒 ${dateString} ${timeString} | ⚡ TREND-XMD Bot`;
          await sock.updateProfileStatus(bio);
        } catch (err) {
          console.error("❌ Error updating bio:", err);
        }
      }, 1000);
    } else if (command === "off") {
      if (!autobioEnabled) return m.reply("⛔ Autobio is already OFF");
      autobioEnabled = false;
      clearInterval(autobioInterval);
      m.reply("⛔ Real-time Autobio stopped");
    } else {
      m.reply("Usage: autobio on / autobio off");
    }
  }
};
