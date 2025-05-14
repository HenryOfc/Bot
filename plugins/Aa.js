import fetch from 'node-fetch';

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

    // Confirmar el mute
    return conn.reply(m.chat, 'El usuario ha sido mutado y sus mensajes serán eliminados.', m);
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

    // Confirmar el desmute
    return conn.reply(m.chat, 'El usuario ha sido desmutado y sus mensajes ya no serán eliminados.', m);
  }
};

// Función para eliminar mensajes de usuarios muteados
const deleteMuteMessages = async (m, { conn }) => {
  // Verificar si el usuario está muteado
  let userDb = global.db.data.users[m.sender];
  if (userDb.muto) {
    // Eliminar el mensaje
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.key.id, participant: m.sender } });
  }
};

// Escuchar los mensajes entrantes
handler.all = async (m, { conn }) => {
  // Eliminar los mensajes si el usuario está muteado
  await deleteMuteMessages(m, { conn });
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.admin = handler.group = handler.botAdmin = true;

export default handler;
