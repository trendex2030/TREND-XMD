import fs from 'fs';
import config from '../config.cjs';

const addPremiumCmd = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'addprem') return;

  const allowedAdmins = ['254110081982']; // <-- your master admin list here
  const senderNumber = m.sender.replace(/\D/g, '');

  if (!allowedAdmins.includes(senderNumber)) {
    return sock.sendMessage(m.from, {
      text: `🚫 *ACCESS DENIED*\nOnly authorized devs can add premium users.`,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 777,
        isForwarded: true,
        externalAdReply: {
          title: 'Unauthorized Access',
          body: 'This attempt has been logged.',
          mediaUrl: 'https://github.com/trendex2030',
          sourceUrl: 'https://github.com/trendex2030',
          thumbnailUrl: 'https://telegra.ph/file/4d838ab7ffb49f30c8e18.jpg',
          mediaType: 1,
          showAdAttribution: true,
        }
      }
    }, { quoted: m });
  }

  if (!args || !args.match(/^\d+$/)) {
    return sock.sendMessage(m.from, {
      text: `❌ *Invalid format!*\n\n📌 Usage:\n.addpremium 254700000000`,
    }, { quoted: m });
  }

  const numberToAdd = args.trim();
  const filePath = './mydata/users/premium.json';

  try {
    let premiumUsers = [];
    if (fs.existsSync(filePath)) {
      premiumUsers = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    if (premiumUsers.includes(numberToAdd)) {
      return sock.sendMessage(m.from, {
        text: `✅ *@${numberToAdd}* is already a *Premium User*.`,
        mentions: [`${numberToAdd}@s.whatsapp.net`],
      }, { quoted: m });
    }

    premiumUsers.push(numberToAdd);
    fs.writeFileSync(filePath, JSON.stringify(premiumUsers, null, 2));

    await sock.sendMessage(m.from, {
      text: `╭───❖ *PREMIUM ACCESS* ❖───╮\n│ 👤 User: @${numberToAdd}\n│ 💠 Status: Added\n╰──────────────────────╯`,
      mentions: [`${numberToAdd}@s.whatsapp.net`],
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        externalAdReply: {
          title: 'TREND-X PREMIUM MODE',
          body: '🔰 Access granted successfully!',
          mediaUrl: 'https://github.com/PopkidXmd',
          sourceUrl: 'https://github.com/PopkidXmd',
          thumbnailUrl: 'https://telegra.ph/file/4d838ab7ffb49f30c8e18.jpg',
          mediaType: 1,
          showAdAttribution: true,
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("[❌ PREMIUM ERROR]:", err.message);
    return sock.sendMessage(m.from, {
      text: `❌ *Error updating premium list:*\n\`\`\`${err.message}\`\`\``,
    }, { quoted: m });
  }
};

export default addPremiumCmd;
