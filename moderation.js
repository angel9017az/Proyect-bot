// ============================================================
// LAST SHIFT
// Moderation System
// ES / EN
// ============================================================

const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


// ============================================================
// COMMAND
// ============================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("moderation")

            .setDescription(
                "Moderation tools / Herramientas de moderación"
            )

            // =================================================
            // WARN
            // =================================================

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("warn")

                        .setDescription(
                            "Warn a member / Advertir a un miembro"
                        )

                        .addUserOption(
                            option =>

                                option

                                    .setName("user")

                                    .setDescription(
                                        "Member to warn / Miembro a advertir"
                                    )

                                    .setRequired(true)
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("reason")

                                    .setDescription(
                                        "Reason / Razón"
                                    )

                                    .setRequired(true)

                                    .setMaxLength(1000)
                        )
            )


            // =================================================
            // KICK
            // =================================================

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("kick")

                        .setDescription(
                            "Remove a member / Expulsar a un miembro"
                        )

                        .addUserOption(
                            option =>

                                option

                                    .setName("user")

                                    .setDescription(
                                        "Member to kick / Miembro a expulsar"
                                    )

                                    .setRequired(true)
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("reason")

                                    .setDescription(
                                        "Reason / Razón"
                                    )

                                    .setRequired(true)

                                    .setMaxLength(1000)
                        )
            )


            // =================================================
            // BAN
            // =================================================

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("ban")

                        .setDescription(
                            "Ban a member / Banear a un miembro"
                        )

                        .addUserOption(
                            option =>

                                option

                                    .setName("user")

                                    .setDescription(
                                        "Member to ban / Miembro a banear"
                                    )

                                    .setRequired(true)
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("reason")

                                    .setDescription(
                                        "Reason / Razón"
                                    )

                                    .setRequired(true)

                                    .setMaxLength(1000)
                        )
            )


            // =================================================
            // TIMEOUT
            // =================================================

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("timeout")

                        .setDescription(
                            "Timeout a member / Silenciar temporalmente"
                        )

                        .addUserOption(
                            option =>

                                option

                                    .setName("user")

                                    .setDescription(
                                        "Member to timeout / Miembro"
                                    )

                                    .setRequired(true)
                        )

                        .addIntegerOption(
                            option =>

                                option

                                    .setName("minutes")

                                    .setDescription(
                                        "Duration in minutes / Duración en minutos"
                                    )

                                    .setRequired(true)

                                    .setMinValue(1)

                                    .setMaxValue(40320)
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("reason")

                                    .setDescription(
                                        "Reason / Razón"
                                    )

                                    .setRequired(true)

                                    .setMaxLength(1000)
                        )
            )


            // =================================================
            // UNTIMEOUT
            // =================================================

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("untimeout")

                        .setDescription(
                            "Remove timeout / Quitar silencio temporal"
                        )

                        .addUserOption(
                            option =>

                                option

                                    .setName("user")

                                    .setDescription(
                                        "Member / Miembro"
                                    )

                                    .setRequired(true)
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("reason")

                                    .setDescription(
                                        "Reason / Razón"
                                    )

                                    .setRequired(true)

                                    .setMaxLength(1000)
                        )
            )


            // =================================================
            // UNBAN
            // =================================================

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("unban")

                        .setDescription(
                            "Unban a user / Retirar un ban"
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("userid")

                                    .setDescription(
                                        "Discord User ID / ID del usuario"
                                    )

                                    .setRequired(true)
                        )

                        .addStringOption(
                            option =>

                                option

                                    .setName("reason")

                                    .setDescription(
                                        "Reason / Razón"
                                    )

                                    .setRequired(true)

                                    .setMaxLength(1000)
                        )
            ),


    // ========================================================
    // EXECUTE
    // ========================================================

    async execute(
        interaction
    ) {

        // ====================================================
        // PERMISSION
        // ====================================================

        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.ModerateMembers
            ) &&
            !interaction.memberPermissions.has(
                PermissionFlagsBits.KickMembers
            ) &&
            !interaction.memberPermissions.has(
                PermissionFlagsBits.BanMembers
            ) &&
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({

                content:

                    "❌ **Permission Denied / Permiso Denegado**\n\n" +

                    "🇺🇸 You do not have permission to use moderation commands.\n" +

                    "🇪🇸 No tienes permisos para utilizar los comandos de moderación.",

                flags: 64

            });

        }


        // ====================================================
        // GET SUBCOMMAND
        // ====================================================

        const action =
            interaction.options.getSubcommand();


        const reason =
            interaction.options.getString(
                "reason"
            );


        // ====================================================
        // UNBAN
        // ====================================================

        if (
            action ===
            "unban"
        ) {

            if (
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.BanMembers
                ) &&
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                return interaction.reply({

                    content:

                        "❌ **Permission Denied / Permiso Denegado**\n\n" +

                        "🇺🇸 You need Ban Members permission.\n" +

                        "🇪🇸 Necesitas el permiso Banear Miembros.",

                    flags: 64

                });

            }


            const userId =
                interaction.options.getString(
                    "userid"
                );


            if (
                !/^\d{17,20}$/.test(
                    userId
                )
            ) {

                return interaction.reply({

                    content:

                        "❌ **Invalid User ID / ID inválido**\n\n" +

                        "🇺🇸 Enter a valid Discord User ID.\n" +

                        "🇪🇸 Introduce un ID de usuario de Discord válido.",

                    flags: 64

                });

            }


            await interaction.deferReply({
                flags: 64
            });


            try {

                await interaction.guild.members.unban(

                    userId,

                    `LAST SHIFT | ${reason} | Moderator: ${interaction.user.tag}`

                );


                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "UNBAN",

                    user:
                        null,

                    userId,

                    moderator:
                        interaction.user,

                    reason

                });


                return interaction.editReply({

                    content:

                        "✅ **User Unbanned / Usuario Desbaneado**\n\n" +

                        `🇺🇸 User ID: \`${userId}\`\n` +

                        `🇪🇸 ID del usuario: \`${userId}\`\n\n` +

                        `📋 **Reason / Razón:** ${reason}`

                });


            } catch (error) {

                console.error(
                    "❌ Unban error:",
                    error
                );


                return interaction.editReply({

                    content:

                        "❌ **Unban Failed / Error al Desbanear**\n\n" +

                        "🇺🇸 The user may not be banned or the ID may be invalid.\n\n" +

                        "🇪🇸 El usuario puede no estar baneado o el ID puede ser inválido."

                });

            }

        }


        // ====================================================
        // GET TARGET
        // ====================================================

        const target =
            interaction.options.getMember(
                "user"
            );


        if (!target) {

            return interaction.reply({

                content:

                    "❌ **Member Not Found / Miembro No Encontrado**\n\n" +

                    "🇺🇸 The selected member could not be found in this server.\n\n" +

                    "🇪🇸 No se pudo encontrar al miembro seleccionado en este servidor.",

                flags: 64

            });

        }


        // ====================================================
        // PROTECTION
        // ====================================================

        if (
            target.id ===
            interaction.user.id
        ) {

            return interaction.reply({

                content:

                    "❌ **Invalid Action / Acción Inválida**\n\n" +

                    "🇺🇸 You cannot moderate yourself.\n" +

                    "🇪🇸 No puedes moderarte a ti mismo.",

                flags: 64

            });

        }


        if (
            target.id ===
            interaction.guild.ownerId
        ) {

            return interaction.reply({

                content:

                    "❌ **Protected Member / Miembro Protegido**\n\n" +

                    "🇺🇸 The server owner cannot be moderated by this system.\n" +

                    "🇪🇸 El propietario del servidor no puede ser moderado por este sistema.",

                flags: 64

            });

        }


        if (
            target.id ===
            interaction.client.user.id
        ) {

            return interaction.reply({

                content:

                    "❌ **Invalid Action / Acción Inválida**\n\n" +

                    "🇺🇸 The bot cannot moderate itself.\n" +

                    "🇪🇸 El bot no puede moderarse a sí mismo.",

                flags: 64

            });

        }


        // ====================================================
        // ROLE HIERARCHY
        // ====================================================

        if (
            target.roles.highest.position >=
            interaction.member.roles.highest.position &&
            interaction.guild.ownerId !==
            interaction.user.id
        ) {

            return interaction.reply({

                content:

                    "❌ **Hierarchy Restriction / Restricción de Jerarquía**\n\n" +

                    "🇺🇸 You cannot moderate a member with an equal or higher role.\n\n" +

                    "🇪🇸 No puedes moderar a un miembro con un rol igual o superior al tuyo.",

                flags: 64

            });

        }


        if (
            !target.manageable &&
            (
                action === "kick" ||
                action === "ban" ||
                action === "timeout" ||
                action === "untimeout"
            )
        ) {

            return interaction.reply({

                content:

                    "❌ **Hierarchy Restriction / Restricción de Jerarquía**\n\n" +

                    "🇺🇸 The bot cannot manage this member. Make sure the bot's role is above the target's highest role.\n\n" +

                    "🇪🇸 El bot no puede administrar a este miembro. Asegúrate de que el rol del bot esté por encima del rol más alto del objetivo.",

                flags: 64

            });

        }


        // ====================================================
        // DEFER
        // ====================================================

        await interaction.deferReply({
            flags: 64
        });


        try {

            // =================================================
            // WARN
            // =================================================

            if (
                action ===
                "warn"
            ) {

                await sendUserDM(

                    target.user,

                    "⚠️ Warning / Advertencia",

                    "You have received an official warning from the LAST SHIFT moderation team.\n\n" +

                    "Has recibido una advertencia oficial del equipo de moderación de LAST SHIFT.",

                    target.user.username,

                    reason

                );


                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "WARN",

                    user:
                        target.user,

                    moderator:
                        interaction.user,

                    reason

                });


                return interaction.editReply({

                    content:

                        "⚠️ **Warning Issued / Advertencia Emitida**\n\n" +

                        `👤 **User / Usuario:** ${target.user.tag}\n` +

                        `📋 **Reason / Razón:** ${reason}\n\n` +

                        "📩 🇺🇸 The user was notified by DM.\n" +

                        "📩 🇪🇸 El usuario fue notificado por DM."

                });

            }


            // =================================================
            // KICK
            // =================================================

            if (
                action ===
                "kick"
            ) {

                await sendUserDM(

                    target.user,

                    "👢 Kick Notice / Aviso de Expulsión",

                    "You have been removed from the LAST SHIFT Discord server.\n\n" +

                    "Has sido expulsado del servidor de Discord de LAST SHIFT.",

                    target.user.username,

                    reason

                );


                await target.kick(

                    `LAST SHIFT | ${reason} | Moderator: ${interaction.user.tag}`

                );


                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "KICK",

                    user:
                        target.user,

                    moderator:
                        interaction.user,

                    reason

                });


                return interaction.editReply({

                    content:

                        "👢 **Member Kicked / Miembro Expulsado**\n\n" +

                        `👤 **User / Usuario:** ${target.user.tag}\n` +

                        `📋 **Reason / Razón:** ${reason}\n\n` +

                        "📩 🇺🇸 The user was notified by DM.\n" +

                        "📩 🇪🇸 El usuario fue notificado por DM."

                });

            }


            // =================================================
            // BAN
            // =================================================

            if (
                action ===
                "ban"
            ) {

                await sendUserDM(

                    target.user,

                    "🔨 Ban Notice / Aviso de Baneo",

                    "You have been banned from the LAST SHIFT Discord server.\n\n" +

                    "Has sido baneado del servidor de Discord de LAST SHIFT.",

                    target.user.username,

                    reason

                );


                await target.ban({

                    reason:

                        `LAST SHIFT | ${reason} | Moderator: ${interaction.user.tag}`,

                    deleteMessageSeconds:
                        0

                });


                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "BAN",

                    user:
                        target.user,

                    moderator:
                        interaction.user,

                    reason

                });


                return interaction.editReply({

                    content:

                        "🔨 **Member Banned / Miembro Baneado**\n\n" +

                        `👤 **User / Usuario:** ${target.user.tag}\n` +

                        `📋 **Reason / Razón:** ${reason}\n\n` +

                        "📩 🇺🇸 The user was notified by DM.\n" +

                        "📩 🇪🇸 El usuario fue notificado por DM."

                });

            }


            // =================================================
            // TIMEOUT
            // =================================================

            if (
                action ===
                "timeout"
            ) {

                const minutes =
                    interaction.options.getInteger(
                        "minutes"
                    );


                const duration =
                    minutes *
                    60 *
                    1000;


                await sendUserDM(

                    target.user,

                    "⏱️ Timeout Notice / Aviso de Timeout",

                    "You have been temporarily restricted from interacting in the LAST SHIFT Discord server.\n\n" +

                    "Has sido restringido temporalmente para interactuar en el servidor de Discord de LAST SHIFT.",

                    target.user.username,

                    reason,

                    minutes

                );


                await target.timeout(

                    duration,

                    `LAST SHIFT | ${reason} | Moderator: ${interaction.user.tag}`

                );


                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "TIMEOUT",

                    user:
                        target.user,

                    moderator:
                        interaction.user,

                    reason,

                    duration:
                        `${minutes} minute(s)`

                });


                return interaction.editReply({

                    content:

                        "⏱️ **Timeout Applied / Timeout Aplicado**\n\n" +

                        `👤 **User / Usuario:** ${target.user.tag}\n` +

                        `⏱️ **Duration / Duración:** ${minutes} minute(s)\n` +

                        `📋 **Reason / Razón:** ${reason}\n\n` +

                        "📩 🇺🇸 The user was notified by DM.\n" +

                        "📩 🇪🇸 El usuario fue notificado por DM."

                });

            }


            // =================================================
            // UNTIMEOUT
            // =================================================

            if (
                action ===
                "untimeout"
            ) {

                await target.timeout(

                    null,

                    `LAST SHIFT | ${reason} | Moderator: ${interaction.user.tag}`

                );


                await sendUserDM(

                    target.user,

                    "🔓 Timeout Removed / Timeout Retirado",

                    "Your temporary restriction has been removed by the LAST SHIFT moderation team.\n\n" +

                    "Tu restricción temporal ha sido retirada por el equipo de moderación de LAST SHIFT.",

                    target.user.username,

                    reason

                );


                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "UNTIMEOUT",

                    user:
                        target.user,

                    moderator:
                        interaction.user,

                    reason

                });


                return interaction.editReply({

                    content:

                        "🔓 **Timeout Removed / Timeout Retirado**\n\n" +

                        `👤 **User / Usuario:** ${target.user.tag}\n` +

                        `📋 **Reason / Razón:** ${reason}`

                });

            }


            return interaction.editReply({

                content:

                    "❌ **Unknown Action / Acción Desconocida**"

            });


        } catch (error) {

            console.error(
                `❌ Moderation error (${action}):`,
                error
            );


            return interaction.editReply({

                content:

                    "❌ **Moderation Failed / Moderación Fallida**\n\n" +

                    "🇺🇸 The action could not be completed. Check the bot's permissions and role hierarchy.\n\n" +

                    "🇪🇸 No se pudo completar la acción. Comprueba los permisos del bot y la jerarquía de roles."

            });

        }

    }

};


// ============================================================
// USER DM
// ============================================================

async function sendUserDM(

    user,

    title,

    description,

    username,

    reason,

    duration = null

) {

    try {

        const embed =
            new EmbedBuilder()

                .setColor(0x5865F2)

                .setTitle(
                    `LAST SHIFT — ${title}`
                )

                .setDescription(
                    `🇺🇸 **${description.split("\n\n")[0]}**\n\n` +
                    `🇪🇸 **${description.split("\n\n")[1] || ""}**`
                )

                .addFields(

                    {
                        name:
                            "User / Usuario",

                        value:
                            `**${username}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "Reason / Razón",

                        value:
                            reason,

                        inline:
                            false
                    }

                );


        if (
            duration
        ) {

            embed.addFields({

                name:
                    "Duration / Duración",

                value:
                    `**${duration} minute(s)**`,

                inline:
                    true

            });

        }


        embed.setFooter({

            text:
                "LAST SHIFT • Official Moderation System"

        });


        embed.setTimestamp();


        await user.send({

            embeds: [
                embed
            ]

        });


        return true;


    } catch (error) {

        if (
            error.code === 50007
        ) {

            console.log(
                `⚠️ Could not DM ${user.tag}.`
            );

            return false;

        }


        console.error(
            "❌ DM moderation error:",
            error
        );


        return false;

    }

}


// ============================================================
// MODERATION LOG
// ============================================================

async function sendLog({

    guild,

    action,

    user,

    userId = null,

    moderator,

    reason,

    duration = null

}) {

    const channelId =
        process.env.MOD_LOG_CHANNEL_ID;


    if (!channelId) {

        console.warn(
            "⚠️ MOD_LOG_CHANNEL_ID is missing from .env"
        );

        return;

    }


    const channel =
        await guild.channels.fetch(
            channelId
        ).catch(
            () => null
        );


    if (!channel) {

        console.warn(
            "⚠️ Moderation log channel not found."
        );

        return;

    }


    const actionInfo = {

        WARN: {
            emoji: "⚠️",
            name: "Warning / Advertencia"
        },

        KICK: {
            emoji: "👢",
            name: "Kick / Expulsión"
        },

        BAN: {
            emoji: "🔨",
            name: "Ban / Baneo"
        },

        TIMEOUT: {
            emoji: "⏱️",
            name: "Timeout"
        },

        UNTIMEOUT: {
            emoji: "🔓",
            name: "Remove Timeout / Retirar Timeout"
        },

        UNBAN: {
            emoji: "🔓",
            name: "Unban / Desbaneo"
        }

    };


    const info =
        actionInfo[action] || {

            emoji:
                "🛡️",

            name:
                action

        };


    const embed =
        new EmbedBuilder()

            .setColor(0x5865F2)

            .setTitle(
                `${info.emoji} Moderation Action / Acción de Moderación`
            )

            .addFields(

                {
                    name:
                        "Action / Acción",

                    value:
                        `**${info.name}**`,

                    inline:
                        true
                },

                {
                    name:
                        "Moderator / Moderador",

                    value:
                        `<@${moderator.id}>`,

                    inline:
                        true
                },

                {
                    name:
                        "User / Usuario",

                    value:
                        user
                            ? `<@${user.id}>`
                            : userId
                                ? `\`${userId}\``
                                : "Unknown / Desconocido",

                    inline:
                        true
                },

                {
                    name:
                        "Reason / Razón",

                    value:
                        reason || "No reason / Sin razón",

                    inline:
                        false
                }

            );


    if (
        duration
    ) {

        embed.addFields({

            name:
                "Duration / Duración",

            value:
                duration,

            inline:
                true

        });

    }


    embed

        .setFooter({

            text:
                "LAST SHIFT • Moderation Logs"

        })

        .setTimestamp();


    await channel.send({

        embeds: [
            embed
        ]

    });

}