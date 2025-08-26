import moment from "moment-timezone";
import fs from "fs";
import os from "os";
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;
import config from "../config.cjs";
import axios from "axios";

// System stats
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();
const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) return (bytes * byteToGB).toFixed(2) + " GB";
  if (bytes >= Math.pow(1024, 2)) return (bytes * byteToMB).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes * byteToKB).toFixed(2) + " KB";
  return bytes.toFixed(2) + " bytes";
}

const uptime = process.uptime();
const day = Math.floor(uptime / (24 * 3600));
const hours = Math.floor((uptime % (24 * 3600)) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const seconds = Math.floor(uptime % 60);
const uptimeMessage = `*I’ve been grindin’ for ${day}d ${hours}h ${minutes}m ${seconds}s* 🕒`;
const runMessage = `*☀️ ${day} Day*\n*🕐 ${hours} Hour*\n*⏰ ${minutes} Min*\n*⏱️ ${seconds} Sec*`;

const xtime = moment.tz("Africa/Nairobi").format("HH:mm:ss");
const xdate = moment.tz("Africa/Nairobi").format("DD/MM/YYYY");
const time2 = moment().tz("Africa/Nairobi").format("HH:mm:ss");
let pushwish = "";
if (time2 < "05:00:00") pushwish = `Good Morning 🌄`;
else if (time2 < "11:00:00") pushwish = `Good Morning 🌄`;
else if (time2 < "15:00:00") pushwish = `Good Afternoon 🌅`;
else if (time2 < "18:00:00") pushwish = `Good Evening 🌃`;
else pushwish = `Good Night 🌌`;

const menu = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const validCommands = ["fullenu", "mnu2", "liscmd"];

    if (!validCommands.includes(cmd)) return;

    const mode = config.MODE === "public" ? "public" : "private";
  
     const imageUrl = "https://files.catbox.moe/adymbp.jpg";
    const text = `
 ◈━━━━━━━━━━━━━━━━◈
│❒ *TREND-X* Menu 🔥
│❒ 👑 *Owner*: ${config.OWNER_NAME}
│❒ 🤖 *Bot*: ${config.BOT_NAME}
│❒ ⚙️ *Mode*: ${mode}
│❒ 📍 *Prefix*: [${prefix}]
│❒ 🖥️ *Platform*: ${os.platform()}
│❒ 💾 *Memory*: ${formatBytes(freeMemoryBytes)} / ${formatBytes(totalMemoryBytes)}
│❒ ⏰ *Uptime*: ${runMessage}
│❒ 📅 *Date*: ${xdate}
│❒ 🕒 *Time*: ${xtime} (EAT)
│❒ 🌟 ${pushwish}, fam!
◈━━━━━━━━━━━━━━━━◈`;
   const buttons = [
      {
        buttonId: "action",
        buttonText: { displayText: "📂 ᴍᴇɴᴜ ᴏᴘᴛɪᴏɴꜱ" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({
            title: "📂 𝗧𝗮𝗽 𝗛𝗲𝗿𝗲 𝗙𝗿𝗶𝗲𝗻𝗱",
            sections: [
              {
                title: "📁 𝙏𝙍𝙀𝙉𝘿 𝙓 𝗯𝘂𝘁𝘁𝗼𝗻 𝗢𝗻𝗹𝗶𝗻𝗲",
                highlight_label: "",
                rows: [
                  {
                    title: "📂 ᴍᴇɴᴜ",
                    description: "ᴏᴘᴇɴ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ",
                    id: `.menu`,
                  },
                  {
                    title: "👑 ᴏᴡɴᴇʀ",
                    description: "ᴄᴏɴᴛᴀᴄᴛ ʙᴏᴛ ᴏᴡɴᴇʀ",
                    id: `${prefix}owner`,
                  },
                  {
                    title: "📶 ᴘɪɴɢ",
                    description: "ᴛᴇꜱᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ",
                    id: `.ping`,
                  },
                  {
                    title: "🖥️ ꜱʏꜱᴛᴇᴍ",
                    description: "ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ",
                    id: `${prefix}system`,
                  },
                  {
                    title: "🛠️ ʀᴇᴘᴏ",
                    description: "ɢɪᴛʜᴜʙ ʀᴇᴘᴏꜱɪᴛᴏʀʏ",
                    id: `${prefix}repo`,
                  },
                ],
              },
            ],
          }),
        },
      },
    ];
    const messageOptions = {
      viewOnce: true,
      buttons,
      contextInfo: {
        mentionedJid: [m.sender],
      },
    };
    await Matrix.sendMessage(m.from,{ 
      image: { url: imageUrl },
      caption:text, 
      ...messageOptions 
   }, { quoted: m });
  }
  };
                             
export default ping;
    
