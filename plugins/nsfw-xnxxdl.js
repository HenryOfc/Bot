
import fetch from 'node-fetch'
import fg from 'senna-fg'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender].age
  if (user < 17) throw `❎ ${mssg.nsfwAge}`
  
  if (!text) throw `✳️ ${mssg.searchTo('xnxx.com', usedPrefix, command)}`

  m.react(rwait)

  if (text.includes('http://') || text.includes('https://')) {
    if (!text.includes('xnxx.com')) return m.reply(`❎ ${mssg.noLink('xnxx.com')}`)
    try {
      let xn = await fg.xnxxdl(text)
      conn.sendFile(m.chat, xn.url_dl, xn.title + '.mp4', `
≡  *XNXX DL*
*📌${mssg.title}*: ${xn.title}
*⌚${mssg.duration}:* ${xn.duration}
*🎞️${mssg.quality}:* ${xn.quality}
`.trim(), m, false, { asDocument: false }) // Ajusté `asDocument` a false, ya que generalmente se quiere enviar como archivo multimedia
      m.react(done)
    } catch (e) {
      m.reply(`🔴 ${mssg.error}`)
    }
  } else {
    try {
      let res = await fg.xnxxSearch(text)
      let fgg = res.result.map((v, i) => `*📌${mssg.title}* : ${v.title}\n*🔗${mssg.link}:* ${v.link}\n`).join('─────────────────\n\n')
      if (res.status) m.reply(fgg)
    } catch (e) {
      m.reply(`🔴 ${mssg.error}`)
    }
  }
}

handler.help = ['xnxx']
handler.tags = ['nsfw', 'prem']
handler.command = ['xnxxsearch', 'xnxxdl', 'xnxx']
handler.register = true

export default handler
