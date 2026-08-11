const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("game")

        .setDescription(
            "Información oficial sobre LAST SHIFT."
        ),

    async execute(interaction) {

        const embed = new EmbedBuilder()

            .setTitle(
                "🌙 LAST SHIFT"
            )

            .setDescription(
                "**Official Game Information**\n\n" +
                "LAST SHIFT is a multiplayer survival-horror experience where every night is a fight to survive."
            )

            .addFields(

                {
                    name: "🕕 SURVIVAL",
                    value:
                        "Survive the night until **6:00 AM**.",
                    inline: true
                },

                {
                    name: "🎯 OBJECTIVES",
                    value:
                        "Complete **every required objective** before the night ends.",
                    inline: true
                },

                {
                    name: "👁️ HUNTER",
                    value:
                        "One player becomes the Hunter. Find and eliminate the Survivors before they escape.",
                    inline: false
                },

                {
                    name: "🚪 ESCAPE",
                    value:
                        "Surviving until 6:00 AM is not enough. **All objectives must be completed** before the Survivors can leave.",
                    inline: false
                },

                {
                    name: "🌲 THE NIGHT",
                    value:
                        "Explore, cooperate, complete objectives and survive the Hunter.",
                    inline: false
                }

            )

            .setFooter({

                text:
                    "LAST SHIFT • Survive until 6 AM."

            })

            .setTimestamp();


        await interaction.reply({

            embeds: [
                embed
            ]

        });

    }

};