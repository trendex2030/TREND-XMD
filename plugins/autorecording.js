import config from '../config.cjs';

const autorecordingCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isOwner = [botNumber, `${config.OWNER_NUMBER}@s.whatsapp.net`].includes(m.sender);
  const prefix = config.PREFIX;

  const command = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  const args = m.body.slice(prefix.length + command.length).trim();

  if (command !== 'autorecording') return;

  if (!isOwner) {
    return m.reply('📛 *THIS IS AN OWNER-ONLY COMMAND*');
  }

  let message;

  switch (args) {
    case 'on':
      config.AUTO_RECORDING = true;
      message = '🎙️ *Auto-Recording has been enabled.*';
      break;

    case 'off':
      config.AUTO_RECORDING = false;
      message = '🔇 *Auto-Recording has been disabled.*';
      break;

    default:
      const status = config.AUTO_RECORDING ? '🟢 ON' : '🔴 OFF';
      message = `
╭─⧉  *Auto-Recording Settings*
│
│ 🎚️ *Status:* ${status}
│
│ 🔧 *Usage:*
│ • \`autorecording on\` — Enable recording mode
│ • \`autorecording off\` — Disable recording mode
│
╰────⟡ *TREND-X Control Panel*
`.trim();
      break;
  }

  try {
    await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
  } catch (err) {
    console.error('[AutoRecording Error]', err.message);
    await Matrix.sendMessage(m.from, {
      text: '❌ *An error occurred while processing your request.*'
    }, { quoted: m });
  }
};

export default autorecordingCommand;
