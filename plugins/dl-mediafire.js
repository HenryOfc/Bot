
import fetch from 'node-fetch'
let free = 150 // limite de descarga
let prem = 800
let handler = async (m, { conn, args, text, usedPrefix, command, isOwner, isPrems }) => {
	  
   if (!args[0]) throw `✳️ ${mssg.noLink('Mediafire')}`
    if (!args[0].match(/mediafire/gi)) throw `❎ ${mssg.noLink('Mediafire')}`
    m.react(rwait)

    let limit = isPrems || isOwner ? prem : free
	  let u = /https?:\/\//.test(args[0]) ? args[0] : 'https://' + args[0]
    let ss = await (await fetch(global.API('nrtm', '/api/ssweb', { delay: 1000, url: u }))).buffer()
    
  try {

	let res = await fetch(global.API('fgmods', '/api/downloader/mediafire', { url: args[0] }, 'apikey'))
  let data = await res.json()
    let { url, mimetype, filename, ext, upload_date, filesize, filesizeB } = data.result
   
	   let isLimit = limit * 1024 < filesizeB
    let caption = `
   ≡ *MEDIAFIRE DL*

*📌${mssg.name}:* ${filename}
*⚖️${mssg.size}:* ${filesize}
*🔼${mssg.aploud}:* ${upload_date}
${isLimit ? `\n▢ ${mssg.limitdl} *+${free} MB* ${mssg.limitdlTe} *${prem} MB*` : ''} 
`.trim()
await conn.sendFile(m.chat, ss, 'ssweb.png', caption, m)
if(!isLimit) await conn.sendFile(m.chat, url, filename, '', m, null, { mimetype: ext, asDocument: true })
    m.react(done)
  } catch {
    m.reply(mssg.error)
  }

  

}
handler.help = ['mediafire <url>']
handler.tags = ['dl', 'prem']
handler.command = ['mediafire', 'mfire'] 
handler.diamond = true
handler.premium = false

export default handler
