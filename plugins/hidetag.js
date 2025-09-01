import config from '../config.cjs';

const hidetag = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'hidetag' && cmd !== 'ht') return;
  if (!m.isGroup) return m.reply('❌ *This command is group only.*');

  const metadata = await gss.groupMetadata(m.from);
  const participants = metadata.participants.map(p => p.id);
  const quotedText = m.quoted?.text;

  const finalText = text || quotedText;

  if (!finalText) {
    return gss.sendMessage(m.from, {
      text: `┏━━〔 📢 *Usage* 〕━━┓
┃ 
┃  Please provide a message or reply 
┃  to a message to send hidden tags.
┃ 
┃  ✏ Example: *.hidetag Good morning*
┃ 
┗━━━━━━━━━━━━━━┛`,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363401765045963@newsletter",
          newsletterName: "TREND-X"
        }
      }
    });
  }

  await gss.sendMessage(m.from, {
    text: `╭──〔 🧨 *Broadcast* 〕───◉\n│\n│ ${finalText}\n│\n╰───────────────◉`,
    mentions: participants,
    contextInfo: {
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363401765045963@newsletter",
        newsletterName: "TREND-X"
      }
    }
  });
};

export default hidetag;
