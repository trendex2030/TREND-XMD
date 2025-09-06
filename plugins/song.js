// plugins/play.js
import yts from "yt-search";
import fetch from "node-fetch";

export default {
    name: "play",
    alias: ["song"],
    description: "Search and download audio from YouTube",
    async execute(conn, m, args) {
        const text = args.join(" ");
        const prefix = global.prefix || ".";
        const command = m.command || "play";

        if (!text) return conn.sendMessage(m.chat, { text: `Example: ${prefix}${command} love you everyday by Bebe Cool` }, { quoted: m });

        try {
            // Search YouTube
            const search = await yts(text);
            if (!search.videos.length) return conn.sendMessage(m.chat, { text: "No results found for your query." }, { quoted: m });

            const video = search.videos[0];
            const metadata = {
                title: video.title,
                channel: video.author.name,
                duration: video.timestamp,
                views: video.views.toLocaleString(),
                thumbnail: video.thumbnail,
                url: video.url,
            };

            // Send video metadata with thumbnail
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: metadata.thumbnail },
                    caption: `
🎵 *Title*: ${metadata.title}
👤 *Channel*: ${metadata.channel}
⏱️ *Duration*: ${metadata.duration}
👀 *Views*: ${metadata.views}
                    `.trim(),
                },
                { quoted: m }
            );

            // Fetch audio URL from API
            const apiUrl = `https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(metadata.url)}`;
            const response = await fetch(apiUrl, { timeout: 10000 });
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const data = await response.json();
            if (!data.status || !data.result.downloadUrl) throw new Error("Failed to fetch audio download URL");

            // Send audio
            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: data.result.downloadUrl },
                    mimetype: "audio/mpeg",
                    fileName: `${metadata.title}.mp3`,
                    ptt: command === "song",
                    contextInfo: {
                        externalAdReply: {
                            title: metadata.title,
                            body: `${metadata.channel} • ${metadata.duration}`,
                            mediaType: 2,
                            thumbnailUrl: metadata.thumbnail,
                            renderLargerThumbnail: true,
                            sourceUrl: metadata.url,
                            showAdAttribution: true,
                        },
                    },
                },
                { quoted: m }
            );

        } catch (error) {
            console.error(`Error in ${command} command:`, error);
            await conn.sendMessage(
                m.chat,
                { text: `⚠️ Error: ${error.message || "Unable to fetch audio. Try again later."}` },
                { quoted: m }
            );
        }
    },
};
