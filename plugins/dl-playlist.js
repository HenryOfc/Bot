import yts from 'yt-search';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
    if (!text) throw `✳️ ${mssg.example} *${usedPrefix + command}* Lil Peep hate my life`;
    m.react('📀');

    let result = await yts(text);
    let ytres = result.videos;

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
                    id: `${usedPrefix}hjmp3 ${v.url}`
                },
                {
                    header: "🎥 MP4",
                    title: "" ,
                    description: `▢ ⌚ *${mssg.duration}:* ${v.timestamp}\n▢ 👀 *${mssg.views}:* ${v.views}\n▢ 📌 *${mssg.title}* : ${v.title}\n▢ 📆 *${mssg.aploud}:* ${v.ago}\n`, 
                    id: `${usedPrefix}hjmp4 ${v.url}`
                }
            ]
        });
    }

    await conn.sendList(m.chat, '  ≡ *HJ MUSIC*🔎', `\n 📀 Resultados de:\n *${text}*`, `Click Aqui`, ytres[0].image, listSections, m);
};

// Comando para descargar MP3
if (command === "hjmp3") {
    if (!text) throw `✳️ Ejemplo: *${usedPrefix}hjmp3 https://youtu.be/xxxxx*`;

    const api = await (await fetch(`https://ytdl.sylphy.xyz/dl/mp3?url=${text}&quality=128`)).json();
    if (api.data.dl_url) {
        await conn.sendFile(m.chat, api.data.dl_url, api.data.title, "", m);
        await m.react("✔️");
    } else {
        throw `✳️ No se pudo descargar el MP3, intenta nuevamente.`;
    }
} 
// Comando para descargar MP4
else if (command === "hjmp4" || command === "playvid") {
    if (!text) throw `✳️ Ejemplo: *${usedPrefix}hjmp4 https://youtu.be/xxxxx*`;

    const api = await (await fetch(`https://ytdl.sylphy.xyz/dl/mp4?url=${text}&quality=480`)).json();
    if (api.data.dl_url) {
        await m.react("✅");
        const doc = api.data.size_mb >= limit;
        await conn.sendFile(m.chat, api.data.dl_url, api.data.title, "", m, null, { asDocument: doc });
    } else {
        throw `✳️ No se pudo descargar el MP4, intenta nuevamente.`;
    }
}

handler.help = ['playlist]
handler.tags = ['dl']
handler.command = ['hjmp3', 'hjmp4', 'playlist', 'playlista'] 
handler.disabled = false

export default handler;
