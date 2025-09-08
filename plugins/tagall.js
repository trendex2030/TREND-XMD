import config from '../config.cjs';

export default async function tagall(m, sock) {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== 'tagall') return;

    // Only allow in groups
    if (!m.key.remoteJid.endsWith('@g.us')) {
        return sock.sendMessage(m.key.remoteJid, {
            text: '*This command only works in groups.*'
        });
    }

    const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
    const participants = groupMetadata.participants;

    // Get optional message after command
    const text = m.body.slice(prefix.length + cmd.length).trim() || 'Everyone here!';

    const mentions = participants.map(p => p.id);

    let messageText = `*📢 TAGALL by @${m.key.participant?.split('@')[0]}*\n\n${text}\n\n`;
    messageText += participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

    await sock.sendMessage(m.key.remoteJid, {
        text: messageText,
        mentions
    });
}
