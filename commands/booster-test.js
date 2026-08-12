const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const BOOSTER_ROLE_ID =
  "1537221057134592100";

module.exports = {

  data: new SlashCommandBuilder()

    .setName("booster-test")

    .setDescription(
      "Prueba el sistema de Booster."
    )

    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription(
          "Usuario al que se aplicará la prueba."
        )
        .setRequired(true)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {

    const user =
      interaction.options.getUser(
        "usuario"
      );

    const member =
      await interaction.guild.members.fetch(
        user.id
      );

    const role =
      interaction.guild.roles.cache.get(
        BOOSTER_ROLE_ID
      );

    if (!role) {

      return interaction.reply({

        content:
          "❌ **SHIFT // ERROR**\n\n" +
          "No se encontró el rol Booster.",

        flags: 64

      });

    }

    if (
      member.roles.cache.has(
        BOOSTER_ROLE_ID
      )
    ) {

      await member.roles.remove(
        role,
        "SHIFT // Booster test removal"
      );

      return interaction.reply({

        content:
          `🧪 **SHIFT // BOOSTER TEST**\n\n` +
          `Se removió el rol Booster de ${member}.`,

        flags: 64

      });

    }

    await member.roles.add(
      role,
      "SHIFT // Booster test activation"
    );

    return interaction.reply({

      content:
        `🧪 **SHIFT // BOOSTER TEST**\n\n` +
        `Se asignó el rol Booster a ${member}.`,

      flags: 64

    });

  }

};
