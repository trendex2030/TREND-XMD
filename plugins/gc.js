import cron from 'node-cron';
import moment from 'moment-timezone';
import config from '../config.cjs';

let scheduledTasks = {};

const groupSetting = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // ✅ Only allow "group" command
    if (cmd !== 'group') return;

    // 📛 Must be used in a group
    if (!m.isGroup) {
      return m.reply(
        "╔══✦📛✦══╗\n" +
        "  This command can only be used in *GROUPS*\n" +
        "╚══════════╝"
      );
    }

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;

    const botNumber = await gss.decodeJid(gss.user.id);
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    // 📛 Admin checks
    if (!botAdmin) {
      return m.reply("⚠️ *Bot must be an admin to manage group settings!*");
    }
    if (!senderAdmin) {
      return m.reply("⚠️ *You must be an admin to use this command!*");
    }

    const args = text.split(/\s+/);
    if (!args[0]) {
      return m.reply(
        "╔═══✦ GROUP SETTINGS ✦═══╗\n" +
        "⚙️ Usage:\n" +
        ` ➤ ${prefix + cmd} open\n` +
        ` ➤ ${prefix + cmd} close\n` +
        ` ➤ ${prefix + cmd} open 04:00 PM\n` +
        "╚════════════════════╝"
      );
    }

    const action = args[0].toLowerCase();
    const timeInput = args.slice(1).join(' ');

    // 🚪 Immediate execution if no time is given
    if (!timeInput) {
      if (action === 'close') {
        await gss.groupSettingUpdate(m.from, 'announcement');
        return m.reply("🔒 *Group has been locked (only admins can send messages).*");
      }
      if (action === 'open') {
        await gss.groupSettingUpdate(m.from, 'not_announcement');
        return m.reply("🔓 *Group has been unlocked (everyone can send messages).*");
      }
      return m.reply("❌ Invalid action. Use *open* or *close*.");
    }

    // ⏰ Validate time input
    if (!/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(timeInput)) {
      return m.reply(
        "⏰ *Invalid time format!*\n" +
        "Use `HH:mm AM/PM` format.\n\n" +
        `Example: *${prefix + cmd} open 04:00 PM*`
      );
    }

    // 🕒 Convert to 24-hour time
    const [hour, minute] = moment(timeInput, ['h:mm A', 'hh:mm A'])
      .format('HH:mm')
      .split(':')
      .map(Number);

    const cronTime = `${minute} ${hour} * * *`;
    console.log(`📅 Scheduled "${action}" at ${cronTime} IST for group ${m.from}`);

    // 🔄 Remove existing schedule for this group
    if (scheduledTasks[m.from]) {
      scheduledTasks[m.from].stop();
      delete scheduledTasks[m.from];
    }

    // ⏳ Schedule new task
    scheduledTasks[m.from] = cron.schedule(
      cronTime,
      async () => {
        try {
          console.log(`⚡ Executing "${action}" at ${moment().format('HH:mm')} IST`);
          if (action === 'close') {
            await gss.groupSettingUpdate(m.from, 'announcement');
            await gss.sendMessage(m.from, {
              text: "🔒 *Scheduled Action: Group locked.*\n(Only admins can send messages)"
            });
          } else if (action === 'open') {
            await gss.groupSettingUpdate(m.from, 'not_announcement');
            await gss.sendMessage(m.from, {
              text: "🔓 *Scheduled Action: Group unlocked.*\n(Everyone can send messages)"
            });
          }
        } catch (err) {
          console.error("❌ Error in scheduled task:", err);
          await gss.sendMessage(m.from, {
            text: "⚠️ *An error occurred while updating the group setting.*"
          });
        }
      },
      { timezone: "Asia/Kolkata" }
    );

    // ✅ Confirmation message
    return m.reply(
      "╔═══✦ SCHEDULE CONFIRMED ✦═══╗\n" +
      `📌 Action: *${action.toUpperCase()}*\n` +
      `⏰ Time: *${timeInput} IST*\n` +
      "╚══════════════════════════╝"
    );

  } catch (error) {
    console.error("❌ Error:", error);
    m.reply("⚠️ *An unexpected error occurred while processing the command.*");
  }
};

export default groupSetting;
