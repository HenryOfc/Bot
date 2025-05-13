let handler = async function (m, { conn, text, usedPrefix }) {
  if (!text) {
    return conn.reply(m.chat, 'Por favor, ingresa un país.', m);
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
  
  const country = text.toLowerCase();
  if (!countryMap[country]) {
    return conn.reply(m.chat, 'País no válido. Usa uno de los siguientes códigos: us, mx, ca, br, es, de, it, fr, au.', m);
  }

  const loadingMessage = 'Generando dirección...';
  conn.reply(m.chat, loadingMessage, m);

  try {
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
    conn.reply(m.chat, 'Hubo un error al generar la dirección.', m);
  }
};

handler.command = /^(rnd)$/i;

export default handler;

function mostrarGeneradorDeDirecciones() {
  document.getElementById("contenido").innerHTML = `
    <div class="card-box">
      <h2>Generador de Direcciones Aleatorias</h2>
      <label for="country">Selecciona un país:</label>
      <select id="country">
        <option value="us">USA</option>
        <option value="mx">MEXICO</option>
        <option value="ca">CANADA</option>
        <option value="br">BRASIL</option>        
        <option value="es">ESPAÑA</option>
        <option value="de">ALEMANIA</option>
        <option value="it">ITALIA</option>
        <option value="fr">FRANCIA</option>
        <option value="au">AUSTRALIA</option>
      </select>

      <button id="generateButton">Generar Dirección</button>

      <div id="loading" class="loading" style="display:none;">Cargando...</div>

      <div id="address" class="address"></div>
    </div>
  `;

  document.getElementById('generateButton').addEventListener('click', function() {
    const country = document.getElementById('country').value;
    const addressElement = document.getElementById('address');
    const loadingElement = document.getElementById('loading');

    loadingElement.style.display = 'block';
    addressElement.style.display = 'none';

    fetch(`https://randomuser.me/api/?nat=${country}&inc=name,location,phone`)
      .then(response => response.json())
      .then(data => {
        const user = data.results[0];
        const fullName = `${user.name.first} ${user.name.last}`;
        const address = `${user.location.street.name} ${user.location.street.number}, ${user.location.city}, ${user.location.state}, ${user.location.country}`;

        addressElement.innerHTML = `
          <h3>Dirección Generada:</h3>
          <p><strong>Nombre:</strong> ${fullName}</p>
          <p><strong>Dirección:</strong> ${address}</p>
          <p><strong>Teléfono:</strong> ${user.phone}</p>
        `;
        addressElement.style.display = 'block';
        loadingElement.style.display = 'none';
      })
      .catch(error => {
        console.error(error);
        loadingElement.style.display = 'none';
        addressElement.innerHTML = 'Hubo un error al generar la dirección.';
      });
  });
}
