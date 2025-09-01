import config from '../config.cjs';

const JoinCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  let inviteText = text || m.quoted?.text;

  if (cmd === 'join') {
    const newsletter = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363401765045963@newsletter',
        newsletterName: 'TREND-X',
        serverMessageId: m.id
      }
    };

    if (!inviteText) {
      return m.reply(
        `🧷 *Join Command Help*\n\n` +
        `❗ *No link provided!*\n` +
        `📎 Please provide or reply to a *valid* WhatsApp group invite link.\n\n` +
        `💡 *Example:*\n\`\`\`${prefix}join https://chat.whatsapp.com/XXXXXXYYYYYZZZZZZ\`\`\``,
        newsletter
      );
    }

    const match = inviteText.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/);
    if (!match) {
      return m.reply(
        `❌ *Invalid link format!*\n🔗 Please make sure the link looks like:\n` +
        `\`\`\`https://chat.whatsapp.com/XXXXXXYYYYYZZZZZZ\`\`\``,
        newsletter
      );
    }

    const groupCode = match[1];

    try {
      await Matrix.groupAcceptInvite(groupCode);
      return m.reply(
        `✅ *Successfully joined the group!*\n\n` +
        `📍 *Invite Code:* \`${groupCode}\`\n` +
        `🔔 trend-x is now active in the group.`,
        newsletter
      );
    } catch (err) {
      return m.reply(
        `🚫 *Failed to join group!*\n\n` +
        `📄 *Error message:*\n\`\`\`${err.message || err}\`\`\`\n` +
        `📌 Ensure the link is valid and the group hasn't expired.`,
        newsletter
      );
    }
  }
};

export default JoinCommand;
