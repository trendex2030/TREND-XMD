import config from '../config.cjs';

const tagAll = async (m, gss) => {
  try {
    const prefix = config.PREFIX || '.';

    // Get text from the message
    const body = m.body || m.message?.conversation || m.text || '';
    const isCmd = body.startsWith(prefix);
    const cmd = isCmd ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = isCmd ? body.slice(prefix.length + cmd.length).trim() : '';

    if (cmd !== 'tagall') return;

    // Ensure it's a group
    if (!m.isGroup) {
      return gss.sendMessage(m.chat, { text: '❌ This command only works in groups.' }, { quoted: m });
    }

    // Get group metadata
    const groupMetadata = await gss.groupMetadata(m.chat);
    const participants = groupMetadata.participants || [];

    const sender = m.sender || '';
    let messageText = `*TAGGED BY:* @${sender.split("@")[0]}\n\n*MESSAGE:* ${text || "No message"}\n\n`;

    for (let mem of participants) {
      messageText += `@${mem.id.split("@")[0]}\n`;
    }

    await gss.sendMessage(
      m.chat,
      {
        text: messageText,
        mentions: participants.map((p) => p.id),
      },
      { quoted: m }
    );

  } catch (err) {
    console.error('❌ Error in tagAll:', err);
  }
};

export default tagAll;
