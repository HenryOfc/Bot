import yts from 'yt-search';
import fetch from 'node-fetch';

let limit = 320;
let confirmation = {};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
    try {
        if (command === 'play' || command === 'playvid') {
            if (!text) throw `✳️ Ejemplo *${usedPrefix + command}* Lil Peep hate my life`;

            let res = await yts(text);
            let vid = res.videos[0];
            if (!vid) throw `✳️ Vídeo/Audio no encontrado`;

            let { title, description, thumbnail, videoId, timestamp, views, ago, url } = vid;

            let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
            let chat = global.db.data.chats[m.chat];

            m.react('🎧');

            let playMessage = `
≡ *HJ MUSIC*
┌──────────────
☆ 📌 *Título:* ${vid.title}
☆ 📆 *Fecha:* ${vid.ago}
☆ ⌚ *Duración:* ${vid.timestamp}
☆ 👀 *Vistas:* ${vid.views.toLocaleString()}
└──────────────`;

            if (business) {
                conn.sendFile(m.chat, thumbnail, "error.jpg", `${playMessage}\n\nEscribe:\n1️⃣ para recibir el archivo como MP3.\n2️⃣ para recibir el archivo como MP4.`, m);

                confirmation[m.sender] = {
                    sender: m.sender,
                    to: who,
                    url: url,
                    chat: chat,
                    timeout: setTimeout(() => {
                        delete confirmation[m.sender];
                    }, 60000), // 1 minuto de espera
                };
            } else {
                conn.sendButton(m.chat, playMessage, thumbnail, [
                    ['🎶 MP3', `${usedPrefix}hjmp3 ${url}`],
                    ['🎥 MP4', `${usedPrefix}hjmp4 ${url}`]
                ], m);
            }
        } else if (command === "hjmp3") {
            // Comando para descargar MP3
            if (!text) throw `✳️ Ejemplo: *${usedPrefix}hjmp3 https://youtu.be/xxxxx*`;

            const api = await (await fetch(`https://ytdl.sylphy.xyz/dl/mp3?url=${text}&quality=128`)).json();
            if (api.data.dl_url) {
                await conn.sendFile(m.chat, api.data.dl_url, api.data.title, "", m);
                await m.react("✔️");
            } else {
                throw `✳️ No se pudo descargar el MP3, intenta nuevamente.`;
            }
        } else if (command === "hjmp4" || command === "playvid") {
            // Comando para descargar MP4
            if (!text) throw `✳️ Ejemplo: *${usedPrefix}hjmp4 https://youtu.be/xxxxx*`;

            const api = await (await fetch(`https://ytdl.sylphy.xyz/dl/mp4?url=${text}&quality=480`)).json();
            if (api.data.dl_url) {
                const doc = api.data.size_mb >= limit;
                await conn.sendFile(m.chat, api.data.dl_url, api.data.title, "", m, null, { asDocument: doc });
                await m.react("✔️");
            } else {
                throw `✳️ No se pudo descargar el MP4, intenta nuevamente.`;
            }
        }
    } catch (e) {
        console.error(e);
        throw `✳️ Ocurrió un error: ${e.message || e}`;
    }
}

// Asegurarse de que los comandos sean reconocidos
handler.help = ['play', 'hjmp3', 'hjmp4'];
handler.tags = ['dl'];
handler.command = ['play', 'playvid', 'hjmp3', 'hjmp4'];  // Aquí definimos todos los comandos que serán utilizados

handler.disabled = false;

export default handler;

handler.before = async m => {
    if (m.isBaileys) return; // Ignorar mensajes del bot
    if (!(m.sender in confirmation)) return; // Solo continuar si hay confirmación pendiente

    let { sender, timeout, url, chat } = confirmation[m.sender]; // Desestructuración que incluye la url y chat
    if (m.text.trim() === '1') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        // Se comenta porque no es necesario usar global.API en esta implementación
        // let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: url }, 'apikey'));
        // let data = await res.json();
        const api = await (await fetch(`https://ytdl.sylphy.xyz/dl/mp3?url=${url}&quality=128`)).json();
        if (api.data.dl_url) {
            conn.sendFile(m.chat, api.data.dl_url, api.data.title + '.mp3', `≡  *HJ YTDL*\n\n▢ *📌 Título* : ${api.data.title}`, m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
            m.react('✅');
        } else {
            throw `✳️ No se pudo descargar el MP3, intenta nuevamente.`;
        }
    } else if (m.text.trim() === '2') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        // Se comenta porque no es necesario usar global.API en esta implementación
        // let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: url }, 'apikey'));
        // let data = await res.json();
        const api = await (await fetch(`https://ytdl.sylphy.xyz/dl/mp4?url=${url}&quality=480`)).json();
        if (api.data.dl_url) {
            const isLimit = limit * 1024 < api.data.size_b;
            await conn.loadingMsg(m.chat, '📥 Descargando', ` ${isLimit ? `≡  *HJ YTDL*\n\n▢ *⚖️ Tamaño*: ${api.data.size}\n\n▢ _Limite_ *+${limit} MB*` : '✅ Descarga Completada' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

            if (!isLimit) conn.sendFile(m.chat, api.data.dl_url, api.data.title + '.mp4', `≡  *HJ YTDL*\n*📌 Título:* ${api.data.title}\n*⚖️ Peso* ${api.data.size}`, m, false, { asDocument: chat.useDocument });
            m.react('✅');
        } else {
            throw `✳️ No se pudo descargar el MP4, intenta nuevamente.`;
        }
    }
}
