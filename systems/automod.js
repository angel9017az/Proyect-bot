const responses = [

  {
    triggers: [
      "como me verifico",
      "como verifico",
      "cómo me verifico",
      "cómo verifico",
      "verificacion",
      "verificación"
    ],

    response:
      "🛡️ **SHIFT // VERIFICATION PROTOCOL**\n\n" +
      "Para completar tu verificación, dirígete al canal correspondiente y sigue las instrucciones indicadas.\n\n" +
      "`PROTOCOL STATUS: ONLINE`"
  },

  {
    triggers: [
      "como reporto",
      "cómo reporto",
      "reportar jugador",
      "reportar a alguien"
    ],

    response:
      "🚨 **SHIFT // REPORT PROTOCOL**\n\n" +
      "Puedes realizar un reporte utilizando el sistema de reportes disponible en el servidor.\n\n" +
      "`REPORT SYSTEM: ONLINE`"
  },

  {
    triggers: [
      "como hago una sugerencia",
      "cómo hago una sugerencia",
      "sugerencia",
      "sugerencias"
    ],

    response:
      "💡 **SHIFT // SUGGESTION SYSTEM**\n\n" +
      "Puedes enviar una sugerencia utilizando el sistema de sugerencias del servidor.\n\n" +
      "`SUGGESTION SYSTEM: ONLINE`"
  },

  {
    triggers: [
      "que es last shift",
      "qué es last shift",
      "que es el juego",
      "qué es el juego"
    ],

    response:
      "📡 **SHIFT // LAST SHIFT**\n\n" +
      "LAST SHIFT es el proyecto de juego desarrollado por nuestro equipo.\n\n" +
      "Mantente atento a los anuncios oficiales para conocer novedades, pruebas y actualizaciones."
  },

  {
    triggers: [
      "cuando sale",
      "cuándo sale",
      "cuando sale el juego",
      "cuándo sale el juego"
    ],

    response:
      "📡 **SHIFT // RELEASE INFORMATION**\n\n" +
      "La fecha oficial de lanzamiento será anunciada mediante los canales oficiales.\n\n" +
      "`RELEASE DATE: NOT ANNOUNCED`"
  }

];

function normalize(text) {

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}

async function handleAutoResponse(
  message
) {

  const content =
    normalize(message.content);

  // Evitar responder a mensajes largos
  if (
    content.length > 250
  ) {
    return;
  }

  for (
    const item of responses
  ) {

    const matched =
      item.triggers.some(
        trigger =>
          content.includes(
            normalize(trigger)
          )
      );

    if (!matched) {
      continue;
    }

    await message.reply({
      content:
        item.response
    });

    return;
  }

}

module.exports = {
  handleAutoResponse
};
