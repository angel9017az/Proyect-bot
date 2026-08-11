const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Publica una actualización oficial de LAST SHIFT.")

        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("Título de la actualización.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("subtitle")
                .setDescription("Subtítulo de la actualización.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("content")
                .setDescription("Contenido de la actualización.")
                .setRequired(true)
        )

        .addAttachmentOption(option =>
            option
                .setName("image")
                .setDescription("Imagen de la actualización. Opcional.")
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        // ============================================
        // PERMISSIONS
        // ============================================

        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content:
                    "**SHIFT // ACCESS DENIED**\n\n" +
                    "You are not authorized to publish updates.",
                flags: 64
            });
        }

        // ============================================
        // CHANNEL
        // ============================================

        const channelId =
            process.env.ANNOUNCEMENTS_CHANNEL_ID;

        if (!channelId) {
            console.error(
                "SHIFT // ANNOUNCEMENTS_CHANNEL_ID is missing from .env"
            );

            return interaction.reply({
                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "The announcements channel is not configured.",
                flags: 64
            });
        }

        let channel;

        try {
            channel =
                await interaction.client.channels.fetch(
                    channelId
                );
        } catch (error) {
            console.error(
                "SHIFT // Channel fetch error:",
                error
            );

            return interaction.reply({
                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "The announcements channel could not be accessed.",
                flags: 64
            });
        }

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "The configured announcements channel is invalid.",
                flags: 64
            });
        }

        // ============================================
        // OPTIONS
        // ============================================

        const title =
            interaction.options.getString("title");

        const subtitle =
            interaction.options.getString("subtitle");

        const content =
            interaction.options.getString("content");

        const image =
            interaction.options.getAttachment("image");

        // ============================================
        // IMAGE VALIDATION
        // ============================================

        if (image) {

            if (
                !image.contentType ||
                !image.contentType.startsWith("image/")
            ) {
                return interaction.reply({
                    content:
                        "**SHIFT // INVALID IMAGE**\n\n" +
                        "The selected attachment must be an image.",
                    flags: 64
                });
            }

        }

        // ============================================
        // EMBED
        // ============================================

        const embed =
            new EmbedBuilder()
                .setColor("#8B0000")
                .setAuthor({
                    name: "LAST SHIFT // SECURITY SYSTEM"
                })
                .setTitle(title)
                .setDescription(
                    `**${subtitle}**\n\n` +
                    `${content}`
                )
                .setFooter({
                    text: "LAST SHIFT // UPDATE"
                })
                .setTimestamp();

        // ============================================
        // EMBED IMAGE
        // ============================================

        if (image) {

            embed.setImage(
                `attachment://${image.name}`
            );

        }

        // ============================================
        // MESSAGE
        // ============================================

        const messageData = {
            embeds: [embed]
        };

        // ============================================
        // ATTACH IMAGE TO SAME MESSAGE
        // ============================================

        if (image) {

            messageData.files = [
                {
                    attachment: image.url,
                    name: image.name
                }
            ];

        }

        // ============================================
        // PUBLISH
        // ============================================

        try {

            await channel.send(
                messageData
            );

            await interaction.reply({
                content:
                    "**SHIFT // UPDATE PUBLISHED**\n\n" +
                    "The update has been successfully published.",
                flags: 64
            });

        } catch (error) {

            console.error(
                "SHIFT // Update publication error:",
                error
            );

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                return interaction.followUp({
                    content:
                        "**SHIFT // SYSTEM ERROR**\n\n" +
                        "The update could not be published.",
                    flags: 64
                });
            }

            return interaction.reply({
                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "The update could not be published.",
                flags: 64
            });
        }
    }
};