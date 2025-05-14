import axios from 'axios';

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (command === 'proxy') {
    if (!text) {
      return conn.reply(m.chat, 'Por favor, ingresa una IP y puerto en formato: /proxy ip:puerto', m);
    }

    const proxy = text.trim();
    const [ip, port] = proxy.split(':');

    if (!ip || !port) {
      return conn.reply(m.chat, 'Formato incorrecto. Debes ingresar la IP y puerto en formato: ip:puerto', m);
    }

    // Verificar si la proxy está viva y obtener la información de la IP
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}?fields=country,region,city,isp`);

      // Hacer una solicitud para verificar si la proxy está "live" (viva)
      const proxyResponse = await axios.get(`http://${ip}:${port}`);

      // Si la proxy está activa, devolver la respuesta con la información del país
      if (proxyResponse.status === 200) {
        const proxyInfo = response.data;
        const country = proxyInfo.country || 'Desconocido';
        const region = proxyInfo.region || 'Desconocido';
        const city = proxyInfo.city || 'Desconocido';
        const isp = proxyInfo.isp || 'Desconocido';

        conn.reply(m.chat, `🔹 **Proxy Live** 🔹\n\nIP: ${ip}\nPuerto: ${port}\nUbicación: ${city}, ${region}, ${country}\nProveedor: ${isp}`, m);
      } else {
        conn.reply(m.chat, `❌ **Proxy Died** ❌\n\nLa proxy ${ip}:${port} está caída. Intenta con otra.` , m);
      }
    } catch (error) {
      // Si hay un error, probablemente la proxy esté caída
      console.error(error);
      conn.reply(m.chat, `❌ **Proxy Died** ❌\n\nNo se pudo conectar con la proxy ${ip}:${port}. Intenta con otra.` , m);
    }
  }
};

// Definir el comando
handler.command = ['proxy'];

export default handler;
