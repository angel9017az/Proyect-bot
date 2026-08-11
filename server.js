const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Muestra información del servidor."),

    async execute(interaction, client) {

        try {

            const guild = await client.guilds.fetch(
                process.env.GUILD_ID
            );

            if (!guild) {

                return interaction.reply({
                    content:
                        "❌ No pude encontrar el servidor configurado.",
                    flags: 64
                });

            }

            const embed = new EmbedBuilder()
                .setTitle("🌙 LAST SHIFT COMMUNITY")
                .setDescription(
                    "Información de la comunidad oficial de LAST SHIFT."
                )
                .addFields(
                    {
                        name: "👥 Members",
                        value: `${guild.memberCount ?? "Desconocido"}`,
                        inline: true
                    },
                    {
                        name: "🆔 Server ID",
                        value: guild.id,
                        inline: true
                    },
                    {
                        name: "📅 Created",
                        value:
                            `<t:${Math.floor(
                                guild.createdTimestamp / 1000
                            )}:D>`,
                        inline: true
                    }
                )
                .setFooter({
                    text: "LAST SHIFT"
                });

            await interaction.reply({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                "❌ Error obteniendo servidor:",
                error
            );

            await interaction.reply({
                content:
                    "❌ No pude acceder al servidor configurado. Revisa el GUILD_ID del .env.",
                flags: 64
            });

        }

    }

};