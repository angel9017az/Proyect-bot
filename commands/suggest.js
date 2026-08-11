const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");


// ==================================================
// DATA
// ==================================================

const dataDirectory =
    path.join(__dirname, "..", "data");

const suggestionsFile =
    path.join(dataDirectory, "suggestions.json");


if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
        recursive: true
    });
}


if (!fs.existsSync(suggestionsFile)) {

    fs.writeFileSync(
        suggestionsFile,
        JSON.stringify(
            {
                nextId: 1,
                suggestions: {}
            },
            null,
            4
        )
    );

}


// ==================================================
// DATA FUNCTIONS
// ==================================================

function loadData() {

    try {

        return JSON.parse(
            fs.readFileSync(
                suggestionsFile,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Error reading suggestions.json:",
            error
        );

        return {
            nextId: 1,
            suggestions: {}
        };

    }

}


function saveData(data) {

    fs.writeFileSync(
        suggestionsFile,
        JSON.stringify(
            data,
            null,
            4
        )
    );

}


// ==================================================
// STATUS
// ==================================================

const suggestionStatuses = {

    PENDING: {
        emoji: "🟡",
        en: "PENDING",
        es: "PENDIENTE"
    },

    CONSIDERING: {
        emoji: "🔵",
        en: "CONSIDERING",
        es: "EN CONSIDERACIÓN"
    },

    IN_DEVELOPMENT: {
        emoji: "🟠",
        en: "IN DEVELOPMENT",
        es: "EN DESARROLLO"
    },

    ACCEPTED: {
        emoji: "🟢",
        en: "ACCEPTED",
        es: "ACEPTADA"
    },

    REJECTED: {
        emoji: "🔴",
        en: "REJECTED",
        es: "RECHAZADA"
    },

    IMPLEMENTED: {
        emoji: "⚫",
        en: "IMPLEMENTED",
        es: "IMPLEMENTADA"
    }

};


// ==================================================
// STATUS DESCRIPTION
// ==================================================

const statusMessages = {

    PENDING: {

        en:
            "Your suggestion has been submitted and is waiting for review by the development team.",

        es:
            "Tu sugerencia ha sido enviada y está esperando revisión por parte del equipo de desarrollo."

    },

    CONSIDERING: {

        en:
            "Your suggestion is currently being considered by the development team.",

        es:
            "Tu sugerencia está siendo considerada actualmente por el equipo de desarrollo."

    },

    IN_DEVELOPMENT: {

        en:
            "Your suggestion has entered the development process.",

        es:
            "Tu sugerencia ha entrado en el proceso de desarrollo."

    },

    ACCEPTED: {

        en:
            "Your suggestion has been accepted by the development team.",

        es:
            "Tu sugerencia ha sido aceptada por el equipo de desarrollo."

    },

    REJECTED: {

        en:
            "Your suggestion has been reviewed and rejected by the development team.",

        es:
            "Tu sugerencia ha sido revisada y rechazada por el equipo de desarrollo."

    },

    IMPLEMENTED: {

        en:
            "Your suggestion has been implemented into LAST SHIFT.",

        es:
            "Tu sugerencia ha sido implementada en LAST SHIFT."

    }

};


// ==================================================
// CREATE EMBED
// ==================================================

function createSuggestionEmbed(suggestion) {

    const status =
        suggestionStatuses[
            suggestion.status
        ] ||
        suggestionStatuses.PENDING;


    return new EmbedBuilder()

        .setTitle(
            `LAST SHIFT — SUGGESTION #${String(
                suggestion.id
            ).padStart(4, "0")}`
        )

        .setDescription(
            `**${suggestion.title}**\n\n${suggestion.description}`
        )

        .addFields(

            {
                name:
                    "Submitted By / Enviada por",

                value:
                    `<@${suggestion.userId}>`,

                inline: true
            },

            {
                name:
                    "Status / Estado",

                value:
                    `${status.emoji} **${status.en}**\n${status.es}`,

                inline: true
            },

            {
                name:
                    "Submitted / Enviada",

                value:
                    `<t:${Math.floor(
                        suggestion.createdAt / 1000
                    )}:F>`,

                inline: false
            }

        )

        .setFooter({

            text:
                "LAST SHIFT • Development Feedback / Retroalimentación de Desarrollo"

        })

        .setTimestamp();

}


// ==================================================
// DEVELOPER BUTTONS
// ==================================================

function createDeveloperButtons(
    suggestionId
) {

    return [

        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `suggest_status_${suggestionId}_CONSIDERING`
                    )

                    .setLabel(
                        "Considering / En consideración"
                    )

                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        `suggest_status_${suggestionId}_IN_DEVELOPMENT`
                    )

                    .setLabel(
                        "In Development / En desarrollo"
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        `suggest_status_${suggestionId}_ACCEPTED`
                    )

                    .setLabel(
                        "Accept / Aceptar"
                    )

                    .setStyle(
                        ButtonStyle.Success
                    )

            ),

        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `suggest_status_${suggestionId}_REJECTED`
                    )

                    .setLabel(
                        "Reject / Rechazar"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        `suggest_status_${suggestionId}_IMPLEMENTED`
                    )

                    .setLabel(
                        "Implemented / Implementada"
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    )

            )

    ];

}


// ==================================================
// SEND USER DM
// ==================================================

async function sendStatusDM(
    client,
    suggestion,
    newStatus
) {

    const status =
        suggestionStatuses[
            newStatus
        ];

    const message =
        statusMessages[
            newStatus
        ];


    if (!status || !message) {
        return;
    }


    try {

        const user =
            await client.users.fetch(
                suggestion.userId
            );


        const embed =
            new EmbedBuilder()

                .setTitle(
                    `LAST SHIFT — SUGGESTION #${String(
                        suggestion.id
                    ).padStart(4, "0")}`
                )

                .setDescription(

                    `${status.emoji} **${status.en} / ${status.es}**\n\n` +

                    `🇺🇸 ${message.en}\n\n` +

                    `🇪🇸 ${message.es}`

                )

                .addFields({

                    name:
                        "Suggestion / Sugerencia",

                    value:
                        suggestion.title

                })

                .setFooter({

                    text:
                        "LAST SHIFT • Development Feedback"

                })

                .setTimestamp();


        await user.send({

            embeds: [
                embed
            ]

        });


        return true;

    } catch (error) {

        console.warn(
            `⚠️ Could not send DM to user ${suggestion.userId}.`,
            error.message
        );

        return false;

    }

}


// ==================================================
// COMMAND
// ==================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("suggest")

            .setDescription(
                "Manage the official suggestion system."
            )

            .addSubcommand(
                subcommand =>
                    subcommand

                        .setName("panel")

                        .setDescription(
                            "Publish the official suggestion panel."
                        )
            ),


    // ==================================================
    // EXECUTE
    // ==================================================

    async execute(interaction) {

        if (
            !interaction.memberPermissions ||
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({

                content:
                    "❌ You do not have permission to manage the suggestion system.\n" +
                    "❌ No tienes permiso para administrar el sistema de sugerencias.",

                flags: 64

            });

        }


        const channelId =
            process.env.SUGGESTIONS_CHANNEL_ID;


        if (!channelId) {

            return interaction.reply({

                content:
                    "❌ The suggestions channel is not configured.\n" +
                    "❌ El canal de sugerencias no está configurado.",

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

            console.error(
                "❌ Error fetching suggestions channel:",
                error
            );

            return interaction.reply({

                content:
                    "❌ The configured suggestions channel could not be accessed.\n" +
                    "❌ No se pudo acceder al canal de sugerencias configurado.",

                flags: 64

            });

        }


        const embed =

            new EmbedBuilder()

                .setTitle(
                    "LAST SHIFT — COMMUNITY SUGGESTIONS"
                )

                .setDescription(

                    "🇺🇸 **Have an idea that could improve LAST SHIFT?**\n" +
                    "Submit your suggestion using the button below. Every submission will be reviewed by the development team.\n\n" +

                    "🇪🇸 **¿Tienes una idea que podría mejorar LAST SHIFT?**\n" +
                    "Envía tu sugerencia utilizando el botón de abajo. Cada propuesta será revisada por el equipo de desarrollo."

                )

                .addFields({

                    name:
                        "Community Feedback / Opiniones de la Comunidad",

                    value:
                        "🇺🇸 Your feedback helps shape the future of LAST SHIFT.\n" +
                        "🇪🇸 Tus comentarios ayudan a construir el futuro de LAST SHIFT."

                })

                .setFooter({

                    text:
                        "LAST SHIFT • Official Suggestions / Sugerencias Oficiales"

                });


        const row =

            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "open_suggestion_modal"
                        )

                        .setLabel(
                            "Submit Suggestion / Enviar Sugerencia"
                        )

                        .setStyle(
                            ButtonStyle.Primary
                        )

                );


        await channel.send({

            embeds: [
                embed
            ],

            components: [
                row
            ]

        });


        await interaction.reply({

            content:
                "✅ Suggestion panel published successfully.\n" +
                "✅ Panel de sugerencias publicado correctamente.",

            flags: 64

        });

    },


    // ==================================================
    // BUTTON HANDLER
    // ==================================================

    async handleButton(interaction) {

        if (
            interaction.customId !==
            "open_suggestion_modal"
        ) {
            return false;
        }


        const modal =

            new ModalBuilder()

                .setCustomId(
                    "suggestion_modal"
                )

                .setTitle(
                    "LAST SHIFT — Suggestion / Sugerencia"
                );


        const titleInput =

            new TextInputBuilder()

                .setCustomId(
                    "suggestion_title"
                )

                .setLabel(
                    "Title / Título"
                )

                .setPlaceholder(
                    "Briefly describe your idea / Describe brevemente tu idea"
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setMaxLength(
                    100
                )

                .setRequired(
                    true
                );


        const descriptionInput =

            new TextInputBuilder()

                .setCustomId(
                    "suggestion_description"
                )

                .setLabel(
                    "Description / Descripción"
                )

                .setPlaceholder(
                    "Explain your suggestion in detail / Explica tu sugerencia en detalle"
                )

                .setStyle(
                    TextInputStyle.Paragraph
                )

                .setMaxLength(
                    2000
                )

                .setRequired(
                    true
                );


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    titleInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    descriptionInput
                )

        );


        await interaction.showModal(
            modal
        );

        return true;

    },


    // ==================================================
    // MODAL HANDLER
    // ==================================================

    async handleModal(interaction) {

        if (
            interaction.customId !==
            "suggestion_modal"
        ) {
            return false;
        }


        const channelId =
            process.env.DEV_SUGGESTIONS_CHANNEL_ID;


        if (!channelId) {

            return interaction.reply({

                content:
                    "❌ The development suggestions channel is not configured.\n" +
                    "❌ El canal de sugerencias para desarrolladores no está configurado.",

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

            console.error(
                "❌ Error fetching development suggestions channel:",
                error
            );

            return interaction.reply({

                content:
                    "❌ The development suggestions channel could not be accessed.\n" +
                    "❌ No se pudo acceder al canal de sugerencias para desarrolladores.",

                flags: 64

            });

        }


        const title =
            interaction.fields.getTextInputValue(
                "suggestion_title"
            );

        const description =
            interaction.fields.getTextInputValue(
                "suggestion_description"
            );


        const data =
            loadData();


        const suggestionId =
            data.nextId;


        data.nextId++;


        const suggestion = {

            id:
                suggestionId,

            userId:
                interaction.user.id,

            title:
                title,

            description:
                description,

            status:
                "PENDING",

            createdAt:
                Date.now()

        };


        data.suggestions[
            suggestionId
        ] = suggestion;


        saveData(
            data
        );


        const embed =
            createSuggestionEmbed(
                suggestion
            );


        try {

            await channel.send({

                embeds: [
                    embed
                ],

                components:
                    createDeveloperButtons(
                        suggestionId
                    )

            });

        } catch (error) {

            console.error(
                "❌ Error sending suggestion:",
                error
            );

            return interaction.reply({

                content:
                    "❌ Your suggestion could not be submitted.\n" +
                    "❌ No se pudo enviar tu sugerencia.",

                flags: 64

            });

        }


        // ==================================================
        // INITIAL DM
        // ==================================================

        await sendStatusDM(
            interaction.client,
            suggestion,
            "PENDING"
        );


        await interaction.reply({

            content:

                `✅ **Suggestion #${String(
                    suggestionId
                ).padStart(4, "0")} submitted successfully.**\n` +

                `🇪🇸 Tu sugerencia ha sido enviada correctamente al equipo de desarrollo.\n\n` +

                `🇺🇸 You will receive a DM whenever the status of your suggestion changes.\n` +

                `🇪🇸 Recibirás un mensaje privado cada vez que cambie el estado de tu sugerencia.`,

            flags: 64

        });


        return true;

    },


    // ==================================================
    // STATUS BUTTON HANDLER
    // ==================================================

    async handleStatusButton(interaction) {

        if (
            !interaction.customId.startsWith(
                "suggest_status_"
            )
        ) {
            return false;
        }


        if (
            !interaction.memberPermissions ||
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            await interaction.reply({

                content:
                    "❌ You do not have permission to manage suggestions.\n" +
                    "❌ No tienes permiso para administrar sugerencias.",

                flags: 64

            });

            return true;

        }


        const parts =
            interaction.customId.split("_");


        const suggestionId =
            Number(
                parts[2]
            );


        const newStatus =
            parts
                .slice(3)
                .join("_");


        const data =
            loadData();


        const suggestion =
            data.suggestions[
                suggestionId
            ];


        if (!suggestion) {

            await interaction.reply({

                content:
                    "❌ This suggestion could not be found.\n" +
                    "❌ No se pudo encontrar esta sugerencia.",

                flags: 64

            });

            return true;

        }


        if (
            !suggestionStatuses[
                newStatus
            ]
        ) {

            await interaction.reply({

                content:
                    "❌ Invalid suggestion status.\n" +
                    "❌ Estado de sugerencia inválido.",

                flags: 64

            });

            return true;

        }


        // ==================================================
        // UPDATE
        // ==================================================

        suggestion.status =
            newStatus;

        suggestion.updatedAt =
            Date.now();

        suggestion.updatedBy =
            interaction.user.id;


        saveData(
            data
        );


        // ==================================================
        // UPDATE DEV MESSAGE
        // ==================================================

        const embed =
            createSuggestionEmbed(
                suggestion
            );


        await interaction.update({

            embeds: [
                embed
            ],

            components:
                createDeveloperButtons(
                    suggestionId
                )

        });


        // ==================================================
        // DM USER
        // ==================================================

        const dmSent =
            await sendStatusDM(
                interaction.client,
                suggestion,
                newStatus
            );


        // ==================================================
        // STAFF LOG
        // ==================================================

        console.log(

            `📋 Suggestion #${String(
                suggestionId
            ).padStart(4, "0")} changed to ${newStatus}. ` +

            `DM ${dmSent ? "sent" : "failed"}.`

        );


        return true;

    }

};