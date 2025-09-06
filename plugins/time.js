// plugins/time.js
import moment from 'moment-timezone';
import SunCalc from 'suncalc';
import { getBuffer } from '../lib/Serializer.js'; // adjust if your helper path is different

export default {
    name: 'time', // command name
    description: 'Get current time info with timezone and sunrise/sunset',
    async execute(conn, m, args) {
        try {
            const timezone = global.timezones || "Africa/Kampala"; // default timezone
            const now = moment().tz(timezone);

            // Sunrise/Sunset calculation using SunCalc
            function getSunriseSunset(date) {
                const lat = 0.3136;  // Kampala coordinates
                const lng = 32.5811;
                const times = SunCalc.getTimes(date.toDate(), lat, lng);
                const sunrise = moment(times.sunrise).tz(timezone).format('h:mm A');
                const sunset = moment(times.sunset).tz(timezone).format('h:mm A');
                return `☀️ ${sunrise} - 🌙 ${sunset}`;
            }

            const timeInfo = `
⏰ *Current Time Information* ⏰

🌍 *Timezone:* ${timezone} (${now.format('z')})
📅 *Date:* ${now.format('dddd, MMMM Do YYYY')}
🕒 *Time:* ${now.format('h:mm:ss A')}
📆 *Week Number:* ${now.format('WW')}
⏳ *Day of Year:* ${now.format('DDD')}
🌞 *Sunrise/Sunset:* ${getSunriseSunset(now)}
`;

            // Send the formatted message
            await conn.sendMessage(
                m.chat,
                { 
                    text: timeInfo.trim(),
                    contextInfo: {
                        externalAdReply: {
                            title: `${global.botname} Time Service`,
                            body: `Powered by Moment.js & SunCalc`,
                            thumbnail: await getBuffer('https://i.imgur.com/JiW7R2Y.png'),
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Error in time command:', error);
            await conn.sendMessage(m.chat, { text: '⚠️ An error occurred while fetching time information. Please try again later.' }, { quoted: m });
        }
    }
};
