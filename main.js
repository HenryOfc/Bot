//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
import './config.js'; 
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk'
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import pino from 'pino';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js'
import { Boom } from '@hapi/boom'
const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion, 
    MessageRetryMap,
    makeCacheableSignalKeyStore, 
    jidNormalizedUser,
    PHONENUMBER_MCC
   } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import readline from 'readline'
import fs from 'fs'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) } 

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
global.timestamp = {
  start: new Date
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

//global.opts['db'] = "mongodb+srv://dbdyluxbot:password@cluster0.xwbxda5.mongodb.net/?retryWrites=true&w=majority"

global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
      (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
      new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)

global.DATABASE = global.db 
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!global.db.READ) {
      clearInterval(this)
      resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
    }
  }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {}, // Eliminar esta sección
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

//-- SESSION
global.authFile = `sessions`
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
//const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
//const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber[0]

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
do {
opcion = await question('\n\n\n✳️ Ingrese el metodo de conexion\n\n\n🔺 1 : por código  QR\n🔺 2 : por CÓDIGO de 8 dígitos\n\n\n\n')
if (!/^[1-2]$/.test(opcion)) {
console.log('\n\n🔴 Ingrese solo una opción \n\n 1 o 2\n\n')
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${authFile}/creds.json`))
}

console.info = () => {} 

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: opcion === '1' || methodCodeQR,
    mobile: MethodMobile,
    browser: opcion === '1' ? ['Senna', 'Safari', '2.0.0'] : methodCodeQR ? ['Senna', 'Safari', '2.0.0'] : ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
    },
    waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid);
        let msg = await store.loadMessage(jid, key.id);
        return msg?.message || "";
    },
    patchMessageBeforeSending: async (message) => {
        let messages = 0;
        global.conn.uploadPreKeysToServerIfRequired();
        messages++;
        return message;
    },
    msgRetryCounterCache: msgRetryCounterCache,
    userDevicesCache: userDevicesCache,
    //msgRetryCounterMap,
    defaultQueryTimeoutMs: undefined,
    cachedGroupMetadata: (jid) => global.conn.chats[jid] ?? {},
    version: [2, 3000, 1015901307],
    //userDeviceCache: msgRetryCounterCache <=== quien fue el pendejo?????
};

global.conn = makeWASocket(connectionOptions)

if (!fs.existsSync(`./${authFile}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {  
if (MethodMobile) throw new Error('⚠️ Se produjo un Error en la API de movil')

let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
if (!Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
console.log(chalk.bgBlack(chalk.bold.redBright("\n\n✴️ Su número debe comenzar  con el codigo de pais")))
process.exit(0)
}} else {
while (true) {
addNumber = await question(chalk.bgBlack(chalk.bold.greenBright("\n\n✳️ Escriba su numero\n\nEjemplo: 5491168xxxx\n\n")))
addNumber = addNumber.replace(/[^0-9]/g, '')

if (addNumber.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
break 
} else {
console.log(chalk.bgBlack(chalk.bold.redBright("\n\n✴️ Su número debe comenzar con el codigo de pais")))
}
}
}
await conn.sendMessage('status@broadcast', { text: `❗ Si aún no se ha registrado en la base de datos, registre su número.` })
await conn.sendMessage(addNumber + "@s.whatsapp.net", { text: `👋 Bienvenido! Su cuenta ha sido registrada.` })
await conn.sendMessage(addNumber + "@s.whatsapp.net", { text: `⚠️ Este es un bot de ejemplo. Esta en fase de desarrollo.` })
}
}
}

process.once('uncaughtException', function (err) {
  console.log(chalk.red(`FATAL ERROR!`));
  console.error(err);
  process.exit(1);
});

process.once('unhandledRejection', function (err) {
  console.log(chalk.red(`Unhandled Rejection!`));
  console.error(err);
});
