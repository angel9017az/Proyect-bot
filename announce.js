const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("announce")

        .setDescription(
            "Publica un anuncio oficial de LAST SHIFT."
        )

        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("Título del anuncio.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Contenido del anuncio.")
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        if (!interaction.guild) {

            return interaction.reply({

                content:
                    "❌ Este comando solo puede utilizarse dentro de un servidor.",

                flags: 64

            });

        }


        const channelId =
            process.env.ANNOUNCEMENTS_CHANNEL_ID;


        if (!channelId) {

            return interaction.reply({

                content:
                    "❌ El canal de anuncios no está configurado.",

                flags: 64

            });

        }


        let channel;

        try {

            channel =
                await interaction.guild.channels.fetch(
                    channelId
                );

        } catch (error) {

            console.error(error);

            return interaction.reply({

                content:
                    "❌ No se pudo acceder al canal de anuncios.",

                flags: 64

            });

        }


        if (!channel) {

            return interaction.reply({

                content:
                    "❌ El canal configurado no existe.",

                flags: 64

            });

        }


        const title =
            interaction.options.getString(
                "title"
            );

        const message =
            interaction.options.getString(
                "message"
            );


        const embed =
            new EmbedBuilder()

                .setTitle(
                    `📢 ${title}`
                )

                .setDescription(
                    message
                )

                .setAuthor({

                    name:
                        "LAST SHIFT • Official Announcement"

                })

                .setFooter({

                    text:
                        "LAST SHIFT • Official Community"

                })

                .setTimestamp();


        try {

            await channel.send({

                embeds: [
                    embed
                ]

            });


            await interaction.reply({

                content:
                    "✅ The announcement has been published successfully.",

                flags: 64

            });


        } catch (error) {

            console.error(error);

            await interaction.reply({

                content:
                    "❌ The announcement could not be published.",

                flags: 64

            });

        }

    }

};