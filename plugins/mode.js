import config from '../config.cjs';

const modeCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.slice(prefix.length).split(' ')[0].toLowerCase();
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'mode') return;

  const sendStyled = (txt) => Matrix.sendMessage(m.from, {
    text: txt,
    contextInfo: {
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363401765045963@newsletter",
        newsletterName: "TREND-X"
      }
    }
  });

  // 🚫 Non-Owner Response
  if (!isCreator) {
    return sendStyled(`
╭──────❖「 *❌ Access Denied* 」❖──────╮
│
│  🚫 *You are not authorized to use this command!*
│  🔐 *Only the bot owner can switch modes.*
│
╰────────────────────────────╯`);
  }

  // ✅ Mode Handling
  if (['public', 'private'].includes(text.toLowerCase())) {
    const mode = text.toLowerCase();
    Matrix.public = mode === 'public';
    config.MODE = mode;

    return sendStyled(`
╭─〔 🌐 *Bot Mode Updated* 〕─╮
│
│  ✅ *Success!*
│
│  🤖 Bot is now in: *${mode.toUpperCase()} MODE*
│
│  ✦ In *public*, everyone can use the bot.
│  ✦ In *private*, only the owner can use it.
│
╰────────────────────────╯`);
  }

  // ⚙️ Invalid or Missing Mode
  return sendStyled(`
╭──〔 ⚙️ *Mode Command Help* 〕──╮
│
│  📌 *Usage:*
│
│  ➤ *.mode public*
│     ┗ Everyone can access the bot.
│
│  ➤ *.mode private*
│     ┗ Only you (the owner) can use it.
│
│  🔐 *Current Mode:* ${config.MODE?.toUpperCase() || 'UNKNOWN'}
│
╰────────────────────────────╯`);
};

export default modeCommand;
