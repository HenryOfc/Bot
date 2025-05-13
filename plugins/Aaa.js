import fetch from 'node-fetch'; // Importamos node-fetch

let handler = async function (m, { conn, text, usedPrefix }) {
  if (!text) {
    return conn.reply(m.chat, 'Por favor, ingresa un país (ejemplo: /rnd mx).', m);
  }

  const countryMap = {
    'us': 'USA',
    'mx': 'México',
    'ca': 'Canadá',
    'br': 'Brasil',
    'es': 'España',
    'de': 'Alemania',
    'it': 'Italia',
    'fr': 'Francia',
    'au': 'Australia'
  };

  const country = text.trim().toLowerCase();
  if (!countryMap[country]) {
    return conn.reply(m.chat, 'País no válido. Usa uno de los siguientes códigos: us, mx, ca, br, es, de, it, fr, au.', m);
  }

  const loadingMessage = 'Generando dirección...';
  conn.reply(m.chat, loadingMessage, m);

  try {
    // Realizamos la solicitud HTTP para obtener una dirección aleatoria del país seleccionado
    const response = await fetch(`https://randomuser.me/api/?nat=${country}&inc=name,location,phone`);
    const data = await response.json();

    const user = data.results[0];
    const fullName = `${user.name.first} ${user.name.last}`;
    const address = `${user.location.street.name} ${user.location.street.number}, ${user.location.city}, ${user.location.state}, ${user.location.country}`;
    const phone = user.phone;

    const addressMessage = `
      *Dirección Generada:*
      *Nombre:* ${fullName}
      *Dirección:* ${address}
      *Teléfono:* ${phone}
    `;
    conn.reply(m.chat, addressMessage, m);
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, 'Hubo un error al generar la dirección. Intenta nuevamente.', m);
  }
};

handler.command = /^(rnd)$/i;

export default handler;
