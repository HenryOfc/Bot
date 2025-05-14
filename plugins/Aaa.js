const handler = async (m, { conn, participants, command, usedPrefix }) => {
  const kickText = `*[❗] Etiqueta a una persona o responde a un mensaje del grupo para eliminar al usuario*\n\n*—◉ Ejemplo:*\n*${usedPrefix + command} @${global.suittag}*`;
  
  if (!m.mentionedJid[0] && !m.quoted) {
    return m.reply(kickText, m.chat, { mentions: conn.parseMention(kickText) });
  }

  // Verificar si el mensaje tiene participante mencionado
  const mentionedJid = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0] || m.message.extendedTextMessage?.contextInfo?.participant;
  
  if (!mentionedJid) {
    return m.reply('*[❗] Etiqueta a una persona o responde a un mensaje para eliminar al usuario*');
  }

  // Verificar si el usuario es el bot mismo
  if (conn.user.jid.includes(mentionedJid)) {
    return m.reply('*[❗] No puedo eliminarme a mí mismo. Por favor, hazlo manualmente si lo deseas.*');
  }

  // Actualización de participantes
  const response = await conn.groupParticipantsUpdate(m.chat, [mentionedJid], 'remove');
  
  // Respuestas dependiendo del resultado de la operación
  const responses = {
    '200': `*@${mentionedJid.split('@')[0]} ha sido eliminado exitosamente del grupo*`,
    '406': `*@${mentionedJid.split('@')[0]} es el creador del grupo, no puedo eliminarlo*`,
    '404': `*@${mentionedJid.split('@')[0]} ya ha sido eliminado o abandonó el grupo*`,
  };

  const status = response[0].status;
  if (responses[status]) {
    m.reply(responses[status], m.chat, { mentions: conn.parseMention(responses[status]) });
  } else {
    conn.sendMessage(m.chat, {
      text: `*[❗] Advertencia: Ocurrió un error inesperado*`,
      mentions: [m.sender],
      contextInfo: { forwardingScore: 999, isForwarded: true }
    }, { quoted: m });
  }
};

handler.help = ['kick']
handler.tags = ['group']
handler.command = /^(kick|echar|hechar|sacar)$/i;
handler.admin = handler.group = handler.botAdmin = true;

export default handler;
