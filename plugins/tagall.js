import config from '../config.cjs';

const tagAll = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX || '.';

    // Ranmase tèks ki antre a
    const body = m.body || m.message?.conversation || m.text || '';
    const isCmd = body.startsWith(prefix);
    const cmd = isCmd ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = isCmd ? body.slice(prefix.length + cmd.length).trim() : '';

    // Verifye si se "tagall"
    if (cmd !== 'tagall') return;

    if (!m.isGroup) return m.reply('*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*');

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants || [];

    // Verifye si bot la ak admin ki voye l se admin
    const bot = participants.find(p => p.id === botNumber);
    const sender = participants.find(p => p.id === m.sender);

    if (!bot?.admin) return m.reply('*📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND*');
    if (!sender?.admin) return m.reply('*📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND*');

    // Fè mesaj la
    let message = `乂 *Attention Everyone* 乂\n\n*Message:* ${text || 'no message'}\n\n`;
    for (let p of participants) {
      message += `❒ @${p.id.split('@')[0]}\n`;
    }

    await gss.sendMessage(
      m.from,
      { text: message, mentions: participants.map(a => a.id) },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error:', error);
    await m.reply('❌ An error occurred while processing the command.');
  }
};

export default tagAll;