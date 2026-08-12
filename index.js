// ============================================================
// LAST SHIFT
// MAIN BOT
// RAILWAY READY
// ES / EN
// ============================================================

require("dotenv").config();

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");


// ============================================================
// ENVIRONMENT
// ============================================================

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;


// ============================================================
// LOGGER
// ============================================================

const {
    logMemberJoin,
    logMemberLeave,
    logMessageDelete,
    logMessageUpdate,
    logMemberUpdate
} = require("./utils/logger");


// ============================================================
// CLIENT
// ============================================================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent

    ],

    partials: [

        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember

    ]

});


// ============================================================
// COMMAND COLLECTION
// ============================================================

client.commands = new Collection();

const commandsPath =
    path.join(__dirname, "commands");


// ============================================================
// COMMAND DIRECTORY CHECK
// ============================================================

if (!fs.existsSync(commandsPath)) {

    console.error(
        "SHIFT // Commands directory not found."
    );

    process.exit(1);

}


// ============================================================
// LOAD COMMANDS
// ============================================================

const commandFiles =
    fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


for (const file of commandFiles) {

    const filePath =
        path.join(commandsPath, file);

    try {

        const command =
            require(filePath);

        if (
            !command.data ||
            !command.execute
        ) {

            console.warn(
                `SHIFT // Invalid command: ${file}`
            );

            continue;

        }

        client.commands.set(
            command.data.name,
            command
        );

        console.log(
            `SHIFT // Command loaded: /${command.data.name}`
        );

    } catch (error) {

        console.error(
            `SHIFT // Failed to load ${file}:`,
            error
        );

    }

}


// ============================================================
// READY
// ============================================================

client.once(
    Events.ClientReady,
    readyClient => {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "SHIFT // SECURITY SYSTEM"
        );

        console.log(
            "System: ONLINE"
        );

        console.log(
            `Identity: ${readyClient.user.tag}`
        );

        console.log(
            `Servers: ${readyClient.guilds.cache.size}`
        );

        console.log(
            `Commands: ${client.commands.size}`
        );

        console.log(
            "Logging System: ONLINE"
        );

        console.log(
            "Environment: RAILWAY"
        );

        console.log(
            "=========================================="
        );

        console.log("");

    }
);


// ============================================================
// MEMBER JOIN
// AUTOMATIC VERIFICATION RESTORATION
// ============================================================

client.on(
    Events.GuildMemberAdd,
    async member => {

        try {

            if (
                GUILD_ID &&
                member.guild.id !== GUILD_ID
            ) {

                return;

            }


            // =================================================
            // MEMBER LOG
            // =================================================

            await logMemberJoin(member);


            // =================================================
            // VERIFICATION RESTORATION
            // =================================================

            const verifyCommand =
                client.commands.get("verify");

            if (!verifyCommand) {
                return;
            }

            if (
                typeof verifyCommand.restoreVerification !==
                "function"
            ) {

                return;

            }

            const restored =
                await verifyCommand.restoreVerification(
                    member
                );

            if (restored) {

                console.log(
                    `SHIFT // Verification restored: ${member.user.tag}`
                );

            }

        } catch (error) {

            console.error(
                "SHIFT // Member join error:",
                error
            );

        }

    }
);


// ============================================================
// MEMBER LEAVE
// ============================================================

client.on(
    Events.GuildMemberRemove,
    async member => {

        try {

            if (
                GUILD_ID &&
                member.guild.id !== GUILD_ID
            ) {

                return;

            }

            await logMemberLeave(member);

        } catch (error) {

            console.error(
                "SHIFT // Member leave error:",
                error
            );

        }

    }
);


// ============================================================
// MEMBER UPDATE
// NICKNAME / ROLES
// ============================================================

client.on(
    Events.GuildMemberUpdate,
    async (
        oldMember,
        newMember
    ) => {

        try {

            if (
                GUILD_ID &&
                newMember.guild.id !== GUILD_ID
            ) {

                return;

            }

            await logMemberUpdate(
                oldMember,
                newMember
            );

        } catch (error) {

            console.error(
                "SHIFT // Member update error:",
                error
            );

        }

    }
);


// ============================================================
// MESSAGE DELETE
// ============================================================

client.on(
    Events.MessageDelete,
    async message => {

        try {

            if (!message.guild) {
                return;
            }

            if (
                GUILD_ID &&
                message.guild.id !== GUILD_ID
            ) {

                return;

            }

            await logMessageDelete(message);

        } catch (error) {

            console.error(
                "SHIFT // Message delete error:",
                error
            );

        }

    }
);


// ============================================================
// MESSAGE UPDATE
// ============================================================

client.on(
    Events.MessageUpdate,
    async (
        oldMessage,
        newMessage
    ) => {

        try {

            if (!newMessage.guild) {
                return;
            }

            if (
                GUILD_ID &&
                newMessage.guild.id !== GUILD_ID
            ) {

                return;

            }

            await logMessageUpdate(
                oldMessage,
                newMessage
            );

        } catch (error) {

            console.error(
                "SHIFT // Message update error:",
                error
            );

        }

    }
);


// ============================================================
// INTERACTIONS
// ============================================================

client.on(
    Events.InteractionCreate,
    async interaction => {

        try {

            // =================================================
            // BUTTONS
            // =================================================

            if (interaction.isButton()) {

                const customId =
                    interaction.customId;


                // =============================================
                // HELP
                // =============================================

                if (
                    customId.startsWith("help_")
                ) {

                    const command =
                        client.commands.get("help");

                    if (
                        command &&
                        typeof command.handleButton ===
                        "function"
                    ) {

                        await command.handleButton(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // VERIFICATION
                // =============================================

                if (
                    customId === "verify_start" ||
                    customId === "verify_check"
                ) {

                    const command =
                        client.commands.get("verify");

                    if (
                        command &&
                        typeof command.handleButton ===
                        "function"
                    ) {

                        await command.handleButton(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // SUGGESTIONS
                // =============================================

                if (
                    customId === "open_suggestion_modal"
                ) {

                    const command =
                        client.commands.get("suggest");

                    if (
                        command &&
                        typeof command.handleButton ===
                        "function"
                    ) {

                        await command.handleButton(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // SUGGESTION STATUS
                // =============================================

                if (
                    customId.startsWith(
                        "suggest_status_"
                    )
                ) {

                    const command =
                        client.commands.get("suggest");

                    if (
                        command &&
                        typeof command.handleStatusButton ===
                        "function"
                    ) {

                        await command.handleStatusButton(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // REPORTS
                // =============================================

                if (
                    customId === "open_report_modal"
                ) {

                    const command =
                        client.commands.get("report");

                    if (
                        command &&
                        typeof command.handleButton ===
                        "function"
                    ) {

                        await command.handleButton(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // REPORT STATUS
                // =============================================

                if (
                    customId.startsWith(
                        "report_status_"
                    )
                ) {

                    const command =
                        client.commands.get("report");

                    if (
                        command &&
                        typeof command.handleStatusButton ===
                        "function"
                    ) {

                        await command.handleStatusButton(
                            interaction
                        );

                    }

                    return;

                }

            }


            // =================================================
            // MODALS
            // =================================================

            if (interaction.isModalSubmit()) {

                const customId =
                    interaction.customId;


                // =============================================
                // VERIFICATION
                // =============================================

                if (
                    customId === "verify_username_modal"
                ) {

                    const command =
                        client.commands.get("verify");

                    if (
                        command &&
                        typeof command.handleModal ===
                        "function"
                    ) {

                        await command.handleModal(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // SUGGESTION
                // =============================================

                if (
                    customId === "suggestion_modal"
                ) {

                    const command =
                        client.commands.get("suggest");

                    if (
                        command &&
                        typeof command.handleModal ===
                        "function"
                    ) {

                        await command.handleModal(
                            interaction
                        );

                    }

                    return;

                }


                // =============================================
                // REPORT
                // =============================================

                if (
                    customId === "report_modal"
                ) {

                    const command =
                        client.commands.get("report");

                    if (
                        command &&
                        typeof command.handleModal ===
                        "function"
                    ) {

                        await command.handleModal(
                            interaction
                        );

                    }

                    return;

                }

            }


            // =================================================
            // SLASH COMMAND
            // =================================================

            if (!interaction.isChatInputCommand()) {
                return;
            }


            const command =
                client.commands.get(
                    interaction.commandName
                );


            if (!command) {

                return interaction.reply({

                    content:
                        "**SHIFT // COMMAND UNAVAILABLE**\n\n" +
                        "The requested command could not be found.",

                    flags: 64

                });

            }


            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(
                "SHIFT // Interaction error:",
                error
            );


            // =================================================
            // SAFE ERROR RESPONSE
            // =================================================

            try {

                const response = {

                    content:
                        "**SHIFT // SYSTEM ERROR**\n\n" +
                        "The requested operation could not be completed.",

                    flags: 64

                };


                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp(
                        response
                    );

                } else {

                    await interaction.reply(
                        response
                    );

                }

            } catch (responseError) {

                console.error(
                    "SHIFT // Error response failed:",
                    responseError
                );

            }

        }

    }
);


// ============================================================
// PROCESS ERRORS
// ============================================================

process.on(
    "unhandledRejection",
    error => {

        console.error(
            "SHIFT // Unhandled Promise Rejection:",
            error
        );

    }
);


process.on(
    "uncaughtException",
    error => {

        console.error(
            "SHIFT // Uncaught Exception:",
            error
        );

    }
);


// ============================================================
// TOKEN VALIDATION
// ============================================================

if (!TOKEN) {

    console.error(
        "SHIFT // DISCORD_TOKEN is missing."
    );

    console.error(
        "Add DISCORD_TOKEN to Railway Variables."
    );

    process.exit(1);

}


// ============================================================
// LOGIN
// ============================================================

client.login(TOKEN)
    .then(() => {

        console.log(
            "SHIFT // Authentication request sent."
        );

    })
    .catch(error => {

        console.error(
            "SHIFT // Discord authentication failed:",
            error
        );

        process.exit(1);

    });
