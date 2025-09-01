import axios from 'axios';
import config from '../config.cjs';
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

// Groq API configuration
const GROQ_API_KEY = 'gifted'; // Replace with your actual API key if different
const GROQ_API_URL = 'https://api.giftedtech.co.ke/api/ai/deepseek-v3';

// Response cache to avoid duplicate processing
const messageCache = new Set();

async function getGroqResponse(prompt) {
  try {
    const response = await axios.get(`${GROQ_API_URL}?apikey=${GROQ_API_KEY}&q=${encodeURIComponent(prompt)}`);
    return response.data?.result || "I couldn't process that request. Please try again.";
  } catch (error) {
    console.error('Groq API Error:', error);
    return "Sorry, I'm having trouble connecting to the AI service.";
  }
}

const chatbotHandler = async (m, Matrix) => {
  // Ignore messages from status broadcasts, groups (if desired), or cached messages
  if (m.key.remoteJid.endsWith('@broadcast') || 
      m.key.remoteJid.includes('@g.us') || 
      messageCache.has(m.key.id)) {
    return;
  }

  // Add message to cache to prevent duplicate processing
  messageCache.add(m.key.id);
  
  // Clean the cache periodically
  if (messageCache.size > 100) {
    messageCache.clear();
  }

  try {
    const messageText = m.message?.conversation || 
                       m.message?.extendedTextMessage?.text || 
                       '';

    // Ignore empty messages or commands with prefix
    if (!messageText || messageText.startsWith(config.PREFIX)) {
      return;
    }

    // Show typing indicator
    await Matrix.sendPresenceUpdate('composing', m.key.remoteJid);

    // Get response from Groq API
    const aiResponse = await getGroqResponse(messageText);

    
    // Send the response
    await Matrix.sendMessage(m.key.remoteJid, { 
      text: aiResponse,
      contextInfo: {
       mentionedJid: [m.participant || m.key.participant],
       forwardingScore: 999,
       isForwarded: true,
       forwardedNewsletterMessageInfo: {
        newsletterJid: '120363401765045963@newsletter',
       newsletterName: "╭••➤TREND-X❦",
       serverMessageId: 143
       }
      }
    }, { quoted: {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "TREND-X",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:TREND-X;BOT;;;\nFN:TREND-X\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD`
                }
            }
        } });

  } catch (error) {
    console.error('Chatbot Error:', error);
    // Optionally send an error message
    // await Matrix.sendMessage(m.key.remoteJid, { text: "Sorry, I encountered an error processing your message." });
  }
};

export default chatbotHandler;
