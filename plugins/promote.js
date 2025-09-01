import config from '../config.cjs';

const promote = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['promote', 'adminup', 'makeadmin'];
    if (!validCommands.includes(cmd)) return;

    if (!m.isGroup) {
      return gss.sendMessage(m.from, {
        text: `┏━━━〔 🚫 *Group Only* 〕━━━┓\n┃\n┃  This command only works in group chats.\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛`,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401765045963@newsletter',
            newsletterName: 'TREND-X'
          }
        }
      });
    }

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;

    const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;
    if (!isBotAdmin) {
      return gss.sendMessage(m.from, {
        text: `┏━━━〔 ❌ *Permission Error* 〕━━━┓\n┃\n┃  I need to be an *admin* to promote users!\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛`,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401765045963@newsletter',
            newsletterName: 'TREND-X'
          }
        }
      });
    }

    const sender = m.sender;
    const isOwner = sender === config.OWNER_NUMBER + '@s.whatsapp.net';
    const isSudo = config.SUDO?.includes(sender);
    const isGroupAdmin = participants.find(p => p.id === sender)?.admin;

    if (!isOwner && !isSudo && !isGroupAdmin) {
      return gss.sendMessage(m.from, {
        text: `┏━━━〔 🔐 *Access Denied* 〕━━━┓\n┃\n┃  Only *admins* or *bot owners* can\n┃  promote others in this group.\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛`,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401765045963@newsletter',
            newsletterName: 'TREND-X'
          }
        }
      });
    }

    if (!m.mentionedJid) m.mentionedJid = [];
    if (m.quoted?.participant) m.mentionedJid.push(m.quoted.participant);

    const users = m.mentionedJid.length > 0
      ? m.mentionedJid
      : text.replace(/[^0-9]/g, '').length > 0
        ? [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        : [];

    if (users.length === 0) {
      return gss.sendMessage(m.from, {
        text: `┏━━━〔 🧍 *Mention Required* 〕━━━┓\n┃\n┃  Please *mention*, *reply*, or *enter number*\n┃  of the user you want to promote.\n┃\n┃  ✅ Example: *.promote @user*\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛`,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401765045963@newsletter',
            newsletterName: 'TREND-X'
          }
        }
      });
    }

    const validUsers = users.filter(Boolean);

    const usernames = await Promise.all(
      validUsers.map(async (user) => {
        try {
          const contact = await gss.getContact(user);
          return contact.notify || contact.pushname || user.split('@')[0];
        } catch {
          return user.split('@')[0];
        }
      })
    );

    await gss.groupParticipantsUpdate(m.from, validUsers, 'promote')
      .then(() => {
        const promotedTags = validUsers.map(u => `@${u.split('@')[0]}`).join(', ');
        gss.sendMessage(m.from, {
          text:
`┏━━━〔 ✅ *Promotion Complete* 〕━━━┓
┃
┃  🎉 Promoted: ${promotedTags}
┃  📛 Group: *${groupMetadata.subject}*
┃
┗━━━━━━━━━━━━━━━━━━━━┛`,
          mentions: validUsers,
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363401765045963@newsletter',
              newsletterName: 'TREND-X'
            }
          }
        });
      })
      .catch(() => gss.sendMessage(m.from, {
        text: `❌ *Promotion failed.* Make sure the user is in group and not already an admin.`,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401765045963@newsletter',
            newsletterName: 'TREND-X'
          }
        }
      }));

  } catch (error) {
    console.error('Promote Error:', error);
    gss.sendMessage(m.from, {
      text: `🚨 *An unexpected error occurred while promoting.*`,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363401765045963@newsletter',
          newsletterName: 'TREND-X'
        }
      }
    });
  }
};

export default promote;
