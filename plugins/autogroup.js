import cron from 'node-cron';
import moment from 'moment-timezone';
import config from '../config.cjs';

let scheduledTasks = {};

const groupSetting = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'group') return;

    if (!m.isGroup) return m.reply("*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botNumber = await gss.decodeJid(gss.user.id);
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    if (!botAdmin) return m.reply("*📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND*");
    if (!senderAdmin) return m.reply("*📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND*");

    const args = text.split(/\s+/);
    if (!args[0]) {
      return m.reply(`Usage:\n*${prefix}group open*\n*${prefix}group close*\n*${prefix}group open 04:00 PM*\n*${prefix}group close 10:30 AM*`);
    }

    const action = args[0].toLowerCase();
    const time = args.slice(1).join(' ');

    if (!['open', 'close'].includes(action)) {
      return m.reply('Invalid option. Use *open* or *close*.');
    }

    // If no time → immediate update
    if (!time) {
      await gss.groupSettingUpdate(m.from, action === 'close' ? 'announcement' : 'not_announcement');
      return m.reply(`✅ Group successfully ${action}ed.`);
    }

    // Parse time using moment
    const parsed = moment.tz(time, ['h:mm A', 'hh:mm A'], true, config.TIMEZONE || 'Asia/Kolkata');
    if (!parsed.isValid()) {
      return m.reply(`⚠️ Invalid time format. Use HH:mm AM/PM\nExample: *${prefix}group open 04:00 PM*`);
    }

    const cronTime = `${parsed.minute()} ${parsed.hour()} * * *`;
    const tz = config.TIMEZONE || 'Asia/Kolkata';

    // Clear existing task
    if (scheduledTasks[m.from]) {
      scheduledTasks[m.from].stop();
      delete scheduledTasks[m.from];
    }

    scheduledTasks[m.from] = cron.schedule(cronTime, async () => {
      try {
        await gss.groupSettingUpdate(m.from, action === 'close' ? 'announcement' : 'not_announcement');
        await gss.sendMessage(m.from, { text: `⏰ Scheduled task executed → Group ${action}ed.` });
      } catch (err) {
        console.error('Scheduled task error:', err);
      }
    }, { timezone: tz });

    m.reply(`✅ Group will be set to *${action}* at ${parsed.format('hh:mm A')} (${tz})`);

  } catch (error) {
    console.error('Error:', error);
    m.reply('❌ An error occurred while processing the command.');
  }
};

export default groupSetting;
