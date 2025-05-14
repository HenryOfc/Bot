import yts from 'yt-search';
import fetch from 'node-fetch';

let limit = 320;
let confirmation = {};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (!text) throw `✳️ ${mssg.example} *${usedPrefix + command}* Lil Peep hate my life`;

  // Buscar videos en YouTube
  let res = await yts(text);
  let ytres = res.videos;

  if (!ytres.length) throw `✳️ No se encontraron resultados para: *${text}*`;

  let listSections = [];
  for (let index in ytres) {
    let v = ytres[index];
    listSections.push({
      title: `${index}┃ ${v.title}`,
      rows: [
        {
          header: '🎶 MP3',
          title: "",
          description: `▢ ⌚ *${mssg.duration}:* ${v.timestamp}\n▢ 👀 *${mssg.views}:* ${v.views}\n▢ 📌 *${mssg.title}* : ${v.title}\n▢ 📆 *${mssg.aploud}:* ${v.ago}\n`,
          id: `${usedPrefix}fgmp3 ${v.url}`
        },
        {
          header: "🎥 MP4",
          title: "",
          description: `▢ ⌚ *${mssg.duration}:* ${v.timestamp}\n▢ 👀 *${mssg.views}:* ${v.views}\n▢ 📌 *${mssg.title}* : ${v.title}\n▢ 📆 *${mssg.aploud}:* ${v.ago}\n`,
          id: `${usedPrefix}fgmp4 ${v.url}`
        }
      ]
    });
  }

  await conn.sendList(m.chat, '≡ *FG MUSIC*🔎', `\n📀 Resultados de:\n *${text}*`, `Click Aquí`, ytres[0].image, listSections, m);
};

// Comando para descargar MP3
handler.command = ['ytmp3', 'fgmp3'];
handler.help = ['ytmp3 <url>'];
handler.tags = ['dl'];

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
    conn.sendFile(m.chat, dl_url, title + '.mp3', `≡  *FG YTDL*\n\n▢ *📌 ${mssg.title}* : ${title}`, m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
    m.react('✅');
  } else if (m.text.trim() === '2') {
    clearTimeout(timeout);
    delete confirmation[m.sender];

    let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: url }, 'apikey'));
    let data = await res.json();

    let { title, dl_url, thumb, size, sizeB, duration } = data.result;
    let isLimit = limit * 1024 < sizeB;

    await conn.loadingMsg(m.chat, '📥 Descargando', ` ${isLimit ? `≡  *FG YTDL*\n\n▢ *⚖️${mssg.size}*: ${size}\n\n▢ _${mssg.limitdl}_ *+${limit} MB*` : '✅ Descarga Completada' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

    if (!isLimit) {
      conn.sendFile(m.chat, dl_url, title + '.mp4', `≡  *FG YTDL*\n*📌${mssg.title}:* ${title}\n*⚖️${mssg.size}:* ${size}`, m, false, { asDocument: chat.useDocument });
    }
    m.react('✅');
  }

};

// Comando para descargar MP4
handler.command = ['ytmp4', 'fgmp4'];
handler.help = ['ytmp4 <link yt>'];
handler.tags = ['dl'];

handler.diamond = false;

export default handler;
