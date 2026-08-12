const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-coins')
    .setDescription('Otorga ShadowCoins a un jugador mediante su Roblox ID')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo admins
    .addStringOption(option =>
      option.setName('roblox_id')
        .setDescription('El UserId del jugador de Roblox')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de ShadowCoins a añadir')
        .setRequired(true)),

  async execute(interaction, pool) {
    const robloxId = interaction.options.getString('roblox_id');
    const cantidad = interaction.options.getInteger('cantidad');

    try {
      // Modifica o crea el registro en PostgreSQL
      const query = `
        INSERT INTO usuarios_economia (roblox_id, shadow_coins)
        VALUES ($1, $2)
        ON CONFLICT (roblox_id)
        DO UPDATE SET shadow_coins = usuarios_economia.shadow_coins + $2
        RETURNING shadow_coins;
      `;
      const res = await pool.query(query, [robloxId, cantidad]);
      const nuevoSaldo = res.rows[0].shadow_coins;

      await interaction.reply({
        content: `🪙 Se añadieron **${cantidad}** ShadowCoins a la cuenta ID \`${robloxId}\`.\nNuevo saldo: **${nuevoSaldo}** ShadowCoins.`,
        ephemeral: false
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error al actualizar la base de datos.', ephemeral: true });
    }
  },
};
