// ============================================================
// LAST SHIFT
// MAIN BOT
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


const fs =
    require("fs");


const path =
    require("path");


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

const client =
    new Client({

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
// COMMANDS
// ============================================================

client.commands =
    new Collection();


const commandsPath =
    path.join(

        __dirname,

        "commands"

    );


if (
    !fs.existsSync(
        commandsPath
    )
) {

    console.error(
        "❌ Commands folder not found."
    );

    process.exit(1);

}


const commandFiles =
    fs.readdirSync(
        commandsPath
    )
    .filter(
        file =>
            file.endsWith(".js")
    );


for (
    const file
    of commandFiles
) {

    const filePath =
        path.join(

            commandsPath,

            file

        );


    try {

        const command =
            require(
                filePath
            );


        if (
            !command.data ||
            !command.execute
        ) {

            console.warn(

                `⚠️ ${file} does not contain a valid command.`

            );

            continue;

        }


        client.commands.set(

            command.data.name,

            command

        );


        console.log(

            `✓ Loaded command: /${command.data.name}`

        );


    } catch (
        error
    ) {

        console.error(

            `❌ Error loading ${file}:`,

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

            `🌙 ${readyClient.user.tag} is online.`

        );


        console.log(

            `📡 Servers: ${readyClient.guilds.cache.size}`

        );


        console.log(

            `📦 Commands: ${client.commands.size}`

        );


        console.log(

            "📋 Central logging system: ONLINE"

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
// + MEMBER LOG
// ============================================================

client.on(

    Events.GuildMemberAdd,

    async member => {

        try {

            // =================================================
            // ONLY TARGET CONFIGURED SERVER
            // =================================================

            if (

                process.env.GUILD_ID &&

                member.guild.id !==
                process.env.GUILD_ID

            ) {

                return;

            }


            // =================================================
            // LOG MEMBER JOIN
            // =================================================

            await logMemberJoin(
                member
            );


            // =================================================
            // VERIFY RESTORATION
            // =================================================

            const verifyCommand =
                client.commands.get(
                    "verify"
                );


            if (
                !verifyCommand
            ) {

                return;

            }


            if (

                typeof
                verifyCommand.restoreVerification !==
                "function"

            ) {

                return;

            }


            const restored =
                await verifyCommand.restoreVerification(

                    member

                );


            if (
                restored
            ) {

                console.log(

                    `🔄 Automatically restored verification for ${member.user.tag}.`

                );

            }


        } catch (
            error
        ) {

            console.error(

                "❌ Member join error:",

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

                process.env.GUILD_ID &&

                member.guild.id !==
                process.env.GUILD_ID

            ) {

                return;

            }


            await logMemberLeave(
                member
            );


        } catch (
            error
        ) {

            console.error(

                "❌ Member leave log error:",

                error

            );

        }

    }

);


// ============================================================
// MEMBER UPDATE
// Nickname / Roles
// ============================================================

client.on(

    Events.GuildMemberUpdate,

    async (
        oldMember,
        newMember
    ) => {

        try {

            if (

                process.env.GUILD_ID &&

                newMember.guild.id !==
                process.env.GUILD_ID

            ) {

                return;

            }


            await logMemberUpdate(

                oldMember,

                newMember

            );


        } catch (
            error
        ) {

            console.error(

                "❌ Member update log error:",

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

            if (
                !message.guild
            ) {

                return;

            }


            if (

                process.env.GUILD_ID &&

                message.guild.id !==
                process.env.GUILD_ID

            ) {

                return;

            }


            await logMessageDelete(
                message
            );


        } catch (
            error
        ) {

            console.error(

                "❌ Message delete log error:",

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

            if (
                !newMessage.guild
            ) {

                return;

            }


            if (

                process.env.GUILD_ID &&

                newMessage.guild.id !==
                process.env.GUILD_ID

            ) {

                return;

            }


            await logMessageUpdate(

                oldMessage,

                newMessage

            );


        } catch (
            error
        ) {

            console.error(

                "❌ Message update log error:",

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

            if (
                interaction.isButton()
            ) {

                const customId =
                    interaction.customId;


                // =============================================
                // VERIFICATION
                // =============================================

                if (

                    customId ===
                    "verify_start" ||

                    customId ===
                    "verify_check"

                ) {

                    const command =
                        client.commands.get(
                            "verify"
                        );


                    if (

                        command &&

                        command.handleButton

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

                    customId ===
                    "open_suggestion_modal"

                ) {

                    const command =
                        client.commands.get(
                            "suggest"
                        );


                    if (

                        command &&

                        command.handleButton

                    ) {

                        await command.handleButton(

                            interaction

                        );

                    }


                    return;

                }


                if (

                    customId.startsWith(
                        "suggest_status_"
                    )

                ) {

                    const command =
                        client.commands.get(
                            "suggest"
                        );


                    if (

                        command &&

                        command.handleStatusButton

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

                    customId ===
                    "open_report_modal"

                ) {

                    const command =
                        client.commands.get(
                            "report"
                        );


                    if (

                        command &&

                        command.handleButton

                    ) {

                        await command.handleButton(

                            interaction

                        );

                    }


                    return;

                }


                if (

                    customId.startsWith(
                        "report_status_"
                    )

                ) {

                    const command =
                        client.commands.get(
                            "report"
                        );


                    if (

                        command &&

                        command.handleStatusButton

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

            if (
                interaction.isModalSubmit()
            ) {

                const customId =
                    interaction.customId;


                // =============================================
                // VERIFICATION
                // =============================================

                if (

                    customId ===
                    "verify_username_modal"

                ) {

                    const command =
                        client.commands.get(
                            "verify"
                        );


                    if (

                        command &&

                        command.handleModal

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

                    customId ===
                    "suggestion_modal"

                ) {

                    const command =
                        client.commands.get(
                            "suggest"
                        );


                    if (

                        command &&

                        command.handleModal

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

                    customId ===
                    "report_modal"

                ) {

                    const command =
                        client.commands.get(
                            "report"
                        );


                    if (

                        command &&

                        command.handleModal

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

            if (
                !interaction.isChatInputCommand()
            ) {

                return;

            }


            const command =
                client.commands.get(

                    interaction.commandName

                );


            if (
                !command
            ) {

                return interaction.reply({

                    content:

                        "❌ **Command unavailable / Comando no disponible**\n\n" +

                        "🇺🇸 This command could not be found.\n" +

                        "🇪🇸 No se pudo encontrar este comando.",

                    flags: 64

                });

            }


            await command.execute(

                interaction

            );


        } catch (
            error
        ) {

            console.error(

                "❌ Interaction error:",

                error

            );


            try {

                const response = {

                    content:

                        "❌ **Unexpected error / Error inesperado**\n\n" +

                        "🇺🇸 An unexpected error occurred while processing your request.\n" +

                        "🇪🇸 Ocurrió un error inesperado al procesar tu solicitud.",

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


            } catch (
                responseError
            ) {

                console.error(

                    "❌ Could not send error response:",

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

            "❌ Unhandled Promise Rejection:",

            error

        );

    }

);


process.on(

    "uncaughtException",

    error => {

        console.error(

            "❌ Uncaught Exception:",

            error

        );

    }

);


// ============================================================
// TOKEN
// ============================================================

if (
    !process.env.DISCORD_TOKEN
) {

    console.error(

        "❌ DISCORD_TOKEN is missing from .env"

    );

    process.exit(1);

}


// ============================================================
// LOGIN
// ============================================================

client.login(

    process.env.DISCORD_TOKEN

);