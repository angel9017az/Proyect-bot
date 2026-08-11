const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");


// ==================================================
// STATUS FILE
// ==================================================

const dataDirectory = path.join(__dirname, "..", "data");
const statusFile = path.join(dataDirectory, "status.json");


// ==================================================
// CREATE DATA FOLDER
// ==================================================

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
        recursive: true
    });
}


// ==================================================
// CREATE STATUS FILE
// ==================================================

if (!fs.existsSync(statusFile)) {

    fs.writeFileSync(
        statusFile,
        JSON.stringify(
            {
                state: "In Development",
                target: "game"
            },
            null,
            4
        )
    );

}


// ==================================================
// LOAD STATUS
// ==================================================

function loadStatus() {

    try {

        return JSON.parse(
            fs.readFileSync(
                statusFile,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Error reading status.json:",
            error
        );

        return {
            state: "In Development",
            target: "game"
        };

    }

}


// ==================================================
// SAVE STATUS
// ==================================================

function saveStatus(data) {

    fs.writeFileSync(
        statusFile,
        JSON.stringify(
            data,
            null,
            4
        )
    );

}


// ==================================================
// STATUS INFORMATION
// ==================================================

const statuses = {

    "Operational": {
        emoji: "🟢"
    },

    "In Development": {
        emoji: "🟡"
    },

    "Maintenance": {
        emoji: "🟠"
    },

    "Offline": {
        emoji: "🔴"
    },

    "Coming Soon": {
        emoji: "⚫"
    }

};


// ==================================================
// TARGET INFORMATION
// ==================================================

const targets = {

    bot: {
        name: "SHIFT",
        description: "the official LAST SHIFT Discord bot"
    },

    game: {
        name: "LAST SHIFT",
        description: "the LAST SHIFT game"
    },

    server: {
        name: "LAST SHIFT Community",
        description: "the official LAST SHIFT Discord community"
    }

};


// ==================================================
// AUTOMATIC MESSAGES
// ==================================================

function generateMessage(state, target) {

    if (state === "Operational") {

        if (target === "bot") {
            return "SHIFT is currently operational and all major services are available.";
        }

        if (target === "game") {
            return "LAST SHIFT is currently operational and available to players.";
        }

        return "LAST SHIFT Community is currently operational and community services are available.";
    }


    if (state === "In Development") {

        if (target === "bot") {
            return "SHIFT is currently under active development. New features and improvements are being implemented.";
        }

        if (target === "game") {
            return "LAST SHIFT is currently under active development. New content, features, and improvements are being implemented.";
        }

        return "LAST SHIFT Community is currently undergoing development and improvements.";
    }


    if (state === "Maintenance") {

        if (target === "bot") {
            return "SHIFT is currently undergoing scheduled maintenance. Some bot functions may be temporarily unavailable.";
        }

        if (target === "game") {
            return "LAST SHIFT is currently undergoing maintenance. The game may be temporarily unavailable during this period.";
        }

        return "LAST SHIFT Community is currently undergoing scheduled maintenance. Some community services may be temporarily unavailable.";
    }


    if (state === "Offline") {

        if (target === "bot") {
            return "SHIFT is currently offline. Bot services are temporarily unavailable.";
        }

        if (target === "game") {
            return "LAST SHIFT is currently unavailable. Please wait for further information from the development team.";
        }

        return "LAST SHIFT Community is currently unavailable. Please wait for further information from the staff team.";
    }


    if (state === "Coming Soon") {

        if (target === "bot") {
            return "New SHIFT features and services are currently in development and will be available in a future update.";
        }

        if (target === "game") {
            return "New LAST SHIFT content and features are currently in development and will be introduced in a future update.";
        }

        return "New community features and services are currently in development and will be introduced in a future update.";
    }


    return "No additional information is currently available.";

}


// ==================================================
// CREATE STATUS EMBED
// ==================================================

function createStatusEmbed(state, target) {

    const info = statuses[state];
    const targetInfo = targets[target];

    const message =
        generateMessage(
            state,
            target
        );


    return new EmbedBuilder()

        .setTitle(
            "LAST SHIFT — SYSTEM STATUS"
        )

        .setDescription(
            "Official system status for LAST SHIFT."
        )

        .addFields(

            {
                name: "Service",
                value:
                    `**${targetInfo.name}**`,
                inline: true
            },

            {
                name: "Status",
                value:
                    `${info.emoji} **${state}**`,
                inline: true
            },

            {
                name: "Information",
                value:
                    message,
                inline: false
            }

        )

        .setFooter({
            text:
                "LAST SHIFT • Official System Status"
        })

        .setTimestamp();

}


// ==================================================
// COMMAND
// ==================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("status")

        .setDescription(
            "Actualiza el estado oficial de LAST SHIFT."
        )

        // Only administrators can see/use this command
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        )

        .addStringOption(option =>

            option

                .setName("state")

                .setDescription(
                    "Selecciona el estado."
                )

                .setRequired(true)

                .addChoices(

                    {
                        name: "🟢 Operational",
                        value: "Operational"
                    },

                    {
                        name: "🟡 In Development",
                        value: "In Development"
                    },

                    {
                        name: "🟠 Maintenance",
                        value: "Maintenance"
                    },

                    {
                        name: "🔴 Offline",
                        value: "Offline"
                    },

                    {
                        name: "⚫ Coming Soon",
                        value: "Coming Soon"
                    }

                )

        )

        .addStringOption(option =>

            option

                .setName("target")

                .setDescription(
                    "Selecciona el servicio."
                )

                .setRequired(true)

                .addChoices(

                    {
                        name: "SHIFT — Bot",
                        value: "bot"
                    },

                    {
                        name: "LAST SHIFT — Game",
                        value: "game"
                    },

                    {
                        name: "LAST SHIFT — Community",
                        value: "server"
                    }

                )

        ),


    // ==================================================
    // EXECUTE
    // ==================================================

    async execute(interaction) {

        // ==============================================
        // ADMIN CHECK
        // ==============================================

        if (
            !interaction.memberPermissions ||
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({

                content:
                    "❌ You do not have permission to modify the official system status.",

                flags: 64

            });

        }


        // ==============================================
        // GET OPTIONS
        // ==============================================

        const state =
            interaction.options.getString(
                "state"
            );

        const target =
            interaction.options.getString(
                "target"
            );


        // ==============================================
        // CHECK STATUS CHANNEL
        // ==============================================

        const statusChannelId =
            process.env.STATUS_CHANNEL_ID;


        if (!statusChannelId) {

            return interaction.reply({

                content:
                    "❌ The status channel is not configured in the environment variables.",

                flags: 64

            });

        }


        // ==============================================
        // FETCH STATUS CHANNEL
        // ==============================================

        let statusChannel;

        try {

            statusChannel =
                await interaction.guild.channels.fetch(
                    statusChannelId
                );

        } catch (error) {

            console.error(
                "❌ Error fetching status channel:",
                error
            );

            return interaction.reply({

                content:
                    "❌ The configured status channel could not be accessed.",

                flags: 64

            });

        }


        if (!statusChannel) {

            return interaction.reply({

                content:
                    "❌ The configured status channel does not exist.",

                flags: 64

            });

        }


        // ==============================================
        // SAVE STATUS
        // ==============================================

        saveStatus({

            state: state,

            target: target

        });


        // ==============================================
        // CREATE EMBED
        // ==============================================

        const embed =
            createStatusEmbed(
                state,
                target
            );


        // ==============================================
        // REMOVE PREVIOUS STATUS MESSAGE
        // ==============================================

        try {

            const messages =
                await statusChannel.messages.fetch({
                    limit: 20
                });


            const botMessages =
                messages.filter(
                    message =>
                        message.author.id === interaction.client.user.id
                );


            for (const message of botMessages.values()) {

                try {

                    await message.delete();

                } catch (error) {

                    console.error(
                        "⚠️ Could not delete previous status message:",
                        error
                    );

                }

            }

        } catch (error) {

            console.error(
                "⚠️ Error cleaning status channel:",
                error
            );

        }


        // ==============================================
        // SEND NEW STATUS
        // ==============================================

        try {

            await statusChannel.send({

                embeds: [
                    embed
                ]

            });

        } catch (error) {

            console.error(
                "❌ Error sending status message:",
                error
            );

            return interaction.reply({

                content:
                    "❌ The status was updated, but SHIFT could not publish the status message.",

                flags: 64

            });

        }


        // ==============================================
        // PRIVATE CONFIRMATION
        // ==============================================

        await interaction.reply({

            content:
                "✅ The official system status has been updated and published successfully.",

            flags: 64

        });

    }

};