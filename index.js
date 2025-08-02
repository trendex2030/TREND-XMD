// TREND-XMD v1.0.0 - by Trendex
// Session: trend-xmd~MEGA
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const express = require('express')
const fs = require('fs')
const path = require('path')
const pino = require('pino')
const mega = require('megajs')
const figlet = require('figlet')
const chalk = require('chalk')

// ===== CONFIG =====
const SESSION_NAME = 'trend-xmd~session'
const SESSION_FOLDER = './auth_info'
const MEGA_EMAIL = process.env.MEGA_EMAIL || 'your-mega-email@example.com'
const MEGA_PASSWORD = process.env.MEGA_PASSWORD || 'your-mega-password'

// ===== HELPER: Download session from MEGA if missing =====
async function downloadSessionFromMega() {
  if (fs.existsSync(SESSION_FOLDER)) return

  console.log(chalk.yellow('⏬ Session not found locally. Fetching from MEGA...'))

  const storage = mega({ email: MEGA_EMAIL, password: MEGA_PASSWORD })
  await new Promise((resolve, reject) => storage.once('ready', resolve))
  const file = storage.files.find(f => f.name === `${SESSION_NAME}.zip`)
  if (!file) return console.log(chalk.red('❌ Session not found in MEGA. Starting fresh.'))

  file.download()
    .pipe(fs.createWriteStream(`${SESSION_NAME}.zip`))
    .on('finish', () => {
      // You can unzip here if zipped session used
      console.log(chalk.green('✅ Session downloaded from MEGA'))
    })
}

// ===== Express Web Server for Heroku/Render =====
const app = express()
const PORT = process.env.PORT || 3000
app.get('/', (_, res) => {
  res.send(`TREND-XMD is live ✅`)
})
app.listen(PORT, () => {
  console.log(chalk.cyanBright(`[🌐] Web server running on port ${PORT}`))
})

// ===== Connect to WhatsApp =====
async function startBot() {
  await downloadSessionFromMega()

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER)

  const socket = makeWASocket({
    version: await fetchLatestBaileysVersion(),
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true
  })

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut

      console.log(chalk.red('🛑 Connection closed. Reconnecting...'), shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log(chalk.green('✅ TREND-XMD connected successfully!'))
    }
  })

  socket.ev.on('creds.update', saveCreds)

  // ===== Message Listener =====
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const sender = msg.pushName || 'User'
    const type = Object.keys(msg.message)[0]
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim()

    const isCmd = text.startsWith('!')
    const cmd = isCmd ? text.split(' ')[0].slice(1).toLowerCase() : null

    if (!isCmd) return

    // ==== Basic Commands ====
    if (cmd === 'ping') {
      return socket.sendMessage(from, { text: '🏓 Pong!' })
    }

    if (cmd === 'owner') {
      return socket.sendMessage(from, { text: '👑 Bot creator: Trendex' })
    }

    if (cmd === 'menu') {
      return socket.sendMessage(from, {
        text: `💡 *TREND-XMD COMMANDS*\n\n!ping\n!owner\n!menu\n\n(more coming...)`
      })
    }
      // 🚫 Antilink Enforcement
const groupLinkPattern = /(https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)/i
const isGroupLink = groupLinkPattern.test(text)
const isBotAdmin = (await socket.groupMetadata(from)).participants
  .find(p => p.id === socket.user.id)?.admin === 'admin'

if (isGroup && antilinkDB[from] && isGroupLink && !isAdmin && isBotAdmin) {
  try {
    await socket.sendMessage(from, {
      text: `🚫 @${sender.split('@')[0]} posted a WhatsApp group link and was removed.`,
      mentions: [sender]
    })
    await socket.groupParticipantsUpdate(from, [sender], 'remove')
  } catch (err) {
    console.log('❌ Antilink remove failed:', err.message)
  }
}

    // More commands will be added here...
      // Simple chatbot toggle per user
const chatbotDB = {}

if (cmd === 'chatbot') {
  const arg = text.split(' ')[1]
  if (!arg) return socket.sendMessage(from, { text: 'Use: !chatbot on / off' })

  if (arg === 'on') {
    chatbotDB[from] = true
    return socket.sendMessage(from, { text: '🤖 Chatbot enabled for you!' })
  } else if (arg === 'off') {
    chatbotDB[from] = false
    return socket.sendMessage(from, { text: '❌ Chatbot disabled for you.' })
  } else {
    return socket.sendMessage(from, { text: 'Invalid option. Use: !chatbot on / off' })
  }
}

// Auto-reply if chatbot enabled
if (!isCmd && chatbotDB[from]) {
  return socket.sendMessage(from, {
    text: `🤖 I am chatbot TREND-XMD. You said: *${text}*`
  })
                  }
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { writeFileSync } = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const tmp = require('os').tmpdir()

if (cmd === 'sticker') {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quoted || !quoted.imageMessage) {
    return socket.sendMessage(from, { text: '🖼️ Reply to an image with !sticker' })
  }

  const stream = await downloadContentFromMessage(quoted.imageMessage, 'image')
  const buffer = []
  for await (const chunk of stream) buffer.push(chunk)

  const imgPath = path.join(tmp, `img_${Date.now()}.jpg`)
  const outPath = path.join(tmp, `sticker_${Date.now()}.webp`)
  writeFileSync(imgPath, Buffer.concat(buffer))

  // Convert using ffmpeg (make sure ffmpeg is installed)
  spawn('ffmpeg', ['-i', imgPath, '-vf', 'scale=512:512:force_original_aspect_ratio=decrease', outPath])
    .on('exit', () => {
      socket.sendMessage(from, {
        sticker: { url: outPath }
      }, { quoted: msg })
    })
          }
      if (cmd === 'ytmp3') {
  const url = text.split(' ')[1]
  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    return socket.sendMessage(from, { text: '📥 Use: !ytmp3 <youtube url>' })
  }

  const api = `https://api.vevioz.com/api/button/mp3/${url}`
  socket.sendMessage(from, { text: `🔎 Fetching audio for:\n${url}` })

  socket.sendMessage(from, {
    document: {
      url: `https://api.vevioz.com/download/mp3?url=${encodeURIComponent(url)}`
    },
    mimetype: 'audio/mpeg',
    fileName: 'yt-audio.mp3'
  })
      }
      if (cmd === 'tiktok') {
  const url = text.split(' ')[1]
  if (!url || !url.includes('tiktok.com')) {
    return socket.sendMessage(from, { text: '📥 Use: !tiktok <video url>' })
  }

  const api = `https://api.tiklydown.me/api/download?url=${url}`
  try {
    const { data } = await require('axios').get(api)
    if (!data.video.noWatermark) throw 'No video found'

    socket.sendMessage(from, {
      video: { url: data.video.noWatermark },
      caption: `🎥 TikTok Downloaded\nBy TREND-XMD`
    })
  } catch (err) {
    socket.sendMessage(from, { text: '❌ Failed to fetch TikTok video.' })
  }
      }
      if (cmd === 'joke') {
  const { data } = await require('axios').get('https://official-joke-api.appspot.com/jokes/random')
  socket.sendMessage(from, { text: `😂 ${data.setup}\n\n👉 ${data.punchline}` })
}

if (cmd === 'quote') {
  const { data } = await require('axios').get('https://api.quotable.io/random')
  socket.sendMessage(from, { text: `💬 "${data.content}"\n— ${data.author}` })
}

if (cmd === 'meme') {
  const { data } = await require('axios').get('https://meme-api.com/gimme')
  socket.sendMessage(from, { image: { url: data.url }, caption: `🤣 ${data.title}` })
}

if (cmd === 'fact') {
  const { data } = await require('axios').get('https://uselessfacts.jsph.pl/random.json?language=en')
  socket.sendMessage(from, { text: `🤓 Fact: ${data.text}` })
}
      // Auto block on call
socket.ev.on('call', async (callData) => {
  const caller = callData[0]?.from
  console.log('📞 Blocked call from:', caller)
  await socket.sendMessage(caller, { text: '🚫 Calls not allowed! You are being blocked.' })
  await socket.updateBlockStatus(caller, 'block')
})
      socket.ev.on('messages.delete', async ({ keys }) => {
  for (const key of keys) {
    if (!key.remoteJid || key.fromMe) continue

    const msg = await socket.loadMessage(key.remoteJid, key.id)
    if (!msg?.message) return

    const sender = key.participant || key.remoteJid
    const name = msg.pushName || sender.split('@')[0]

    let type = Object.keys(msg.message)[0]
    let content

    if (type === 'conversation') {
      content = msg.message.conversation
    } else if (type === 'extendedTextMessage') {
      content = msg.message.extendedTextMessage.text
    } else {
      content = `[${type} message deleted]`
    }

    socket.sendMessage(key.remoteJid, {
      text: `🗑️ *Anti-Delete*\n👤 ${name} deleted:\n\n${content}`
    })
  }
})
      // 🛡️ Anti-Delete Feature
socket.ev.on('messages.delete', async ({ keys }) => {
  for (const key of keys) {
    if (!key.remoteJid || key.fromMe) continue

    try {
      const msg = await socket.loadMessage(key.remoteJid, key.id)
      if (!msg?.message) return

      const sender = key.participant || key.remoteJid
      const name = msg.pushName || sender.split('@')[0]
      const type = Object.keys(msg.message)[0]
      let content

      if (type === 'conversation') {
        content = msg.message.conversation
      } else if (type === 'extendedTextMessage') {
        content = msg.message.extendedTextMessage.text
      } else {
        content = `[${type} message deleted]`
      }

      await socket.sendMessage(key.remoteJid, {
        text: `🗑️ *Anti-Delete*\n👤 ${name} deleted:\n\n${content}`
      })
    } catch (err) {
      console.log('❌ Anti-Delete error:', err.message)
    }
  }
})
      // 👋 Welcome & Bye Messages
socket.ev.on('group-participants.update', async (event) => {
  const { id, participants, action } = event
  for (const user of participants) {
    try {
      const pp = await socket.profilePictureUrl(user, 'image')
        .catch(() => 'https://i.ibb.co/S32HNjD/no-profile.jpg')
      const name = (await socket.onWhatsApp(user))[0]?.notify || user.split('@')[0]

      if (action === 'add') {
        await socket.sendMessage(id, {
          image: { url: pp },
          caption: `👋 *Welcome @${user.split('@')[0]}!*\n\nGlad to have you in *${id.split('@')[0]}* 😊`,
          mentions: [user]
        })
      }

      if (action === 'remove') {
        await socket.sendMessage(id, {
          image: { url: pp },
          caption: `👋 *Goodbye @${user.split('@')[0]}.*\n\nHope to see you again someday! 👋`,
          mentions: [user]
        })
      }

    } catch (e) {
      console.log('❌ Welcome/Bye error:', e.message)
    }
  }
})
      // 👁️ Anti View Once
if (msg.message?.viewOnceMessageV2) {
  const vmsg = msg.message.viewOnceMessageV2.message
  const type = Object.keys(vmsg)[0]

  try {
    const mediaMessage = vmsg[type]
    const stream = await downloadContentFromMessage(mediaMessage, type.includes('image') ? 'image' : 'video')
    const buffer = []
    for await (const chunk of stream) buffer.push(chunk)

    const mediaBuffer = Buffer.concat(buffer)
    const caption = `👁️ Anti-ViewOnce from @${msg.key.participant?.split('@')[0] || msg.key.remoteJid.split('@')[0]}`

    await socket.sendMessage(from, {
      [type]: mediaBuffer,
      caption,
      mentions: [msg.key.participant || msg.key.remoteJid]
    }, { quoted: msg })
  } catch (err) {
    console.log('❌ Anti-ViewOnce error:', err.message)
  }
          }
      // 🔗 Antilink Toggle Command
const antilinkDB = antilinkDB || {}

if (cmd === 'antilink') {
  const arg = text.split(' ')[1]
  if (!isGroup) return socket.sendMessage(from, { text: '❌ This command is for groups only.' })
  if (!isAdmin) return socket.sendMessage(from, { text: '⚠️ Only group admins can toggle antilink.' })

  if (!arg || !['on', 'off'].includes(arg)) {
    return socket.sendMessage(from, { text: 'Use: !antilink on / off' })
  }

  antilinkDB[from] = arg === 'on'
  socket.sendMessage(from, {
    text: `🔗 Antilink has been turned *${arg.toUpperCase()}* for this group.`
  })
      if (cmd === 'menu') {
  const menuText = `
┏━━━〔 *🤖 TREND-XMD MENU* 〕━━━┓

*🧩 MAIN COMMANDS*
➤ !menu
➤ !ping
➤ !chatbot on/off
➤ !status

*🎭 FUN MENU*
➤ !joke
➤ !quote
➤ !meme
➤ !fact

*🎬 MEDIA TOOLS*
➤ !sticker (reply to image)
➤ !toimg (sticker to image)

*📥 DOWNLOADERS*
➤ !ytmp3 <link>
➤ !tiktok <link>

*🛡️ GROUP PROTECTION*
➤ !antilink on/off
➤ !antidelete on/off
➤ !antiviewonce

*👮 ADMIN TOOLS*
➤ !kick @user
➤ !promote @user
➤ !demote @user
➤ !welcome on/off (optional)

*👑 OWNER COMMANDS*
➤ !bc <text>
➤ !eval <code>
➤ !shutdown

📌 *Bot Name:* TREND-XMD
🧠 *Creator:* @trendex
  `.trim()

  socket.sendMessage(from, {
    text: menuText,
    mentions: [msg.key.participant || sender]
  }, { quoted: msg })
      }
