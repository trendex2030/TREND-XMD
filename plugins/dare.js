import config from '../config.cjs';

const relationshipDares = [
  "💌 Tell me one secret you've never told anyone.",
  "😘 Send a cute selfie with a kiss face.",
  "💍 Propose to me like it's real.",
  "🎵 Dedicate a romantic song to me now.",
  "💬 Type 'I love you' in 3 different styles.",
  "📱 Share the last photo in your gallery.",
  "🫂 Describe how you'd cuddle me in detail.",
  "🛏️ Describe your dream date night with me.",
  "👀 Send me an 'I miss you' voice note.",
  "🎭 Act like you're mad at me for 30 seconds.",
  "👄 Send a kiss emoji combo of your choice.",
  "❤️ Tell me what you like most about me.",
  "📝 Write a 3-line romantic poem about us.",
  "🥺 Say something sweet and emotional to make me blush.",
  "👫 Use an emoji to represent our relationship.",
  "⏰ Set my name as your status for 1 hour.",
  "📸 Recreate one of my selfies and send it.",
  "📞 Call me by a cute nickname right now.",
  "🌹 Send a virtual rose with a flirty message.",
  "🎲 Describe your wildest romantic fantasy with me."
];

const dareCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';
  if (cmd !== 'dare') return;

  const dare = relationshipDares[Math.floor(Math.random() * relationshipDares.length)];

  const formatted = `
╭─❥ 💖 *R E L A T I O N S H I P   D A R E* 💖
│ 
│ 💌 Dare:
│ ➥ ${dare}
│ 
╰─⏳ *Do it now or you're scared 😏*
`.trim();

  await sock.sendMessage(m.from, {
    text: formatted,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "💘 DareMeXmd",
        newsletterJid: "120363401765045963@newsletter",
      },
    },
  });
};

export default dareCommand;
