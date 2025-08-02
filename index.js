const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage, jidNormalizedUser } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execSync } = require('child_process')
const Mega = require('megajs')
const express = require('express')
const app = express()

// Config
const BOT_NAME = 'TREND-XMD'
const CREATOR = 'trendex'
const SESSION_ID = `trend-x~${Date.now().toString(36)}`
const SESSION_FOLDER = './auth_info_baileys'

// Ensure session dir exists
if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER)

// Start Express server (Heroku compatibility)
app.get('/', (_, res) => res.send(`${BOT_NAME} is alive.`))
app.listen(process.env.PORT || 3000)

// MEGA Upload (optional)
async function backupSessionToMega() {
  const email = process.env.MEGA_EMAIL
  const password = process.env.MEGA_PASSWORD
  if (!email || !password) return console.log('🔒 MEGA credentials not set. Skipping backup.')

  const storage = await Mega.login({ email, password }).catch(() => null)
  if (!storage) return console.log('❌ MEGA login failed.')

  const sessionZip = `${SESSION_ID}.zip`
  execSync(`zip -r ${sessionZip} ${SESSION_FOLDER}`)

  const up = storage.upload(sessionZip)
  fs.createReadStream(sessionZip).pipe(up)
  up.on('complete', () => {
    fs.unlinkSync(sessionZip)
    console.log(`✅ Session uploaded to MEGA as ${sessionZip}`)
  })
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER)
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log('🛑 Logged out. Restarting...')
        process.exit()
      } else startBot()
    } else if (connection === 'open') {
      console.log(`✅ ${BOT_NAME} connected as ${sock.user.id}`)
      await backupSessionToMega()
    }
  })

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    const isCmd = text.startsWith('!')
    const cmd = isCmd ? text.slice(1).split(' ')[0].toLowerCase() : ''
    const args = text.trim().split(/ +/).slice(1)

    const reply = (txt) => sock.sendMessage(from, { text: txt }, { quoted: msg })

    // Command: !menu
    if (cmd === 'menu') {
      return reply(`
╭───⭓ *${BOT_NAME} MENU*
│
│ 💬 !menu
│ 🤖 !chatbot on/off
│ 🔗 !antilink on/off
│ 👋 !welcome on/off
│ 🛡️ !antidelete on/off
│ 🔥 !ping
│ 📥 !ytmp3 <url>
│ 📥 !tiktok <url>
│ 😂 !joke | !quote | !meme
│ 🎨 !sticker (reply img)
│ 🧠 Creator: ${CREATOR}
╰────────────⭓`)
    }

    // Command: !ping
    if (cmd === 'ping') return reply('🏓 Pong! Bot is alive.')

    // Command: !chatbot
    global.chatbotDB = global.chatbotDB || {}
    if (cmd === 'chatbot') {
      if (!args[0]) return reply('Usage: !chatbot on / off')
      global.chatbotDB[from] = args[0] === 'on'
      return reply(`Chatbot ${args[0] === 'on' ? 'enabled' : 'disabled'} for this chat.`)
    }

    // Chatbot auto-reply
    if (!isCmd && global.chatbotDB[from]) {
      return reply(`🤖 ${BOT_NAME} here! You said: *${text}*`)
    }

    // Command: !antilink
    global.antilinkDB = global.antilinkDB || {}
    if (cmd === 'antilink') {
      if (!args[0]) return reply('Usage: !antilink on / off')
      global.antilinkDB[from] = args[0] === 'on'
      return reply(`Antilink ${args[0] === 'on' ? 'enabled' : 'disabled'} in this group.`)
    }

    // Auto remove links
    if (!msg.key.fromMe && global.antilinkDB[from] && /(https?:\/\/[^\s]+)/.test(text)) {
      const isAdmin = msg.key.participant?.includes(sock.user.id)
      if (!isAdmin) return
      await sock.groupParticipantsUpdate(from, [msg.key.participant], 'remove')
    }

    // Command: !ytmp3
    if (cmd === 'ytmp3') {
      if (!args[0]) return reply('📥 Usage: !ytmp3 <YouTube URL>')
      return sock.sendMessage(from, {
        document: { url: `https://api.vevioz.com/download/mp3?url=${args[0]}` },
        mimetype: 'audio/mpeg',
        fileName: 'yt-audio.mp3'
      }, { quoted: msg })
    }

    // Command: !tiktok
    if (cmd === 'tiktok') {
      if (!args[0]) return reply('📥 Usage: !tiktok <TikTok URL>')
      const { data } = await require('axios').get(`https://api.tiklydown.me/api/download?url=${args[0]}`)
      return sock.sendMessage(from, {
        video: { url: data.video.noWatermark },
        caption: `🎥 Downloaded via ${BOT_NAME}`
      }, { quoted: msg })
    }

    // Fun commands
    if (cmd === 'joke') {
      const { data } = await require('axios').get('https://official-joke-api.appspot.com/jokes/random')
      return reply(`😂 ${data.setup}\n👉 ${data.punchline}`)
    }

    if (cmd === 'quote') {
      const { data } = await require('axios').get('https://api.quotable.io/random')
      return reply(`💬 "${data.content}"\n— ${data.author}`)
    }

    if (cmd === 'meme') {
      const { data } = await require('axios').get('https://meme-api.com/gimme')
      return sock.sendMessage(from, {
        image: { url: data.url },
        caption: `🤣 ${data.title}`
      }, { quoted: msg })
    }

    // Sticker maker
    if (cmd === 'sticker') {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted?.imageMessage) return reply('🖼️ Reply to an image with !sticker')

      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image')
      const buffer = []
      for await (const chunk of stream) buffer.push(chunk)

      const imgPath = path.join(os.tmpdir(), `${Date.now()}.jpg`)
      const webpPath = path.join(os.tmpdir(), `${Date.now()}.webp`)
      fs.writeFileSync(imgPath, Buffer.concat(buffer))

      execSync(`ffmpeg -i ${imgPath} -vf "scale=512:512:force_original_aspect_ratio=decrease" -vcodec libwebp -lossless 1 -compression_level 6 -q:v 80 -preset default -loop 0 -an -vsync 0 ${webpPath}`)

      await sock.sendMessage(from, { sticker: fs.readFileSync(webpPath) }, { quoted: msg })

      fs.unlinkSync(imgPath)
      fs.unlinkSync(webpPath)
    }
  })
}

startBot()
