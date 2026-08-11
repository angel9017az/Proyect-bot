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

const reportsFile =
    path.join(dataDirectory, "reports.json");


// ==================================================
// CREATE DATA DIRECTORY
// ==================================================

if (!fs.existsSync(dataDirectory)) {

    fs.mkdirSync(dataDirectory, {
        recursive: true
    });

}


// ==================================================
// CREATE DATA FILE
// ==================================================

if (!fs.existsSync(reportsFile)) {

    fs.writeFileSync(
        reportsFile,
        JSON.stringify(
            {
                nextId: 1,
                reports: {}
            },
            null,
            4
        )
    );

}


// ==================================================
// LOAD DATA
// ==================================================

function loadData() {

    try {

        return JSON.parse(
            fs.readFileSync(
                reportsFile,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Error reading reports.json:",
            error
        );

        return {
            nextId: 1,
            reports: {}
        };

    }

}


// ==================================================
// SAVE DATA
// ==================================================

function saveData(data) {

    fs.writeFileSync(
        reportsFile,
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

const reportStatuses = {

    PENDING: {
        emoji: "🟡",
        en: "PENDING",
        es: "PENDIENTE"
    },

    INVESTIGATING: {
        emoji: "🔵",
        en: "INVESTIGATING",
        es: "INVESTIGANDO"
    },

    VALID: {
        emoji: "🟢",
        en: "VALID",
        es: "VÁLIDO"
    },

    INVALID: {
        emoji: "🔴",
        en: "INVALID",
        es: "INVÁLIDO"
    },

    RESOLVED: {
        emoji: "⚫",
        en: "RESOLVED",
        es: "RESUELTO"
    }

};


// ==================================================
// STATUS MESSAGES
// ==================================================

const statusMessages = {

    PENDING: {

        en:
            "Your report has been submitted and is waiting for review by the moderation team.",

        es:
            "Tu reporte ha sido enviado y está esperando revisión por parte del equipo de moderación."

    },

    INVESTIGATING: {

        en:
            "Your report is currently being investigated by the moderation team.",

        es:
            "Tu reporte está siendo investigado actualmente por el equipo de moderación."

    },

    VALID: {

        en:
            "Your report has been reviewed and was determined to be valid.",

        es:
            "Tu reporte ha sido revisado y se determinó que es válido."

    },

    INVALID: {

        en:
            "Your report has been reviewed and was determined to be invalid.",

        es:
            "Tu reporte ha sido revisado y se determinó que no es válido."

    },

    RESOLVED: {

        en:
            "Your report has been resolved by the moderation team.",

        es:
            "Tu reporte ha sido resuelto por el equipo de moderación."

    }

};


// ==================================================
// CREATE REPORT EMBED
// ==================================================

function createReportEmbed(report) {

    const status =
        reportStatuses[
            report.status
        ] ||
        reportStatuses.PENDING;


    return new EmbedBuilder()

        .setTitle(
            `LAST SHIFT — PLAYER REPORT #${String(
                report.id
            ).padStart(4, "0")}`
        )

        .setDescription(
            report.description
        )

        .addFields(

            {
                name:
                    "Reported Player / Jugador Reportado",

                value:
                    `\`${report.username}\``,

                inline: true
            },

            {
                name:
                    "Reported By / Reportado Por",

                value:
                    `<@${report.userId}>`,

                inline: true
            },

            {
                name:
                    "Reason / Motivo",

                value:
                    report.reason,

                inline: false
            },

            {
                name:
                    "Evidence / Evidencia",

                value:
                    report.evidence ||
                    "Not provided / No proporcionada",

                inline: false
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
                    "Submitted / Enviado",

                value:
                    `<t:${Math.floor(
                        report.createdAt / 1000
                    )}:F>`,

                inline: true
            }

        )

        .setFooter({

            text:
                "LAST SHIFT • Moderation System / Sistema de Moderación"

        })

        .setTimestamp();

}


// ==================================================
// STAFF BUTTONS
// ==================================================

function createStaffButtons(reportId) {

    return [

        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `report_status_${reportId}_INVESTIGATING`
                    )

                    .setLabel(
                        "Investigating / Investigando"
                    )

                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        `report_status_${reportId}_VALID`
                    )

                    .setLabel(
                        "Valid / Válido"
                    )

                    .setStyle(
                        ButtonStyle.Success
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        `report_status_${reportId}_INVALID`
                    )

                    .setLabel(
                        "Invalid / Inválido"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    )

            ),

        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `report_status_${reportId}_RESOLVED`
                    )

                    .setLabel(
                        "Resolved / Resuelto"
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
    report,
    newStatus
) {

    const status =
        reportStatuses[
            newStatus
        ];

    const message =
        statusMessages[
            newStatus
        ];


    if (!status || !message) {
        return false;
    }


    try {

        const user =
            await client.users.fetch(
                report.userId
            );


        const embed =

            new EmbedBuilder()

                .setTitle(
                    `LAST SHIFT — REPORT #${String(
                        report.id
                    ).padStart(4, "0")}`
                )

                .setDescription(

                    `${status.emoji} **${status.en} / ${status.es}**\n\n` +

                    `🇺🇸 ${message.en}\n\n` +

                    `🇪🇸 ${message.es}`

                )

                .addFields({

                    name:
                        "Reported Player / Jugador Reportado",

                    value:
                        `\`${report.username}\``

                })

                .setFooter({

                    text:
                        "LAST SHIFT • Moderation System"

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
            `⚠️ Could not send report DM to ${report.userId}:`,
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

            .setName(
                "report"
            )

            .setDescription(
                "Manage the official player report system."
            )

            .addSubcommand(
                subcommand =>
                    subcommand

                        .setName(
                            "panel"
                        )

                        .setDescription(
                            "Publish the official player report panel."
                        )
            ),


    // ==================================================
    // EXECUTE
    // ==================================================

    async execute(interaction) {

        // ==================================================
        // ADMIN CHECK
        // ==================================================

        if (
            !interaction.memberPermissions ||
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({

                content:
                    "❌ You do not have permission to manage the report system.\n" +
                    "❌ No tienes permiso para administrar el sistema de reportes.",

                flags: 64

            });

        }


        // ==================================================
        // CHANNEL
        // ==================================================

        const channelId =
            process.env.REPORTS_CHANNEL_ID;


        if (!channelId) {

            return interaction.reply({

                content:
                    "❌ The reports channel is not configured.\n" +
                    "❌ El canal de reportes no está configurado.",

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
                "❌ Error fetching reports channel:",
                error
            );

            return interaction.reply({

                content:
                    "❌ The configured reports channel could not be accessed.\n" +
                    "❌ No se pudo acceder al canal de reportes configurado.",

                flags: 64

            });

        }


        if (!channel) {

            return interaction.reply({

                content:
                    "❌ The reports channel does not exist.\n" +
                    "❌ El canal de reportes no existe.",

                flags: 64

            });

        }


        // ==================================================
        // PANEL
        // ==================================================

        const embed =

            new EmbedBuilder()

                .setTitle(
                    "LAST SHIFT — PLAYER REPORTS"
                )

                .setDescription(

                    "🇺🇸 **Found a player violating the rules?**\n" +
                    "Use the button below to submit a report. Every report will be reviewed by the moderation team.\n\n" +

                    "🇪🇸 **¿Encontraste a un jugador incumpliendo las reglas?**\n" +
                    "Utiliza el botón de abajo para enviar un reporte. Cada reporte será revisado por el equipo de moderación."

                )

                .addFields({

                    name:
                        "Important / Importante",

                    value:

                        "🇺🇸 Please provide accurate information. False or abusive reports may result in moderation action.\n\n" +

                        "🇪🇸 Proporciona información precisa. Los reportes falsos o abusivos pueden resultar en acciones de moderación."

                })

                .setFooter({

                    text:
                        "LAST SHIFT • Official Reports / Reportes Oficiales"

                });


        const row =

            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "open_report_modal"
                        )

                        .setLabel(
                            "Submit Report / Enviar Reporte"
                        )

                        .setStyle(
                            ButtonStyle.Danger
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
                "✅ Report panel published successfully.\n" +
                "✅ Panel de reportes publicado correctamente.",

            flags: 64

        });

    },


    // ==================================================
    // BUTTON HANDLER
    // ==================================================

    async handleButton(interaction) {

        if (
            interaction.customId !==
            "open_report_modal"
        ) {
            return false;
        }


        // ==================================================
        // MODAL
        // ==================================================

        const modal =

            new ModalBuilder()

                .setCustomId(
                    "report_modal"
                )

                .setTitle(
                    "LAST SHIFT — Report / Reporte"
                );


        // ==================================================
        // USERNAME
        // ==================================================

        const usernameInput =

            new TextInputBuilder()

                .setCustomId(
                    "report_username"
                )

                .setLabel(
                    "Username / Usuario"
                )

                .setPlaceholder(
                    "Enter the reported player's username"
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


        // ==================================================
        // REASON
        // ==================================================

        const reasonInput =

            new TextInputBuilder()

                .setCustomId(
                    "report_reason"
                )

                .setLabel(
                    "Reason / Motivo"
                )

                .setPlaceholder(
                    "Example: Exploiting, harassment, cheating..."
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setMaxLength(
                    200
                )

                .setRequired(
                    true
                );


        // ==================================================
        // DESCRIPTION
        // ==================================================

        const descriptionInput =

            new TextInputBuilder()

                .setCustomId(
                    "report_description"
                )

                .setLabel(
                    "Description / Descripción"
                )

                .setPlaceholder(
                    "Explain what happened in detail."
                )

                .setStyle(
                    TextInputStyle.Paragraph
                )

                .setMaxLength(
                    1500
                )

                .setRequired(
                    true
                );


        // ==================================================
        // EVIDENCE
        // ==================================================

        const evidenceInput =

            new TextInputBuilder()

                .setCustomId(
                    "report_evidence"
                )

                .setLabel(
                    "Evidence / Evidencia"
                )

                .setPlaceholder(
                    "Optional: image, video or other evidence link."
                )

                .setStyle(
                    TextInputStyle.Paragraph
                )

                .setMaxLength(
                    1000
                )

                .setRequired(
                    false
                );


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    usernameInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    reasonInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    descriptionInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    evidenceInput
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
            "report_modal"
        ) {
            return false;
        }


        // ==================================================
        // CHANNEL
        // ==================================================

        const channelId =
            process.env.DEV_REPORTS_CHANNEL_ID;


        if (!channelId) {

            return interaction.reply({

                content:
                    "❌ The development reports channel is not configured.\n" +
                    "❌ El canal de reportes para desarrolladores no está configurado.",

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
                "❌ Error fetching development reports channel:",
                error
            );

            return interaction.reply({

                content:
                    "❌ The development reports channel could not be accessed.\n" +
                    "❌ No se pudo acceder al canal de reportes para desarrolladores.",

                flags: 64

            });

        }


        if (!channel) {

            return interaction.reply({

                content:
                    "❌ The development reports channel does not exist.\n" +
                    "❌ El canal de reportes para desarrolladores no existe.",

                flags: 64

            });

        }


        // ==================================================
        // FORM DATA
        // ==================================================

        const username =
            interaction.fields.getTextInputValue(
                "report_username"
            );

        const reason =
            interaction.fields.getTextInputValue(
                "report_reason"
            );

        const description =
            interaction.fields.getTextInputValue(
                "report_description"
            );

        const evidence =
            interaction.fields.getTextInputValue(
                "report_evidence"
            ) ||
            "";


        // ==================================================
        // LOAD DATA
        // ==================================================

        const data =
            loadData();


        const reportId =
            data.nextId;


        data.nextId++;


        // ==================================================
        // CREATE REPORT
        // ==================================================

        const report = {

            id:
                reportId,

            userId:
                interaction.user.id,

            username:
                username,

            reason:
                reason,

            description:
                description,

            evidence:
                evidence,

            status:
                "PENDING",

            createdAt:
                Date.now()

        };


        data.reports[
            reportId
        ] = report;


        saveData(
            data
        );


        // ==================================================
        // CREATE EMBED
        // ==================================================

        const embed =
            createReportEmbed(
                report
            );


        // ==================================================
        // SEND TO STAFF
        // ==================================================

        try {

            await channel.send({

                embeds: [
                    embed
                ],

                components:
                    createStaffButtons(
                        reportId
                    )

            });

        } catch (error) {

            console.error(
                "❌ Error sending report:",
                error
            );

            return interaction.reply({

                content:
                    "❌ Your report could not be submitted.\n" +
                    "❌ No se pudo enviar tu reporte.",

                flags: 64

            });

        }


        // ==================================================
        // INITIAL DM
        // ==================================================

        await sendStatusDM(
            interaction.client,
            report,
            "PENDING"
        );


        // ==================================================
        // CONFIRMATION
        // ==================================================

        await interaction.reply({

            content:

                `✅ **Report #${String(
                    reportId
                ).padStart(4, "0")} submitted successfully.**\n` +

                `🇪🇸 Tu reporte ha sido enviado correctamente al equipo de moderación.\n\n` +

                `🇺🇸 You will receive a DM whenever the status of your report changes.\n` +

                `🇪🇸 Recibirás un mensaje privado cada vez que cambie el estado de tu reporte.`,

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
                "report_status_"
            )
        ) {
            return false;
        }


        // ==================================================
        // ADMIN CHECK
        // ==================================================

        if (
            !interaction.memberPermissions ||
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            await interaction.reply({

                content:
                    "❌ You do not have permission to manage reports.\n" +
                    "❌ No tienes permiso para administrar reportes.",

                flags: 64

            });

            return true;

        }


        // ==================================================
        // PARSE BUTTON
        // ==================================================

        const parts =
            interaction.customId.split("_");


        const reportId =
            Number(
                parts[2]
            );


        const newStatus =
            parts
                .slice(3)
                .join("_");


        // ==================================================
        // LOAD DATA
        // ==================================================

        const data =
            loadData();


        const report =
            data.reports[
                reportId
            ];


        if (!report) {

            await interaction.reply({

                content:
                    "❌ This report could not be found.\n" +
                    "❌ No se pudo encontrar este reporte.",

                flags: 64

            });

            return true;

        }


        if (
            !reportStatuses[
                newStatus
            ]
        ) {

            await interaction.reply({

                content:
                    "❌ Invalid report status.\n" +
                    "❌ Estado de reporte inválido.",

                flags: 64

            });

            return true;

        }


        // ==================================================
        // UPDATE
        // ==================================================

        report.status =
            newStatus;

        report.updatedAt =
            Date.now();

        report.updatedBy =
            interaction.user.id;


        saveData(
            data
        );


        // ==================================================
        // UPDATE STAFF MESSAGE
        // ==================================================

        const embed =
            createReportEmbed(
                report
            );


        await interaction.update({

            embeds: [
                embed
            ],

            components:
                createStaffButtons(
                    reportId
                )

        });


        // ==================================================
        // DM REPORTER
        // ==================================================

        const dmSent =
            await sendStatusDM(
                interaction.client,
                report,
                newStatus
            );


        console.log(

            `📋 Report #${String(
                reportId
            ).padStart(4, "0")} changed to ${newStatus}. ` +

            `DM ${dmSent ? "sent" : "failed"}.`

        );


        return true;

    }

};