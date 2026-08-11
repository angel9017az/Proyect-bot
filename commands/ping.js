const {
    SlashCommandBuilder
} = require("discord.js");


module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("ping")

            .setDescription(
                "Comprueba si SHIFT está funcionando."
            ),


    async execute(interaction) {

        const sent =
            await interaction.reply({

                content:
                    "🌙 Calculando latencia...",

                fetchReply: true

            });


        const latency =
            sent.createdTimestamp -
            interaction.createdTimestamp;


        await interaction.editReply(

`🏓 **PONG!**

🤖 Bot: \`${latency}ms\`
🌐 Discord: \`${interaction.client.ws.ping}ms\``

        );

    }

};