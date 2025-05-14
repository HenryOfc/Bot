import fetch from 'node-fetch';
import fs from 'fs';

// Manejador de comandos
const handler = async (m, { conn, command, text, isAdmin }) => {
  // Comando para silenciar (mute)
  if (command === 'mute') {
    if (!isAdmin) throw 'Solo un administrador puede ejecutar este comando 👑';

    let mentionedUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : text);
    let userDb = global.db.data.users[mentionedUser];

    if (!mentionedUser) return conn.reply(m.chat, 'Menciona a quién deseas mutear.', m);

    // Si el usuario ya está muteado
    if (userDb.muto) {
      return conn.reply(m.chat, 'Este usuario ya ha sido mutado.', m);
    }

    // Establecer el estado de mute
    userDb.muto = true;

    const muteMsg = {
      key: { participant: '0@s.whatsapp.net', fromMe: false, id: '3gDMuTc' },
      message: {
        locationMessage: {
          name: 'Usuario Mutado',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer()
        }
      },
      participant: '0@s.whatsapp.net'
    };

    // Enviar mensaje de mute
    conn.sendMessage(m.chat, 'El usuario ha sido mutado.', { mentions: [mentionedUser], ...muteMsg });

    return conn.reply(m.chat, 'El usuario ha sido mutado exitosamente.', m);
  }

  // Comando para desmutear (unmute)
  if (command === 'unmute') {
    if (!isAdmin) throw 'Solo un administrador puede ejecutar este comando 👑';

    let mentionedUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : text);
    let userDb = global.db.data.users[mentionedUser];

    if (!mentionedUser) return conn.reply(m.chat, 'Menciona a quién deseas desmutear.', m);

    // Si el usuario no está muteado
    if (!userDb.muto) {
      return conn.reply(m.chat, 'Este usuario no está muteado.', m);
    }

    // Eliminar el estado de mute
    userDb.muto = false;

    const unmuteMsg = {
      key: { participant: '0@s.whatsapp.net', fromMe: false, id: '3gDMuTc' },
      message: {
        locationMessage: {
          name: 'Usuario Desmutado',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer()
        }
      },
      participant: '0@s.whatsapp.net'
    };

    // Enviar mensaje de desmute
    conn.sendMessage(m.chat, 'El usuario ha sido desmutado.', { mentions: [mentionedUser], ...unmuteMsg });

    return conn.reply(m.chat, 'El usuario ha sido desmutado exitosamente.', m);
  }
};

// Configuración de los comandos
handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.admin = handler.group = handler.botAdmin = true;

export default handler;
