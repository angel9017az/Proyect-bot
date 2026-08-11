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
const crypto = require("crypto");

const {
    getUserByUsername,
    getUserById,
    checkVerificationCode
} = require("../services/roblox");


// ============================================================
// DATABASE
// ============================================================

const dataDirectory = path.join(
    __dirname,
    "..",
    "data"
);

const databaseFile = path.join(
    dataDirectory,
    "verified.json"
);


if (!fs.existsSync(dataDirectory)) {

    fs.mkdirSync(
        dataDirectory,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(databaseFile)) {

    fs.writeFileSync(
        databaseFile,
        JSON.stringify(
            {
                users: {}
            },
            null,
            4
        )
    );

}


// ============================================================
// DATABASE FUNCTIONS
// ============================================================

function loadDatabase() {

    try {

        const data =
            JSON.parse(
                fs.readFileSync(
                    databaseFile,
                    "utf8"
                )
            );

        if (!data.users) {
            data.users = {};
        }

        return data;

    } catch {

        return {
            users: {}
        };

    }

}


function saveDatabase(data) {

    fs.writeFileSync(
        databaseFile,
        JSON.stringify(
            data,
            null,
            4
        )
    );

}


// ============================================================
// PENDING VERIFICATIONS
// ============================================================

const pendingVerifications =
    new Map();


// ============================================================
// GENERATE VERIFICATION CODE
// ============================================================

function generateCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        code +=
            characters[
                crypto.randomInt(
                    0,
                    characters.length
                )
            ];

    }

    return `LASTSHIFT-${code}`;

}


// ============================================================
// FIND ROBLOX ACCOUNT
// ============================================================

function findRobloxAccount(
    database,
    robloxId
) {

    for (
        const discordId
        of Object.keys(database.users)
    ) {

        const record =
            database.users[
                discordId
            ];

        if (
            record &&
            String(record.robloxId) ===
            String(robloxId)
        ) {

            return {
                discordId,
                record
            };

        }

    }

    return null;

}


// ============================================================
// CREATE DISCORD NICKNAME
//
// Example:
// Angel (andrea306az)
// ============================================================

function createNickname(
    discordName,
    robloxUsername
) {

    const suffix =
        ` (${robloxUsername})`;

    const maxDiscordLength =
        32 - suffix.length;

    let cleanName =
        String(
            discordName ||
            "User"
        )
            .replace(
                /\s+\([^)]*\)$/,
                ""
            )
            .trim();


    if (
        cleanName.length >
        maxDiscordLength
    ) {

        cleanName =
            cleanName.substring(
                0,
                Math.max(
                    1,
                    maxDiscordLength
                )
            );

    }


    return (
        cleanName +
        suffix
    ).substring(
        0,
        32
    );

}


// ============================================================
// GET ORIGINAL DISCORD NAME
// ============================================================

function getDiscordBaseName(
    member
) {

    const currentNickname =
        member.nickname ||
        member.user.globalName ||
        member.user.username;


    return String(
        currentNickname
    )
        .replace(
            /\s+\([^)]*\)$/,
            ""
        )
        .trim();

}


// ============================================================
// UPDATE DISCORD NICKNAME
//
// DiscordName (RobloxUsername)
// ============================================================

async function updateDiscordNickname(
    member,
    robloxUsername
) {

    if (!member) {
        return false;
    }


    try {

        // Server owner cannot have nickname modified
        if (
            member.id ===
            member.guild.ownerId
        ) {

            console.log(
                `⚠️ Cannot change nickname of server owner: ${member.user.tag}`
            );

            return false;

        }


        // Bot needs Manage Nicknames
        if (
            !member.manageable
        ) {

            console.log(
                `⚠️ Bot cannot manage nickname of ${member.user.tag}`
            );

            return false;

        }


        const discordName =
            getDiscordBaseName(
                member
            );


        const newNickname =
            createNickname(
                discordName,
                robloxUsername
            );


        if (
            member.nickname ===
            newNickname
        ) {

            return true;

        }


        await member.setNickname(
            newNickname,
            "LAST SHIFT Roblox verification"
        );


        console.log(
            `✅ Nickname updated: ${member.user.tag} → ${newNickname}`
        );


        return true;


    } catch (error) {

        console.error(
            `❌ Error changing nickname for ${member.user.tag}:`,
            error
        );

        return false;

    }

}


// ============================================================
// AUTOMATIC VERIFICATION DM
// ============================================================

async function sendAutomaticVerificationDM(
    member,
    robloxUser
) {

    try {

        const embed =
            new EmbedBuilder()

                .setColor(0x5865F2)

                .setTitle(
                    "🔐 LAST SHIFT — Verification Restored"
                )

                .setDescription(

                    "🇺🇸 **Your Roblox verification has been restored automatically.**\n\n" +

                    "Your previously linked Roblox account was recognized successfully when you joined the server.\n\n" +

                    "🇪🇸 **Tu verificación de Roblox ha sido restaurada automáticamente.**\n\n" +

                    "Tu cuenta de Roblox vinculada anteriormente fue reconocida correctamente al ingresar al servidor."

                )

                .addFields(

                    {
                        name:
                            "Discord",

                        value:
                            `<@${member.id}>`,

                        inline:
                            true
                    },

                    {
                        name:
                            "Roblox",

                        value:
                            `**${robloxUser.username}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "Status / Estado",

                        value:
                            "🟢 **Verified / Verificado**",

                        inline:
                            false
                    },

                    {
                        name:
                            "Automatic Verification / Verificación Automática",

                        value:

                            "🇺🇸 No action is required from you. Your verification was restored automatically.\n\n" +

                            "🇪🇸 No necesitas realizar ninguna acción. Tu verificación fue restaurada automáticamente."

                    }

                )

                .setFooter({
                    text:
                        "LAST SHIFT • Official Verification System"
                })

                .setTimestamp();


        await member.send({

            embeds: [
                embed
            ]

        });


        console.log(
            `📩 Automatic verification DM sent to ${member.user.tag}`
        );


        return true;


    } catch (error) {

        if (
            error.code === 50007
        ) {

            console.log(
                `⚠️ Could not DM ${member.user.tag}: DMs disabled or unavailable.`
            );

        } else {

            console.error(
                `❌ Error sending verification DM to ${member.user.tag}:`,
                error
            );

        }

        return false;

    }

}


// ============================================================
// COMMAND
// ============================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("verify")

            .setDescription(
                "Manage Roblox verification / Administrar la verificación de Roblox"
            )

            .addSubcommand(
                subcommand =>
                    subcommand

                        .setName("panel")

                        .setDescription(
                            "Publish verification panel / Publicar panel de verificación"
                        )
            )

            .addSubcommand(
                subcommand =>
                    subcommand

                        .setName("unlink")

                        .setDescription(
                            "Unlink Roblox account / Desvincular cuenta de Roblox"
                        )
            ),


    // ========================================================
    // SLASH COMMAND EXECUTION
    // ========================================================

    async execute(
        interaction
    ) {

        const subcommand =
            interaction.options.getSubcommand();


        // ====================================================
        // PANEL
        // ====================================================

        if (
            subcommand ===
            "panel"
        ) {

            if (
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                return interaction.reply({

                    content:

                        "❌ **Permission Denied / Permiso Denegado**\n\n" +

                        "🇺🇸 Only server administrators can manage the verification panel.\n" +

                        "🇪🇸 Solo los administradores pueden administrar el panel.",

                    flags: 64

                });

            }


            const channelId =
                process.env.VERIFICATION_CHANNEL_ID;


            if (!channelId) {

                return interaction.reply({

                    content:

                        "❌ **Configuration Error / Error de Configuración**\n\n" +

                        "🇺🇸 `VERIFICATION_CHANNEL_ID` is missing from `.env`.\n" +

                        "🇪🇸 Falta `VERIFICATION_CHANNEL_ID` en `.env`.",

                    flags: 64

                });

            }


            const channel =
                await interaction.guild.channels.fetch(
                    channelId
                ).catch(
                    () => null
                );


            if (!channel) {

                return interaction.reply({

                    content:

                        "❌ **Channel Not Found / Canal No Encontrado**\n\n" +

                        "🇺🇸 The verification channel could not be found.\n" +

                        "🇪🇸 No se pudo encontrar el canal de verificación.",

                    flags: 64

                });

            }


            const embed =
                new EmbedBuilder()

                    .setColor(0x5865F2)

                    .setTitle(
                        "🔐 LAST SHIFT — Roblox Verification"
                    )

                    .setDescription(

                        "🇺🇸 **Connect your Roblox account to your Discord account.**\n\n" +

                        "🇪🇸 **Conecta tu cuenta de Roblox con tu cuenta de Discord.**\n\n" +

                        "🇺🇸 After verification, your server nickname will appear as:\n" +

                        "`DiscordName (RobloxUsername)`\n\n" +

                        "🇪🇸 Después de verificarte, tu nickname aparecerá como:\n" +

                        "`NombreDiscord (UsuarioRoblox)`"

                    )

                    .addFields(

                        {
                            name:
                                "📋 How to verify / Cómo verificar",

                            value:

                                "🇺🇸 **1.** Click **Verify Roblox**.\n" +
                                "🇪🇸 **1.** Pulsa **Verificar Roblox**.\n\n" +

                                "🇺🇸 **2.** Enter your Roblox username.\n" +
                                "🇪🇸 **2.** Introduce tu username de Roblox.\n\n" +

                                "🇺🇸 **3.** Add the generated code anywhere in your Roblox About section.\n" +
                                "🇪🇸 **3.** Agrega el código en cualquier parte de tu descripción de Roblox.\n\n" +

                                "🇺🇸 **4.** Click **Check Verification**.\n" +
                                "🇪🇸 **4.** Pulsa **Comprobar Verificación**."

                        },

                        {
                            name:
                                "⚠️ Important / Importante",

                            value:

                                "🇺🇸 **You DO NOT need to delete your existing description.** Simply add the code to it.\n\n" +

                                "🇪🇸 **NO necesitas borrar tu descripción actual.** Simplemente agrega el código dentro de ella.\n\n" +

                                "⏱️ **Codes expire after 10 minutes / Los códigos expiran después de 10 minutos.**"

                        }

                    )

                    .setFooter({
                        text:
                            "LAST SHIFT • Official Verification System"
                    });


            const row =
                new ActionRowBuilder()

                    .addComponents(

                        new ButtonBuilder()

                            .setCustomId(
                                "verify_start"
                            )

                            .setLabel(
                                "Verify Roblox / Verificar Roblox"
                            )

                            .setStyle(
                                ButtonStyle.Primary
                            ),

                        new ButtonBuilder()

                            .setCustomId(
                                "verify_check"
                            )

                            .setLabel(
                                "Check Verification / Comprobar"
                            )

                            .setStyle(
                                ButtonStyle.Success
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


            return interaction.reply({

                content:

                    "✅ **Verification panel published successfully.**\n" +
                    "🇪🇸 Panel de verificación publicado correctamente.",

                flags: 64

            });

        }


        // ====================================================
        // UNLINK
        // ====================================================

        if (
            subcommand ===
            "unlink"
        ) {

            const database =
                loadDatabase();


            const user =
                database.users[
                    interaction.user.id
                ];


            if (!user) {

                return interaction.reply({

                    content:

                        "ℹ️ **No linked account / No hay cuenta vinculada**\n\n" +

                        "🇺🇸 You don't currently have a Roblox account linked.\n" +

                        "🇪🇸 Actualmente no tienes una cuenta de Roblox vinculada.",

                    flags: 64

                });

            }


            delete database.users[
                interaction.user.id
            ];


            saveDatabase(
                database
            );


            const roleId =
                process.env.VERIFIED_ROLE_ID;


            if (roleId) {

                await interaction.member.roles
                    .remove(
                        roleId,
                        "LAST SHIFT Roblox account unlinked"
                    )
                    .catch(
                        () => {}
                    );

            }


            const currentNickname =
                interaction.member.nickname ||
                interaction.user.globalName ||
                interaction.user.username;


            const cleanNickname =
                String(
                    currentNickname
                )
                    .replace(
                        /\s+\([^)]*\)$/,
                        ""
                    )
                    .trim();


            if (
                interaction.member.manageable
            ) {

                await interaction.member
                    .setNickname(
                        cleanNickname,
                        "LAST SHIFT Roblox account unlinked"
                    )
                    .catch(
                        () => {}
                    );

            }


            return interaction.reply({

                content:

                    "✅ **Account unlinked / Cuenta desvinculada**\n\n" +

                    "🇺🇸 Your Roblox account has been successfully unlinked.\n" +

                    "🇪🇸 Tu cuenta de Roblox ha sido desvinculada correctamente.",

                flags: 64

            });

        }

    },


    // ========================================================
    // BUTTON HANDLER
    // ========================================================

    async handleButton(
        interaction
    ) {

        // ====================================================
        // START VERIFICATION
        // ====================================================

        if (
            interaction.customId ===
            "verify_start"
        ) {

            const modal =
                new ModalBuilder()

                    .setCustomId(
                        "verify_username_modal"
                    )

                    .setTitle(
                        "Roblox Verification / Verificación"
                    );


            const usernameInput =
                new TextInputBuilder()

                    .setCustomId(
                        "roblox_username"
                    )

                    .setLabel(
                        "Roblox Username / Usuario de Roblox"
                    )

                    .setPlaceholder(
                        "Example: andrea306az"
                    )

                    .setStyle(
                        TextInputStyle.Short
                    )

                    .setRequired(true)

                    .setMinLength(3)

                    .setMaxLength(20);


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        usernameInput
                    )

            );


            return interaction.showModal(
                modal
            );

        }


        // ====================================================
        // CHECK VERIFICATION
        // ====================================================

        if (
            interaction.customId ===
            "verify_check"
        ) {

            const pending =
                pendingVerifications.get(
                    interaction.user.id
                );


            if (!pending) {

                return interaction.reply({

                    content:

                        "❌ **No active verification / No hay una verificación activa**\n\n" +

                        "🇺🇸 Click **Verify Roblox** first.\n" +

                        "🇪🇸 Pulsa primero **Verificar Roblox**.",

                    flags: 64

                });

            }


            if (
                Date.now() >
                pending.expiresAt
            ) {

                pendingVerifications.delete(
                    interaction.user.id
                );


                return interaction.reply({

                    content:

                        "⏰ **Verification expired / Verificación expirada**\n\n" +

                        "🇺🇸 Generate a new verification code.\n" +

                        "🇪🇸 Genera un nuevo código.",

                    flags: 64

                });

            }


            await interaction.deferReply({
                flags: 64
            });


            try {

                const result =
                    await checkVerificationCode(

                        pending.robloxId,

                        pending.code

                    );


                if (
                    !result.success
                ) {

                    let reasonText =

                        "🇺🇸 We couldn't find the verification code in your Roblox About section.\n\n" +

                        "🇪🇸 No encontramos el código de verificación en tu descripción de Roblox.\n\n" +

                        "🇺🇸 Make sure the code is written exactly as provided.\n" +

                        "🇪🇸 Asegúrate de que el código esté escrito exactamente como se proporcionó.";


                    if (
                        result.reason ===
                        "USER_BANNED"
                    ) {

                        reasonText =

                            "🇺🇸 This Roblox account is currently banned.\n\n" +

                            "🇪🇸 Esta cuenta de Roblox se encuentra actualmente baneada.";

                    }


                    return interaction.editReply({

                        content:

                            "❌ **Verification Failed / Verificación Fallida**\n\n" +

                            reasonText +

                            "\n\n⚠️ 🇺🇸 You do not need to delete your existing Roblox description.\n" +

                            "⚠️ 🇪🇸 No necesitas borrar tu descripción actual de Roblox."

                    });

                }


                const database =
                    loadDatabase();


                // =================================================
                // CHECK IF ROBLOX ACCOUNT IS ALREADY LINKED
                // =================================================

                const existingRoblox =
                    findRobloxAccount(
                        database,
                        result.user.id
                    );


                if (
                    existingRoblox &&
                    existingRoblox.discordId !==
                    interaction.user.id
                ) {

                    return interaction.editReply({

                        content:

                            "❌ **Account Already Linked / Cuenta Ya Vinculada**\n\n" +

                            "🇺🇸 This Roblox account is already linked to another Discord account.\n\n" +

                            "🇪🇸 Esta cuenta de Roblox ya está vinculada a otra cuenta de Discord."

                    });

                }


                // =================================================
                // SAVE VERIFICATION
                // =================================================

                database.users[
                    interaction.user.id
                ] = {

                    robloxId:
                        result.user.id,

                    username:
                        result.user.username,

                    displayName:
                        result.user.displayName,

                    profile:
                        `https://www.roblox.com/users/${result.user.id}/profile`,

                    verifiedAt:
                        new Date().toISOString()

                };


                saveDatabase(
                    database
                );


                pendingVerifications.delete(
                    interaction.user.id
                );


                // =================================================
                // ADD VERIFIED ROLE
                // =================================================

                const roleId =
                    process.env.VERIFIED_ROLE_ID;


                if (roleId) {

                    await interaction.member.roles
                        .add(
                            roleId,
                            "LAST SHIFT Roblox verification"
                        )
                        .catch(
                            error => {

                                console.error(
                                    "❌ Could not add Verified role:",
                                    error
                                );

                            }
                        );

                }


                // =================================================
                // CHANGE NICKNAME
                // =================================================

                const nicknameChanged =
                    await updateDiscordNickname(

                        interaction.member,

                        result.user.username

                    );


                const finalNickname =
                    createNickname(
                        getDiscordBaseName(
                            interaction.member
                        ),
                        result.user.username
                    );


                // =================================================
                // SUCCESS
                // =================================================

                return interaction.editReply({

                    content:

                        "✅ **Verification Successful / Verificación Exitosa**\n\n" +

                        `🇺🇸 **Roblox account:** ${result.user.username}\n` +

                        `🇪🇸 **Cuenta de Roblox:** ${result.user.username}\n\n` +

                        "🎖️ **Verified role:** Added / Añadido\n\n" +

                        (
                            nicknameChanged

                                ?

                                `🏷️ **Nickname:** \`${finalNickname}\``

                                :

                                "⚠️ **Nickname could not be changed / No se pudo cambiar el nickname.**"

                        ) +

                        "\n\n" +

                        "🇺🇸 You may now remove the verification code from your Roblox description.\n" +

                        "🇪🇸 Ya puedes eliminar el código de verificación de tu descripción de Roblox."

                });


            } catch (error) {

                console.error(
                    "❌ Roblox verification error:",
                    error
                );


                return interaction.editReply({

                    content:

                        "❌ **Roblox API Error / Error de la API de Roblox**\n\n" +

                        "🇺🇸 Please try again later.\n" +

                        "🇪🇸 Inténtalo nuevamente más tarde."

                });

            }

        }

    },


    // ========================================================
    // MODAL HANDLER
    // ========================================================

    async handleModal(
        interaction
    ) {

        if (
            interaction.customId !==
            "verify_username_modal"
        ) {

            return;

        }


        const username =
            interaction.fields
                .getTextInputValue(
                    "roblox_username"
                )
                .trim();


        await interaction.deferReply({
            flags: 64
        });


        try {

            const user =
                await getUserByUsername(
                    username
                );


            if (!user) {

                return interaction.editReply({

                    content:

                        "❌ **Roblox Account Not Found / Cuenta de Roblox No Encontrada**\n\n" +

                        `🇺🇸 We couldn't find **${username}**.\n` +

                        `🇪🇸 No encontramos **${username}**.`

                });

            }


            const database =
                loadDatabase();


            const current =
                database.users[
                    interaction.user.id
                ];


            if (
                current &&
                String(current.robloxId) ===
                String(user.id)
            ) {

                return interaction.editReply({

                    content:

                        "ℹ️ **Already Verified / Ya Estás Verificado**\n\n" +

                        `🇺🇸 Your Discord account is already linked to **${user.username}**.\n\n` +

                        `🇪🇸 Tu cuenta de Discord ya está vinculada con **${user.username}**.`

                });

            }


            const existing =
                findRobloxAccount(
                    database,
                    user.id
                );


            if (
                existing &&
                existing.discordId !==
                interaction.user.id
            ) {

                return interaction.editReply({

                    content:

                        "❌ **Account Already Linked / Cuenta Ya Vinculada**\n\n" +

                        "🇺🇸 This Roblox account is already linked to another Discord account.\n\n" +

                        "🇪🇸 Esta cuenta de Roblox ya está vinculada a otra cuenta de Discord."

                });

            }


            const code =
                generateCode();


            pendingVerifications.set(

                interaction.user.id,

                {

                    robloxId:
                        user.id,

                    username:
                        user.username,

                    code,

                    expiresAt:
                        Date.now() +
                        10 * 60 * 1000

                }

            );


            return interaction.editReply({

                content:

                    "🔐 **LAST SHIFT — Verification Code / Código de Verificación**\n\n" +

                    `🎮 **Roblox:** ${user.username}\n\n` +

                    `🔑 **Code / Código:** \`${code}\`\n\n` +

                    "🇺🇸 Add this code anywhere in your existing Roblox About section.\n\n" +

                    "🇪🇸 Agrega este código en cualquier parte de tu descripción actual de Roblox.\n\n" +

                    "⚠️ **You DO NOT need to delete your existing description.**\n" +

                    "⚠️ **NO necesitas borrar tu descripción actual.**\n\n" +

                    "🇺🇸 Simply add the code to your existing description.\n" +

                    "🇪🇸 Simplemente agrega el código a tu descripción existente.\n\n" +

                    "⏱️ **Expires in 10 minutes / Expira en 10 minutos.**\n\n" +

                    "🇺🇸 After adding it, click **Check Verification**.\n" +

                    "🇪🇸 Después de agregarlo, pulsa **Comprobar Verificación**."

            });


        } catch (error) {

            console.error(
                "❌ Roblox lookup error:",
                error
            );


            return interaction.editReply({

                content:

                    "❌ **Roblox API Error / Error de la API de Roblox**\n\n" +

                    "🇺🇸 Please try again later.\n" +

                    "🇪🇸 Inténtalo nuevamente más tarde."

            });

        }

    },


    // ========================================================
    // RESTORE VERIFICATION WHEN MEMBER RETURNS
    // ========================================================

    async restoreVerification(
        member
    ) {

        try {

            const database =
                loadDatabase();


            const record =
                database.users[
                    member.id
                ];


            if (!record) {

                return false;

            }


            // =================================================
            // GET CURRENT ROBLOX INFORMATION
            // =================================================

            const robloxUser =
                await getUserById(
                    record.robloxId
                );


            if (!robloxUser) {

                console.log(

                    `⚠️ Roblox account ${record.robloxId} no longer exists.`

                );

                return false;

            }


            // =================================================
            // UPDATE STORED INFORMATION
            // =================================================

            let changed =
                false;


            if (
                record.username !==
                robloxUser.username
            ) {

                record.username =
                    robloxUser.username;

                changed =
                    true;

            }


            if (
                record.displayName !==
                robloxUser.displayName
            ) {

                record.displayName =
                    robloxUser.displayName;

                changed =
                    true;

            }


            if (changed) {

                saveDatabase(
                    database
                );

            }


            // =================================================
            // RESTORE VERIFIED ROLE
            // =================================================

            const roleId =
                process.env.VERIFIED_ROLE_ID;


            if (roleId) {

                const role =
                    await member.guild.roles
                        .fetch(
                            roleId
                        )
                        .catch(
                            () => null
                        );


                if (
                    role &&
                    !member.roles.cache.has(
                        role.id
                    )
                ) {

                    await member.roles.add(

                        role,

                        "LAST SHIFT automatic verification restoration"

                    );

                }

            }


            // =================================================
            // RESTORE NICKNAME
            // =================================================

            const nicknameChanged =
                await updateDiscordNickname(

                    member,

                    robloxUser.username

                );


            // =================================================
            // SEND AUTOMATIC DM
            // =================================================

            await sendAutomaticVerificationDM(

                member,

                robloxUser

            );


            console.log(

                `🔄 Restored verification: ${member.user.tag} → ${robloxUser.username}`

            );


            return true;


        } catch (error) {

            console.error(

                `❌ Error restoring verification for ${member.user.tag}:`,

                error

            );

            return false;

        }

    }

};