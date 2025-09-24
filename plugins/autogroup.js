import cron from "node-cron";
import moment from "moment-timezone";
import config from "../config.cjs";

let scheduledTasks = {};

const groupSetting = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "group") return;
    if (!m.isGroup) return m.reply("📛 *This command can only be used in groups.*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;

    const botNumber = await gss.decodeJid(gss.user.id);
    const botAdmin = participants.find(p => p.id === botNumber)?.admin !== null;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin !== null;

    if (!botAdmin) return m.reply("📛 *I must be an admin to use this command!*");
    if (!senderAdmin) return m.reply("📛 *You must be an admin to use this command!*");

    const args = text.split(/\s+/);
    if (!args[0]) {
      return m.reply(
        `⚙️ Usage:\n\n` +
        `• *${prefix}group open* → Open group immediately\n` +
        `• *${prefix}group close* → Close group immediately\n` +
        `• *${prefix}group open 04:00 PM* → Schedule open\n` +
        `• *${prefix}group close 10:00 PM* → Schedule close`
      );
    }

    const action = args[0].toLowerCase();
    const time = args.slice(1).join(" ");

    // Immediate action
    if (!time) {
      if (action === "open") {
        await gss.groupSettingUpdate(m.from, "not_announcement");
        return m.reply("✅ Group is now *OPEN* (everyone can send messages).");
      }
      if (action === "close") {
        await gss.groupSettingUpdate(m.from, "announcement");
        return m.reply("✅ Group is now *CLOSED* (only admins can send messages).");
      }
      return m.reply("⚠️ Invalid option! Use `open` or `close`.");
    }

    // Validate time format
    if (!moment(time, ["h:mm A", "HH:mm"], true).isValid()) {
      return m.reply("⚠️ Invalid time format. Use `HH:mm AM/PM` (e.g., 04:30 PM).");
    }

    const [hour, minute] = moment(time, ["h:mm A", "HH:mm"]).format("HH:mm").split(":");
    const cronTime = `${minute} ${hour} * * *`;

    if (!scheduledTasks[m.from]) scheduledTasks[m.from] = [];

    const task = cron.schedule(
      cronTime,
      async () => {
        try {
          if (action === "open") {
            await gss.groupSettingUpdate(m.from, "not_announcement");
            await gss.sendMessage(m.from, { text: "✅ Scheduled: Group is now *OPEN*" });
          } else if (action === "close") {
            await gss.groupSettingUpdate(m.from, "announcement");
            await gss.sendMessage(m.from, { text: "✅ Scheduled: Group is now *CLOSED*" });
          }
        } catch (err) {
          console.error("Scheduled error:", err);
        }
      },
      { timezone: config.TIMEZONE || "Africa/Nairobi" }
    );

    scheduledTasks[m.from].push(task);

    return m.reply(`📅 Group will be set to *${action.toUpperCase()}* at ${time}.`);
  } catch (error) {
    console.error("❌ Group command error:", error);
    m.reply("⚠️ An error occurred while processing the group command.");
  }
};

export default groupSetting;
