const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("links")
        .setDescription(
            "Muestra los enlaces oficiales de LAST SHIFT."
        ),

    async execute(interaction) {

        // ==========================================
        // OFFICIAL LINKS
        // ==========================================

        const discordLink =
            process.env.DISCORD_LINK ||
            "https://discord.gg/XbGj2Rcfj8";

        const tiktokLink =
            process.env.TIKTOK_LINK ||
            "https://www.tiktok.com/@lastshift.oficial";


        // ==========================================
        // EMBED
        // ==========================================

        const embed = new EmbedBuilder()

            .setTitle(
                "LAST SHIFT — OFFICIAL LINKS"
            )

            .setDescription(
                "Official social and community channels for LAST SHIFT."
            )

            .addFields(

                {
                    name: "Community",
                    value:
                        `**[Official Discord](${discordLink})**`,
                    inline: false
                },

                {
                    name: "Social Media",
                    value:
                        `**[Official TikTok](${tiktokLink})**`,
                    inline: false
                }

            )

            .setFooter({
                text:
                    "LAST SHIFT • Official Community"
            })

            .setTimestamp();


        await interaction.reply({
            embeds: [embed]
        });

    }

};