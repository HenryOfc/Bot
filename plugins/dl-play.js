
import yts from 'yt-search';
import fetch from 'node-fetch';
let limit = 320;
let confirmation = {};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
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
    } else if (command === 'hjmp3') {
        // Comando para descargar MP3
        if (!text) throw `✳️ Ejemplo: *${usedPrefix}hjmp3 https://youtu.be/xxxxx*`;

        let res = await fetch(`https://ytdl.sylphy.xyz/dl/mp3?url=${text}&quality=128`);
        let data = await res.json();

        let { title, dl_url } = data;
        conn.sendFile(m.chat, dl_url, `${title}.mp3`, `≡  *HJ YTDL*\n\n▢ *📌 Título* : ${title}`, m, false, { mimetype: 'audio/mpeg' });
        m.react('✅');
    } else if (command === 'hjmp4') {
        // Comando para descargar MP4
        if (!text) throw `✳️ Ejemplo: *${usedPrefix}hjmp4 https://youtu.be/xxxxx*`;

        let res = await fetch(`https://ytdl.sylphy.xyz/dl/mp4?url=${text}&quality=480`);
        let data = await res.json();

        let { title, dl_url } = data;
        conn.sendFile(m.chat, dl_url, `${title}.mp4`, `≡  *HJ YTDL*\n*📌 Título:* ${title}`, m, false, { mimetype: 'video/mp4' });
        m.react('✅');
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

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, thumb, size, sizeB, duration } = data.result;
        conn.sendFile(m.chat, dl_url, title + '.mp3', `≡  *HJ YTDL*\n\n▢ *📌 Título* : ${title}`, m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
        m.react('✅');
    } else if (m.text.trim() === '2') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, thumb, size, sizeB, duration } = data.result;
        let isLimit = limit * 1024 < sizeB;

        await conn.loadingMsg(m.chat, '📥 Descargando', ` ${isLimit ? `≡  *HJ YTDL*\n\n▢ *⚖️ Tamaño*: ${size}\n\n▢ _Limite_ *+${limit} MB*` : '✅ Descarga Completada' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

        if (!isLimit) conn.sendFile(m.chat, dl_url, title + '.mp4', `≡  *HJ YTDL*\n*📌 Título:* ${title}\n*⚖️ Peso* ${size}`, m, false, { asDocument: chat.useDocument });
        m.react('✅');
    }
}
