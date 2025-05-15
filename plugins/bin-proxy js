import axios from 'axios';

// Función para verificar si el proxy está vivo
async function verificarProxy(ipPuerto, url = 'http://www.google.com') {
  const proxy = `http://${ipPuerto}`;
  const proxies = {
    http: proxy,
    https: proxy,
  };

  try {
    // Intentar hacer una solicitud a la URL utilizando el proxy
    const response = await axios.get(url, { proxy: { host: ipPuerto.split(':')[0], port: parseInt(ipPuerto.split(':')[1]) }, timeout: 5000 });

    // Verificar si la respuesta es exitosa (código 200)
    if (response.status === 200) {
      return true; // Proxy vivo
    } else {
      return false; // Proxy no vivo
    }
  } catch (error) {
    return false; // Proxy muerto o no se puede conectar
  }
}

// Función para obtener la información de la IP usando ipinfo.io
async function obtenerInfoIP(ipPuerto) {
  try {
    const ip = ipPuerto.split(':')[0]; // Obtener solo la IP de la proxy
    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    return response.data; // Información sobre la IP
  } catch (err) {
    return null; // Si no se puede obtener la info, devolvemos null
  }
}

// El comando handler para recibir el comando "/proxy ip:puerto"
let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  // Comprobar si el texto tiene formato correcto
  const proxy = text.trim(); // Obtener el proxy que se pasa después del comando

  if (!proxy) {
    return conn.reply(m.chat, "🔰 Por favor, envía un proxy en formato: /proxy ip:puerto", m);
  }

  // Verificar si la proxy está viva
  const estaVivo = await verificarProxy(proxy);

  if (estaVivo) {
    // Si el proxy está vivo, obtener información adicional de la IP
    const infoIP = await obtenerInfoIP(proxy);
    if (infoIP) {
      const info = `❇️ *Proxy* ${proxy} Live ✅️\n🍀 *_Información_*: \n ❇️ *País:* ${infoIP.country}\n ❇️*Ciudad:* ${infoIP.city}\n *Región:* ${infoIP.region}`;
      conn.reply(m.chat, info, m);
    } else {
      conn.reply(m.chat, `❇️ *Proxy* ${proxy} Live ✅️, pero no se pudo obtener la información de la IP.`, m);
    }
  } else {
    // Si el proxy está muerto o no se puede conectar
    conn.reply(m.chat, `❇️ *Proxy* ${proxy} Declined ❌️.`, m);
  }
};

handler.command = ['proxy']; // Asociamos el comando "/proxy" con el handler
handler.tags = ['bin']
handler.help = ['proxy']
export default handler;
