const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const giveaways = new Map();

// ============================================================
// DURATION PARSER
// ============================================================

function parseDuration(duration) {

  const match = duration
    .toLowerCase()
    .match(/^(\d+)(s|m|h|d)$/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
}

// ============================================================
// COMMAND
// ============================================================

module.exports = {

  data: new SlashCommandBuilder()

    .setName("giveaway")

    .setDescription(
      "Crea un sorteo."
    )

    .addStringOption(option =>
      option
        .setName("premio")
        .setDescription(
          "Premio del sorteo."
        )
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName("duracion")
        .setDescription(
          "Ejemplo: 30m, 2h, 1d."
        )
        .setRequired(true)
    )

    .addIntegerOption(option =>
      option
        .setName("ganadores")
        .setDescription(
          "Cantidad de ganadores."
        )
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {

    const prize =
      interaction.options.getString(
        "premio"
      );

    const durationString =
      interaction.options.getString(
        "duracion"
      );

    const winners =
      interaction.options.getInteger(
        "ganadores"
      );

    const duration =
      parseDuration(
        durationString
      );

    if (!duration) {

      return interaction.reply({
        content:
          "❌ **SHIFT // INVALID DURATION**\n\n" +
          "Usa `30m`, `2h`, `1d`, etc.",
        flags: 64
      });

    }

    if (duration < 10000) {

      return interaction.reply({
        content:
          "❌ La duración mínima es de `10 segundos`.",
        flags: 64
      });

    }

    const giveawayId =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const endTime =
      Date.now() + duration;

    const embed =
      new EmbedBuilder()

        .setColor("#00ffb3")

        .setTitle(
          "🎉 SHIFT // GIVEAWAY"
        )

        .setDescription(

          `## 🎁 ${prize}\n\n` +

          `Pulsa el botón **Participar** para entrar al sorteo.\n\n` +

          `👥 **Ganadores:** ${winners}\n` +

          `⏱️ **Finaliza:** <t:${Math.floor(
            endTime / 1000
          )}:R>\n\n` +

          `**GIVEAWAY ID:** \`${giveawayId}\``

        )

        .setFooter({
          text:
            "SHIFT // COMMUNITY EVENTS"
        })

        .setTimestamp();

    const button =
      new ButtonBuilder()

        .setCustomId(
          `giveaway_join_${giveawayId}`
        )

        .setLabel(
          "Participar"
        )

        .setEmoji("🎉")

        .setStyle(
          ButtonStyle.Success
        );

    const row =
      new ActionRowBuilder()
        .addComponents(
          button
        );

    const message =
      await interaction.channel.send({

        embeds: [embed],

        components: [row]

      });

    giveaways.set(
      giveawayId,
      {
        guildId:
          interaction.guild.id,

        channelId:
          interaction.channel.id,

        messageId:
          message.id,

        prize,

        winners,

        endTime,

        participants:
          new Set()
      }
    );

    await interaction.reply({

      content:
        `✅ **SHIFT // GIVEAWAY CREATED**\n\n` +
        `ID: \`${giveawayId}\``,

      flags: 64

    });

    // ========================================================
    // END GIVEAWAY
    // ========================================================

    setTimeout(
      async () => {

        try {

          const giveaway =
            giveaways.get(
              giveawayId
            );

          if (!giveaway) {
            return;
          }

          const participants =
            [...giveaway.participants];

          const channel =
            interaction.guild.channels.cache.get(
              giveaway.channelId
            );

          if (!channel) {
            return;
          }

          if (!participants.length) {

            await channel.send(
              `🎉 **SHIFT // GIVEAWAY ENDED**\n\n` +
              `El sorteo de **${giveaway.prize}** ` +
              `terminó sin participantes.`
            );

            giveaways.delete(
              giveawayId
            );

            return;
          }

          const shuffled =
            participants.sort(
              () => Math.random() - 0.5
            );

          const selected =
            shuffled.slice(
              0,
              Math.min(
                giveaway.winners,
                shuffled.length
              )
            );

          const mentions =
            selected
              .map(
                id => `<@${id}>`
              )
              .join(", ");

          await channel.send({

            content:
              `🎉 **SHIFT // GIVEAWAY WINNER**\n\n` +
              `🎁 **Premio:** ${giveaway.prize}\n\n` +
              `🏆 **Ganador${selected.length > 1 ? "es" : ""}:** ${mentions}\n\n` +
              `\`GIVEAWAY ID: ${giveawayId}\``

          });

          giveaways.delete(
            giveawayId
          );

        } catch (error) {

          console.error(
            "SHIFT // Giveaway ending error:",
            error
          );

        }

      },

      duration

    );

  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  async handleButton(
    interaction
  ) {

    const giveawayId =
      interaction.customId.replace(
        "giveaway_join_",
        ""
      );

    const giveaway =
      giveaways.get(
        giveawayId
      );

    if (!giveaway) {

      return interaction.reply({

        content:
          "❌ Este giveaway ya terminó o no existe.",

        flags: 64

      });

    }

    if (
      giveaway.participants.has(
        interaction.user.id
      )
    ) {

      giveaway.participants.delete(
        interaction.user.id
      );

      return interaction.reply({

        content:
          "↩️ Has salido del giveaway.",

        flags: 64

      });

    }

    giveaway.participants.add(
      interaction.user.id
    );

    return interaction.reply({

      content:
        "🎉 **Participación registrada.**\n\n" +
        "¡Buena suerte!",

      flags: 64

    });

  }

};
