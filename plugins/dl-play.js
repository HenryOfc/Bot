import fetch from 'node-fetch';
let limit = 320;
let handler = async (m, { conn, args, isPrems, isOwner, usedPrefix, command }) => {
  if (!args || !args[0]) throw `✳️ ${mssg.example} :\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`;
  if (!args[0].match(/youtu/gi)) throw `❎ ${mssg.noLink('YouTube')}`;
  
  let chat = global.db.data.chats[m.chat];
  m.react(rwait);

  try {
    // Llamada a la API para obtener el MP3 o MP4
    let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: args[0] }, 'apikey'));
    let data = await res.json();

    // Verificar si la respuesta contiene 'result'
    if (!data || !data.result) {
      throw `❎ No se pudo obtener información del video. Intenta nuevamente.`;
    }

    // Desestructurar la respuesta solo si 'result' está presente
    let { title, dl_url, thumb, size, sizeB, duration } = data.result;

    // Verificación adicional: Si no se encuentra 'title' o 'dl_url'
    if (!title || !dl_url) {
      throw `❎ No se pudo obtener el título o el enlace de descarga.`;
    }

    // Enviar el archivo MP3 al chat
    conn.sendFile(m.chat, dl_url, title + '.mp3', `
      ≡  *FG YTDL*
      ▢ *📌${mssg.title}* : ${title}
    `.trim(), m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });

    m.react(done);

  } catch (error) {
    console.error(error);
    await m.reply(`❎ ${mssg.error || 'Ocurrió un error al procesar tu solicitud.'}`);
  }
};

handler.help = ['ytmp3 <link yt>'];
handler.tags = ['dl'];
handler.command = ['ytmp3', 'fgmp3'];
handler.diamond = false;

export default handler;
