import fetch from 'node-fetch';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!args[0]) throw `✳️ ${mssg.noLink('TikTok')}\n\n 📌 ${mssg.example} : ${usedPrefix + command} https://vm.tiktok.com/ZMYG92bUh/`;
  if (!args[0].match(/tiktok/gi)) throw `❎ ${mssg.noLink('TikTok')}`;

  m.react(rwait);

  try {
    // Realizamos la llamada a la nueva API con la clave de API
    let res = await fetch(`https://api.fgmods.xyz/api/downloader/tiktok?url=${args[0]}&apikey=fg_M6khGFXR`);
    let data = await res.json();

    // Verificamos si la respuesta es válida
    if (!data.result || !data.result.play) {
      throw `❎ ${mssg.error}`;
    }

    // Si no tiene imágenes, solo enviamos el video
    if (!data.result.images || data.result.images.length === 0) {
      let tex = `
┌─⊷ *TIKTOK DL*
▢ *${mssg.name}:* ${data.result.author.nickname}
▢ *${mssg.username}:* ${data.result.author.unique_id}
▢ *${mssg.duration}:* ${data.result.duration}
▢ *Likes:* ${data.result.digg_count}
▢ *${mssg.views}:* ${data.result.play_count}
▢ *${mssg.desc}:* ${data.result.title}
└───────────
`;
      conn.sendFile(m.chat, data.result.play, 'tiktok.mp4', tex, m);
      m.react(done);
    } else {
      // Si tiene imágenes, enviamos las imágenes y el video
      let cap = `
▢ *Likes:* ${data.result.digg_count}
▢ *${mssg.desc}:* ${data.result.title}
`;

      // Enviar las imágenes
      for (let ttdl of data.result.images) {
        conn.sendMessage(m.chat, { image: { url: ttdl }, caption: cap }, { quoted: m });
      }

      // Enviar el audio
      conn.sendFile(m.chat, data.result.play, 'tiktok.mp3', '', m, null, { mimetype: 'audio/mp4' });
      m.react(done);
    }

  } catch (error) {
    console.error(error);  // Para depuración
    m.reply(`❎ ${mssg.error}`);
  }
};

handler.help = ['tiktok'];
handler.tags = ['dl'];
handler.command = ['tiktok', 'tt', 'tiktokimg', 'tiktokslide'];

export default handler;
