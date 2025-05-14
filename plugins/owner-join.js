let handler = async (m, { conn, text, usedPrefix, command, args, participants, isOwner }) => {

  let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
  let delay = time => new Promise(res => setTimeout(res, time))

  let name = m.sender
  let [_, code] = text.match(linkRegex) || []
  if (!args[0]) throw `✳️ Envie el link del Grupo\n\n 📌 Ejemplo:\n *${usedPrefix + command}* <linkwa>`
  if (!code) throw `✳️ Link inválido`
  
  let owbot = global.owner[1]
  m.reply(`😎 Espere 3 segundos, me uniré al grupo`)
  await delay(3000)
  try {
    let res = await conn.groupAcceptInvite(code)
    let b = await conn.groupMetadata(res)
    let d = b.participants.map(v => v.id)
    let member = d.toString()
    let e = await d.filter(v => v.endsWith(owbot + '@s.whatsapp.net'))

    if (e.length) await m.reply(`✅ Me uni correctamente al grupo \n\n≡ Info del grupo \n\n *Nombre :* ${await conn.getName(res)}`)
    
    if (e.length) await conn.reply(res, `🏮 Hola shavales

@${owbot} es mi creador  si tiene alguna duda
fui invitado por *${m.name}*`, m, {
      mentions: d
    }).then(async () => {
      await delay(7000)
    }).then(async () => {
      await conn.reply(res, `vale todos relajaos 🤭`, 0)
      await conn.reply(global.owner[1] + '@s.whatsapp.net', `≡ *INVITACIÓN A GRUPO*\n\n@${m.sender.split('@')[0]} ha invitado a *${conn.user.name}* al grupo\n\n*${await conn.getName(res)}*\n\n*ID* : ${res}\n\n📌 Enlace : ${args[0]}`, null, {mentions: [m.sender]})
    })

    if (!e.length) await conn.reply(global.owner[1] + '@s.whatsapp.net', `≡ *INVITACIÓN A GRUPO*\n\n@${m.sender.split('@')[0]} ha invitado a *${conn.user.name}* al grupo\n\n*${await conn.getName(res)}*\n\n*ID* : ${res}\n\n📌 Enlace : ${args[0]}`, null, {mentions: [m.sender]})

    if (!e.length) await m.reply(`✅ Se invito al bot al grupo\n\n${await conn.getName(res)}`).then(async () => {
      let mes = `Hola a todos 👋🏻

*${conn.user.name}* es uno de los bots multidispositivo de WhatsApp construido con Node.js, *${conn.user.name}* Recién invitado por *${m.name}*

para ver el Menu del bot escribe

*${usedPrefix}help*`

      await conn.reply(res, mes, m, {
        mentions: d
      })
    })

  } catch (e) {
    conn.reply(global.owner[1] + '@s.whatsapp.net', e)
    throw `✳️ Lo siento, el bot no puede unirse a grupos`
  }
}

handler.help = ['join <chat.whatsapp.com>']
handler.tags = ['owner']
handler.command = ['join', 'invite']

handler.owner = true

export default handler
