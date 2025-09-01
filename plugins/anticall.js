import config from '../config.cjs';

const anticallcommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'anticall') {
    if (!isCreator)
      return m.reply(`*⛔ ACCESS DENIED!*\n\nOnly the *bot owner* can use this command.`);

    let responseMessage = '';
    let footer = `💡 Use ${prefix}anticall on/off to toggle`;

    if (text === 'on') {
      config.REJECT_CALL = true;
      responseMessage = `
╭─❍「 🚫 ANTI-CALL ENABLED 」❍
│ ✅ All incoming calls will now be *auto-rejected*
│ 🔒 This helps keep the bot stable and safe!
│
│  🚀 Powered by *TREND-X*
╰─────────────────────⧘
      `.trim();
    } else if (text === 'off') {
      config.REJECT_CALL = false;
      responseMessage = `
╭─❍「 ✅ ANTI-CALL DISABLED 」❍
│ ❌ Incoming calls will *no longer* be auto-rejected.
│ 📞 Use responsibly to avoid blocks.
│
│  🚀 Powered by *TREND-X*
╰─────────────────────⧘
      `.trim();
    } else {
      responseMessage = `
╭─❍「 📛 INVALID USAGE 」❍
│ Please use:
│ ➤ ${prefix}anticall on
│ ➤ ${prefix}anticall off
│
│  🚀 Powered by *TREND-X*
╰─────────────────────⧘
      `.trim();
    }

    try {
      await Matrix.sendMessage(
        m.from,
        {
          text: responseMessage,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: "TREND-X",
              newsletterJid: "120363401765045963@newsletter"
            }
          }
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('❗ Error in anticall command:', error);
      await Matrix.sendMessage(
        m.from,
        {
          text: `⚠️ *An unexpected error occurred while processing the command!*`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: "TREND-X ⚠️",
              newsletterJid: "120363401765045963@newsletter"
            }
          }
        },
        { quoted: m }
      );
    }
  }
};

export default anticallcommand;
