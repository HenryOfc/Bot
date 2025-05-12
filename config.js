import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk' 
import { fileURLToPath } from 'url' 

global.owner = [
  ['5214437863111', 'HJ', true],
] //Numeros de owner 

global.mods = [''] 
global.prems = ['Nohay', 'no']
global.botNumber = [''] 
global.APIs = { // API Prefix
  // name: 'https://website' 
  nrtm: 'https://fg-nrtm.ddns.net',
  fgmods: 'https://api.fgmods.xyz'
}
global.APIKeys = { // APIKey Here
  // 'https://website': 'apikey'
  'https://api.fgmods.xyz': 'fg_9XdnzCdQ' //--- 100 de límite diario --- Regístrese en https://api.fgmods.xyz/
}

// Sticker WM
global.packname = 'ver┃ᴮᴼᵀ' 
global.author = '@hjofc123'

//--info FG
global.botName = 'HacheJota'
global.fgig = 'https://t.me/hjofc123'
global.fgsc = 'https://github.com/'
global.fgyt = 'https://youtube.com/'
global.fgpyp = 'https://xnxx.com'
global.fglog = 'https://i.ibb.co/1zdz2j3/logo.jpg' 

//--- Grupos WA
global.id_canal = '120363177092661333@newsletter' 

global.fgcanal = 'https://whatsapp.com/channel/0029VaCeuZd6mYPQiWqxXj1F'
global.bgp = 'https://chat.whatsapp.com/BESBo5xjvIZE4YVvth6Yzr'
global.bgp2 = 'https://chat.whatsapp.com/I7bvd8XCAOUHjgkHteqFC7'
global.bgp3 = 'https://chat.whatsapp.com/F0JTTyZ3hsoL7OlU8TEpuH' //--GP NSFW

global.wait = '⌛ _Cargando..._\n*▬▬▬▭*'
global.rwait = '⌛'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌' 
global.xmoji = '🔥' 

global.multiplier = 69 
global.maxwarn = '2' // máxima advertencias

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
