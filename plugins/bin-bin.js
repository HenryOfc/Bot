import fetch from 'node-fetch';
import fs from 'fs';  // Asegúrate de importar 'fs'
import path from 'path'; // Asegúrate de importar 'path'

let pp = fs.readFileSync(path.resolve('./src/fg_logo.jpg'));  

let handler = async function (m, { conn, text, usedPrefix, fgig }) {
  if (text.length !== 6) {
    return conn.reply(m.chat, 'El BIN debe tener 6 carácteres obligatorios.', m);
  }

  const apiUrl = `https://bins.antipublic.cc/bins/${text}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('La página no está funcionando actualmente');
    }

    const data = await response.json();

    if (!data || !data.bank || !data.brand || !data.country_name || !data.country_flag) {
      throw new Error('No se pudo obtener la información del BIN');
    }

    // Formato de la información
    const formattedResult = `
    抵 *Bin Lookup* [#BIN${text}]
    ╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸
    » *Info* -»  ${data.brand || 'Desconocida'} -  ${data.type || 'Desconocido'} -  ${data.level || 'Desconocido'}
    » *Bank* -» ${data.bank || 'Desconocido'}
    » *Country* -» ${data.country_name || 'Desconocido'} (${data.country_flag || '❓'})
   ╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸╸
   » *Bot by* -» HacheJota
    
    `;

    console.log('Información del BIN:', formattedResult);

    // Enviar el mensaje
    await conn.reply(m.chat, formattedResult.trim(), m, { 
      contextInfo: { 
        externalAdReply: {
          title: 'INFO BIN',
          body: 'HacheJota',
          sourceUrl: fgig, // Asegúrate de que fgig esté definido
          thumbnail: pp // Asegúrate de que pp esté correctamente cargado
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    conn.reply(m.chat, 'Ocurrió un error al obtener la información del BIN.', m);
  }
};
handler.help = ['bin'];
handler.tags = ['bin'];
handler.command = /^(bin)$/i;
export default handler;
