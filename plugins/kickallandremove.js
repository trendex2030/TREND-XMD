import config from "../config.cjs";

const kickall = async (m, sock) => {
  const prefix = config.PREFIX || ".";
  const body = m.body || "";
  const args = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/ +/) : [];
  const cmd = args.shift()?.toLowerCase();

  if (cmd !== "kickall") return;

  try {
    if (!m.isGroup) {
      return await m.reply("❌ This command only works in groups!");
    }

    const metadata = await sock.groupMetadata(m.from);
    const participants = metadata.participants || [];

    // check if user is admin/owner
    const isAdmin = participants.some(
      (p) => p.id === m.sender && (p.admin === "admin" || p.admin === "superadmin")
    );
    if (!isAdmin && m.sender !== config.OWNER_NUMBER + "@s.whatsapp.net") {
      return await m.reply("❌ Only group admins or bot owner can use this command!");
    }

    await m.React("⚠️");
    await m.reply(`🚨 Removing all members from *${metadata.subject}*...`);

    for (const p of participants) {
      // don’t kick yourself, the bot, or the owner
      if (
        p.id === m.sender ||
        p.id === sock.user.id ||
        p.id === (config.OWNER_NUMBER + "@s.whatsapp.net")
      ) {
        continue;
      }

      try {
        await sock.groupParticipantsUpdate(m.from, [p.id], "remove");
      } catch (err) {
        console.error(`❌ Failed to kick ${p.id}:`, err.message);
      }
    }

    await m.React("✅");
    await m.reply("✅ All members have been removed.");
  } catch (err) {
    console.error("❌ Error in .kickall command:", err.message);
    await m.reply("❌ Failed to kick all members.");
  }
};

export default kickall;
