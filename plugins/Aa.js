import fetch from 'node-fetch';
import fs from 'fs';

// Manejador de comandos
const handler = async (m, { conn, command, text, isAdmin }) => {
  // Comando para silenciar (mute)
  if (command === 'mute') {
    if (!isAdmin) throw 'Solo un administrador puede ejecutar este comando 👑';

    let mentionedUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : text);
    let userDb = global.db.data.users[mentionedUser];

    // Validación si no hay usuario mencionado o citado
    if (!mentionedUser) {
      return conn.reply(m.chat, 'Menciona a quién deseas mutear. Ejemplo: *!mute @usuario*', m);
    }

    // Verificar si el usuario ya está muteado
    if (userDb.muto) {
      return conn.reply(m.chat, 'Este usuario ya ha sido mutado.', m);
    }

    // Actualizar la base de datos para marcar al usuario como muteado
    userDb.muto = true;

    // Enviar un mensaje notificando el mute
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

    conn.sendMessage(m.chat, 'El usuario ha sido mutado.', { mentions: [mentionedUser], ...muteMsg });

    // Eliminar mensajes del usuario muteado
    conn.sendMessage(m.chat, { text: `El usuario *@${mentionedUser.split('@')[0]}* ha sido mutado y sus mensajes serán eliminados.`, mentions: [mentionedUser] });

    return;
  }

  // Comando para desmutear (unmute)
  if (command === 'unmute') {
    if (!isAdmin) throw 'Solo un administrador puede ejecutar este comando 👑';

    let mentionedUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : text);
    let userDb = global.db.data.users[mentionedUser];

    // Validación si no hay usuario mencionado o citado
    if (!mentionedUser) {
      return conn.reply(m.chat, 'Menciona a quién deseas desmutear. Ejemplo: *!unmute @usuario*', m);
    }

    // Verificar si el usuario está muteado
    if (!userDb.muto) {
      return conn.reply(m.chat, 'Este usuario no está muteado.', m);
    }

    // Actualizar la base de datos para marcar al usuario como desmuteado
    userDb.muto = false;

    // Enviar un mensaje notificando el desmute
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

    conn.sendMessage(m.chat, 'El usuario ha sido desmutado.', { mentions: [mentionedUser], ...unmuteMsg });

    // Confirmación de que el usuario ya no será muteado
    conn.sendMessage(m.chat, { text: `El usuario *@${mentionedUser.split('@')[0]}* ha sido desmutado y sus mensajes ya no serán eliminados.`, mentions: [mentionedUser] });

    return;
  }
};

// Configuración de los comandos
handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.admin = handler.group = handler.botAdmin = true;

export default handler;
