import fetch from 'node-fetch'; // Asegúrate de tener node-fetch instalado

let handler = async function (m, { conn, text, usedPrefix }) {
  // Si no se proporciona el país, avisamos al usuario
  if (!text) {
    return conn.reply(m.chat, '🔰 Por favor, ingresa un país (ejemplo: /rnd mx).', m);
  }

  const countryMap = {
    'us': 'USA',
    'mx': 'México',
    'ca': 'Canadá',
    'br': 'Brasil',
    'es': 'España',
    'de': 'Alemania',
    'fr': 'Francia',
    'au': 'Australia'
    'ca': 'Canadá'
  };

  const country = text.trim().toLowerCase();
  if (!countryMap[country]) {
    return conn.reply(m.chat, '⚠️ País no válido. Usa uno de los siguientes códigos: us, mx, ca, br, es, de,  fr, au, ca', m);
  }

  // Reacción de carga ✅
  await m.react('✅');

  try {
    // Realizamos la solicitud HTTP para obtener una dirección aleatoria del país seleccionado
    const response = await fetch(`https://randomuser.me/api/?nat=${country}&inc=name,location,phone`);
    const data = await response.json();
    const user = data.results[0];

    const fullName = `${user.name.first} ${user.name.last}`;
    
    // Extraemos la dirección detallada
    const street = user.location.street.name;
    const streetNumber = user.location.street.number;
    const city = user.location.city;
    const state = user.location.state;
    const countryName = user.location.country;
    const postcode = user.location.postcode; // Código Postal
    const address = `${street} ${streetNumber}, ${city}, ${state}, ${countryName}`;
    const phone = user.phone;

    // Formateamos el mensaje de dirección con el código postal añadido
    const addressMessage = `
         *🌍 Dirección Generada:*
    *❇️ Calle:* ${street} ${streetNumber}
    *❇️ Ciudad:* ${city}
    *❇️ Estado:* ${state}
    *❇️ Teléfono:* ${phone}
    *❇️ Código Postal:* ${postcode}
    *❇️ País:* ${countryName} 
    `;

    // Enviar el mensaje con el botón
    const playMessage = 'Haz clic para generar una nueva dirección con el mismo país';
    
    // Aquí creamos el botón de acción
    conn.sendButton(m.chat, addressMessage, playMessage, [
      ['🔄 RND 🔄', `${usedPrefix}rnd ${country}`], // Aquí pasamos el país para que se mantenga la selección
    ], m);

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '❗️ Hubo un error al generar la dirección. Intenta nuevamente.', m);
  }
};

handler.command = /^(rnd)$/i;
handler.tags = ['bin'];
handler.help = ['rnd'];
export default handler;
