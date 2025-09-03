// autobio.js
let autobioEnabled = false;
let autobioInterval;

// Start real-time autobio
export function startAutobio(sock) {
  if (autobioEnabled) return;

  autobioEnabled = true;
  console.log("✅ Real-time Autobio started");

  autobioInterval = setInterval(async () => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
      const dateString = now.toLocaleDateString('en-GB');
      const bio = `🕒 ${dateString} ${timeString} | ⚡ TREND-XMD Bot`;
      
      await sock.updateProfileStatus(bio);
      console.log("🔄 Bio updated:", bio);
    } catch (err) {
      console.error("❌ Error updating bio:", err);
    }
  }, 1000); // update every 1 second
}

// Stop autobio
export function stopAutobio() {
  if (!autobioEnabled) return;
  autobioEnabled = false;
  clearInterval(autobioInterval);
  console.log("⛔ Real-time Autobio stopped");
}

// Command handler
export async function autobioCommand(m, sock, command) {
  if (command === "autobio on") {
    await m.reply("✅ Real-time Autobio is now ON");
    startAutobio(sock);
  } else if (command === "autobio off") {
    await m.reply("⛔ Real-time Autobio is now OFF");
    stopAutobio();
  } else {
    await m.reply("Usage: autobio on / autobio off");
  }
      }
