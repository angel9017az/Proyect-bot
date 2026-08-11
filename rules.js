const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("rules")

        .setDescription(
            "Muestra las reglas oficiales de LAST SHIFT."
        ),

    async execute(interaction) {

        const embed = new EmbedBuilder()

            .setTitle(
                "📜 LAST SHIFT — COMMUNITY RULES"
            )

            .setDescription(
                "**Reglas de la comunidad • Community Guidelines**\n\n" +
                "🇪🇸 Español • 🇺🇸 English"
            )

            .addFields(

                {
                    name: "01 — Respeto • Respect",
                    value:
                        "🇪🇸 Trata a todos los miembros con respeto. No se permite acoso, discriminación, amenazas o ataques personales.\n" +
                        "🇺🇸 Treat all members with respect. Harassment, discrimination, threats, or personal attacks are not allowed.",
                    inline: false
                },

                {
                    name: "02 — Spam",
                    value:
                        "🇪🇸 Evita el spam de mensajes, menciones, emojis o contenido repetitivo.\n" +
                        "🇺🇸 Do not spam messages, mentions, emojis, or repetitive content.",
                    inline: false
                },

                {
                    name: "03 — NSFW / Inappropriate Content",
                    value:
                        "🇪🇸 No se permite contenido NSFW, sexual, extremadamente ofensivo o inapropiado.\n" +
                        "🇺🇸 NSFW, sexual, extremely offensive, or inappropriate content is not allowed.",
                    inline: false
                },

                {
                    name: "04 — Cheats & Exploits",
                    value:
                        "🇪🇸 Está prohibido compartir, promocionar o utilizar exploits, cheats, hacks o métodos para obtener ventajas injustas.\n" +
                        "🇺🇸 Sharing, promoting, or using exploits, cheats, hacks, or unfair advantages is prohibited.",
                    inline: false
                },

                {
                    name: "05 — Spoilers",
                    value:
                        "🇪🇸 Utiliza los canales correspondientes para cualquier contenido relacionado con futuros mapas, Hunters, personajes o actualizaciones no publicadas.\n" +
                        "🇺🇸 Use the appropriate channels for unreleased maps, Hunters, characters, or upcoming updates.",
                    inline: false
                },

                {
                    name: "06 — Advertising",
                    value:
                        "🇪🇸 No publiques publicidad o invitaciones de otros servidores sin autorización del equipo.\n" +
                        "🇺🇸 Do not advertise or share invitations to other servers without staff permission.",
                    inline: false
                },

                {
                    name: "07 — Staff",
                    value:
                        "🇪🇸 Respeta las decisiones del equipo de moderación. Si consideras que existe un problema, contacta al staff de forma privada.\n" +
                        "🇺🇸 Respect moderation decisions. If you believe there is an issue, contact the staff privately.",
                    inline: false
                },

                {
                    name: "08 — Common Sense",
                    value:
                        "🇪🇸 Utiliza el sentido común. El equipo puede actuar ante situaciones perjudiciales para la comunidad aunque no estén descritas específicamente aquí.\n" +
                        "🇺🇸 Use common sense. Staff may take action against behavior that harms the community even if it is not specifically listed here.",
                    inline: false
                }

            )

            .setFooter({

                text:
                    "LAST SHIFT • Official Community Guidelines"

            })

            .setTimestamp();


        await interaction.reply({

            embeds: [
                embed
            ]

        });

    }

};