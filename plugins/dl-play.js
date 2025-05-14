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

  // Si es comando play
  if (command === 'play') {
    await conn.sendList(m.chat, '≡ *FG MUSIC*🔎', `\n📀 Resultados de:\n *${text}*`, `Click Aquí`, ytres[0].image, listSections, m);
  }

  // Si es comando playlist
  if (command === 'playlist') {
    await conn.sendList(m.chat, '≡ *FG MUSIC Playlist*🔎', `\n📀 Playlist de:\n *${text}*`, `Click Aquí`, ytres[0].image, listSections, m);
  }

  // Comando para descargar MP3 (fgmp3)
  if (command === 'fgmp3') {
    let videoUrl = args[0];
    if (!videoUrl) throw `✳️ ${mssg.example} :\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`;

    let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: videoUrl }, 'apikey'));
    let data = await res.json();

    let { title, dl_url, thumb, size, sizeB, duration } = data.result;
    let chat = global.db.data.chats[m.chat];
    conn.sendFile(m.chat, dl_url, title + '.mp3', `
    ≡  *FG YTDL*
    ▢ *📌${mssg.title}* : ${title}
    `.trim(), m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
    m.react('✅');
  }

  // Comando para descargar MP4 (fgmp4)
  if (command === 'fgmp4') {
    let videoUrl = args[0];
    if (!videoUrl) throw `✳️ ${mssg.example} :\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`;

    let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: videoUrl }, 'apikey'));
    let data = await res.json();

    let { title, dl_url, thumb, size, sizeB, duration } = data.result;
    let isLimit = limit * 1024 < sizeB;

    await conn.loadingMsg(m.chat, '📥 Descargando', ` ${isLimit ? `≡  *FG YTDL*\n\n▢ *⚖️${mssg.size}*: ${size}\n\n▢ _${mssg.limitdl}_ *+${limit} MB*` : '✅ Descarga Completada' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

    if (!isLimit) {
      let chat = global.db.data.chats[m.chat];
      conn.sendFile(m.chat, dl_url, title + '.mp4', `≡  *FG YTDL*\n*📌${mssg.title}:* ${title}\n*⚖️${mssg.size}:* ${size}`, m, false, { asDocument: chat.useDocument });
      m.react('✅');
    }
  }
}

handler.help = ['play', 'playlist', 'fgmp3', 'fgmp4'];
handler.tags = ['dl'];
handler.command = ['play', 'playlist', 'fgmp3', 'fgmp4'];
handler.disabled = false;

export default handler;
