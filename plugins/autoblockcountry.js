import fs from 'fs';
import path from 'path';
import config from '../config.cjs';

const dataPath = path.resolve('./data/block-unknown.json');

// Create data file if not exists
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({ enabled: false }, null, 2));
}

// Utility: Get & Set state
const getStatus = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8')).enabled;
const setStatus = (state) => fs.writeFileSync(dataPath, JSON.stringify({ enabled: state }, null, 2));

// 🌟 Main Command + Listener
const blockUnknownCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const command = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const args = m.body.slice(prefix.length + command.length).trim().toLowerCase();

  // 🧠 Auto-block enforcement
  const shouldCheck = m.key.fromMe === false && m.key.remoteJid.endsWith('@s.whatsapp.net');
  if (shouldCheck && getStatus() && !m.isGroup) {
    const sender = m.sender;
    const isSaved = Object.keys(Matrix.contacts || {}).includes(sender);
    if (!isSaved) {
      await Matrix.updateBlockStatus(sender, 'block');
      const number = sender.replace(/\D/g, '');
      await Matrix.sendMessage(config.OWNER_NUMBER + '@s.whatsapp.net', {
        text: `🚫 *Blocked Unknown*\n• Number: wa.me/${number}\n• Reason: Not in contact list`,
      });
      return;
    }
  }

  // 🎯 If not .blockunknown command, return
  if (command !== 'blockunknown') return;

  if (!isCreator) return m.reply('⛔ *Access Denied!*\nOnly the bot owner can use this command.');

  // 🎛 Command Options
  if (args === 'on') {
    setStatus(true);
    return m.reply(`✅ *Block Unknown Enabled!*\n\nAny unsaved number messaging you will be *automatically blocked*.`);
  }

  if (args === 'off') {
    setStatus(false);
    return m.reply(`🛑 *Block Unknown Disabled!*\n\nNew unsaved numbers will *not be blocked* automatically.`);
  }

  const status = getStatus() ? '🟢 Enabled' : '🔴 Disabled';

  return m.reply(
`📲 *Block Unknown Control Panel*

🔐 Current Status: ${status}

🛠 Usage:
• \`${prefix}blockunknown on\` — Enable auto-blocking
• \`${prefix}blockunknown off\` — Disable auto-blocking

ℹ️ When enabled, any user not in your contacts who texts you will be instantly blocked.`
  );
};

export default blockUnknownCommand;
