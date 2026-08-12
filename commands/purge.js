const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");


// ============================================================
// SHIFT // PURGE
// ============================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("purge")

        .setDescription(
            "Remove recent messages from the current channel."
        )

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription(
                    "Number of messages to remove. Maximum: 100."
                )
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),


    async execute(interaction) {

        // ====================================================
        // PERMISSION CHECK
        // ====================================================

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.ManageMessages
            )
        ) {

            return interaction.reply({

                content:
                    "**SHIFT // ACCESS DENIED**\n\n" +
                    "You do not have permission to execute this command.",

                ephemeral: true

            });

        }


        // ====================================================
        // CHANNEL CHECK
        // ====================================================

        if (
            !interaction.channel ||
            !interaction.channel.isTextBased()
        ) {

            return interaction.reply({

                content:
                    "**SHIFT // ACCESS DENIED**\n\n" +
                    "This command can only be used in a text channel.",

                ephemeral: true

            });

        }


        const amount =
            interaction.options.getInteger("amount");


        // ====================================================
        // BOT PERMISSION CHECK
        // ====================================================

        if (
            interaction.guild &&
            interaction.channel
                .permissionsFor(interaction.guild.members.me)
                ?.has(PermissionFlagsBits.ManageMessages) !== true
        ) {

            return interaction.reply({

                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "SHIFT does not have permission to manage messages in this channel.",

                ephemeral: true

            });

        }


        // ====================================================
        // DEFER
        // ====================================================

        await interaction.deferReply({
            ephemeral: true
        });


        try {

            // =================================================
            // DELETE MESSAGES
            // =================================================

            const deleted =
                await interaction.channel.bulkDelete(
                    amount,
                    true
                );


            const deletedCount =
                deleted.size;


            // =================================================
            // LOG
            // =================================================

            const logsChannelId =
                process.env.LOGS_CHANNEL_ID;


            if (logsChannelId) {

                const logsChannel =
                    interaction.guild.channels.cache.get(
                        logsChannelId
                    );


                if (
                    logsChannel &&
                    logsChannel.isTextBased()
                ) {

                    const logEmbed =
                        new EmbedBuilder()

                            .setColor(0xED4245)

                            .setTitle(
                                "SHIFT // MODERATION LOG"
                            )

                            .setDescription(
                                "Message purge executed."
                            )

                            .addFields(

                                {
                                    name: "Moderator",
                                    value: `<@${interaction.user.id}>`,
                                    inline: true
                                },

                                {
                                    name: "Channel",
                                    value: `<#${interaction.channel.id}>`,
                                    inline: true
                                },

                                {
                                    name: "Messages",
                                    value: `${deletedCount}`,
                                    inline: true
                                }

                            )

                            .setFooter({
                                text:
                                    "LAST SHIFT // SECURITY SYSTEM"
                            })

                            .setTimestamp();


                    await logsChannel.send({
                        embeds: [logEmbed]
                    });

                }

            }


            // =================================================
            // RESPONSE
            // =================================================

            const embed =
                new EmbedBuilder()

                    .setColor(0x5865F2)

                    .setTitle(
                        "SHIFT // PURGE COMPLETE"
                    )

                    .setDescription(
                        `**${deletedCount}** message(s) have been removed from this channel.`
                    )

                    .addFields({

                        name: "CHANNEL",

                        value:
                            `<#${interaction.channel.id}>`,

                        inline: true

                    })

                    .addFields({

                        name: "MODERATOR",

                        value:
                            `<@${interaction.user.id}>`,

                        inline: true

                    })

                    .setFooter({

                        text:
                            "LAST SHIFT // SECURITY SYSTEM"

                    })

                    .setTimestamp();


            await interaction.editReply({

                embeds: [
                    embed
                ]

            });


        } catch (error) {

            console.error(
                "SHIFT // Purge error:",
                error
            );


            await interaction.editReply({

                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "The requested purge could not be completed."

            });

        }

    }

};
