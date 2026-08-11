// ============================================================
// LAST SHIFT
// CENTRAL LOGGING SYSTEM
// ES / EN
// ============================================================

const {
    EmbedBuilder
} = require("discord.js");


// ============================================================
// COLORS
// ============================================================

const COLORS = {

    INFO: 0x5865F2,

    SUCCESS: 0x57F287,

    WARNING: 0xFEE75C,

    DANGER: 0xED4245,

    NEUTRAL: 0x2B2D31

};


// ============================================================
// GET CHANNEL
// ============================================================

async function getLogChannel(
    guild,
    environmentVariable
) {

    const channelId =
        process.env[environmentVariable];


    if (!channelId) {

        console.warn(
            `⚠️ ${environmentVariable} is missing from .env`
        );

        return null;

    }


    const channel =
        await guild.channels.fetch(
            channelId
        ).catch(
            () => null
        );


    if (!channel) {

        console.warn(
            `⚠️ Log channel not found: ${environmentVariable}`
        );

        return null;

    }


    if (
        !channel.isTextBased()
    ) {

        console.warn(
            `⚠️ ${environmentVariable} is not a text channel.`
        );

        return null;

    }


    return channel;

}


// ============================================================
// SEND EMBED
// ============================================================

async function sendLog(
    guild,
    environmentVariable,
    embed
) {

    try {

        const channel =
            await getLogChannel(
                guild,
                environmentVariable
            );


        if (!channel) {

            return false;

        }


        await channel.send({

            embeds: [
                embed
            ]

        });


        return true;

    } catch (error) {

        console.error(
            `❌ Error sending log to ${environmentVariable}:`,
            error
        );

        return false;

    }

}


// ============================================================
// MEMBER JOIN
// ============================================================

async function logMemberJoin(
    member
) {

    const embed =
        new EmbedBuilder()

            .setColor(
                COLORS.SUCCESS
            )

            .setTitle(
                "📥 Member Joined / Miembro Ingresó"
            )

            .setDescription(

                "🇺🇸 A new member has joined the server.\n" +

                "🇪🇸 Un nuevo miembro ha ingresado al servidor."

            )

            .addFields(

                {
                    name:
                        "User / Usuario",

                    value:
                        `${member.user} \n\`${member.user.tag}\``,

                    inline:
                        true
                },

                {
                    name:
                        "User ID / ID",

                    value:
                        `\`${member.id}\``,

                    inline:
                        true
                },

                {
                    name:
                        "Account Created / Cuenta Creada",

                    value:
                        `<t:${Math.floor(
                            member.user.createdTimestamp / 1000
                        )}:F>`,

                    inline:
                        false
                }

            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    size: 256
                })
            )

            .setFooter({

                text:
                    "LAST SHIFT • Member Logs"

            })

            .setTimestamp();


    return sendLog(

        member.guild,

        "MEMBER_LOG_CHANNEL_ID",

        embed

    );

}


// ============================================================
// MEMBER LEAVE
// ============================================================

async function logMemberLeave(
    member
) {

    const embed =
        new EmbedBuilder()

            .setColor(
                COLORS.DANGER
            )

            .setTitle(
                "📤 Member Left / Miembro Salió"
            )

            .setDescription(

                "🇺🇸 A member has left the server.\n" +

                "🇪🇸 Un miembro ha salido del servidor."

            )

            .addFields(

                {
                    name:
                        "User / Usuario",

                    value:
                        `${member.user} \n\`${member.user.tag}\``,

                    inline:
                        true
                },

                {
                    name:
                        "User ID / ID",

                    value:
                        `\`${member.id}\``,

                    inline:
                        true
                }

            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    size: 256
                })
            )

            .setFooter({

                text:
                    "LAST SHIFT • Member Logs"

            })

            .setTimestamp();


    return sendLog(

        member.guild,

        "MEMBER_LOG_CHANNEL_ID",

        embed

    );

}


// ============================================================
// MESSAGE DELETE
// ============================================================

async function logMessageDelete(
    message
) {

    if (
        !message.guild
    ) {

        return false;

    }


    if (
        message.author?.bot
    ) {

        return false;

    }


    let content =
        message.content || "";


    if (
        !content
    ) {

        content =
            "No text content available / No había contenido de texto.";

    }


    if (
        content.length > 1024
    ) {

        content =
            content.substring(
                0,
                1021
            ) +
            "...";

    }


    const embed =
        new EmbedBuilder()

            .setColor(
                COLORS.DANGER
            )

            .setTitle(
                "🗑️ Message Deleted / Mensaje Eliminado"
            )

            .addFields(

                {
                    name:
                        "Author / Autor",

                    value:
                        message.author
                            ? `${message.author}\n\`${message.author.tag}\``
                            : "Unknown / Desconocido",

                    inline:
                        true
                },

                {
                    name:
                        "Channel / Canal",

                    value:
                        `${message.channel}`,

                    inline:
                        true
                },

                {
                    name:
                        "Message ID / ID del Mensaje",

                    value:
                        `\`${message.id}\``,

                    inline:
                        false
                },

                {
                    name:
                        "Content / Contenido",

                    value:
                        content,

                    inline:
                        false
                }

            )

            .setFooter({

                text:
                    "LAST SHIFT • Message Logs"

            })

            .setTimestamp();


    return sendLog(

        message.guild,

        "MESSAGE_LOG_CHANNEL_ID",

        embed

    );

}


// ============================================================
// MESSAGE UPDATE
// ============================================================

async function logMessageUpdate(
    oldMessage,
    newMessage
) {

    if (
        !newMessage.guild
    ) {

        return false;

    }


    if (
        newMessage.author?.bot
    ) {

        return false;

    }


    const oldContent =
        oldMessage.content || "";


    const newContent =
        newMessage.content || "";


    if (
        oldContent ===
        newContent
    ) {

        return false;

    }


    let oldText =
        oldContent ||
        "No content / Sin contenido";


    let newText =
        newContent ||
        "No content / Sin contenido";


    if (
        oldText.length > 900
    ) {

        oldText =
            oldText.substring(
                0,
                897
            ) +
            "...";

    }


    if (
        newText.length > 900
    ) {

        newText =
            newText.substring(
                0,
                897
            ) +
            "...";

    }


    const embed =
        new EmbedBuilder()

            .setColor(
                COLORS.WARNING
            )

            .setTitle(
                "✏️ Message Edited / Mensaje Editado"
            )

            .addFields(

                {
                    name:
                        "Author / Autor",

                    value:
                        newMessage.author
                            ? `${newMessage.author}\n\`${newMessage.author.tag}\``
                            : "Unknown / Desconocido",

                    inline:
                        true
                },

                {
                    name:
                        "Channel / Canal",

                    value:
                        `${newMessage.channel}`,

                    inline:
                        true
                },

                {
                    name:
                        "Message ID / ID del Mensaje",

                    value:
                        `\`${newMessage.id}\``,

                    inline:
                        false
                },

                {
                    name:
                        "Before / Antes",

                    value:
                        oldText,

                    inline:
                        false
                },

                {
                    name:
                        "After / Después",

                    value:
                        newText,

                    inline:
                        false
                }

            )

            .setFooter({

                text:
                    "LAST SHIFT • Message Logs"

            })

            .setTimestamp();


    return sendLog(

        newMessage.guild,

        "MESSAGE_LOG_CHANNEL_ID",

        embed

    );

}


// ============================================================
// MEMBER NICKNAME / ROLE UPDATE
// ============================================================

async function logMemberUpdate(
    oldMember,
    newMember
) {

    const changes = [];


    // ========================================================
    // NICKNAME
    // ========================================================

    if (
        oldMember.nickname !==
        newMember.nickname
    ) {

        changes.push({

            name:
                "Nickname / Apodo",

            value:

                `🇺🇸 Before: **${oldMember.nickname || oldMember.user.username}**\n` +

                `🇪🇸 Antes: **${oldMember.nickname || oldMember.user.username}**\n\n` +

                `🇺🇸 After: **${newMember.nickname || newMember.user.username}**\n` +

                `🇪🇸 Después: **${newMember.nickname || newMember.user.username}**`

        });

    }


    // ========================================================
    // ROLES
    // ========================================================

    const oldRoles =
        oldMember.roles.cache;


    const newRoles =
        newMember.roles.cache;


    const addedRoles =
        newRoles.filter(
            role =>
                !oldRoles.has(
                    role.id
                )
        );


    const removedRoles =
        oldRoles.filter(
            role =>
                !newRoles.has(
                    role.id
                )
        );


    if (
        addedRoles.size > 0
    ) {

        changes.push({

            name:
                "Roles Added / Roles Añadidos",

            value:
                addedRoles
                    .map(
                        role =>
                            `${role}`
                    )
                    .join(", ")

        });

    }


    if (
        removedRoles.size > 0
    ) {

        changes.push({

            name:
                "Roles Removed / Roles Retirados",

            value:
                removedRoles
                    .map(
                        role =>
                            `${role}`
                    )
                    .join(", ")

        });

    }


    if (
        changes.length === 0
    ) {

        return false;

    }


    const embed =
        new EmbedBuilder()

            .setColor(
                COLORS.INFO
            )

            .setTitle(
                "🔄 Member Updated / Miembro Actualizado"
            )

            .setDescription(

                `🇺🇸 Changes detected for ${newMember.user}.\n` +

                `🇪🇸 Se detectaron cambios en ${newMember.user}.`

            )

            .addFields(

                {
                    name:
                        "User / Usuario",

                    value:
                        `${newMember.user}\n\`${newMember.user.tag}\``,

                    inline:
                        true
                },

                {
                    name:
                        "User ID / ID",

                    value:
                        `\`${newMember.id}\``,

                    inline:
                        true
                },

                ...changes

            )

            .setThumbnail(
                newMember.user.displayAvatarURL({
                    size: 256
                })
            )

            .setFooter({

                text:
                    "LAST SHIFT • Member Logs"

            })

            .setTimestamp();


    return sendLog(

        newMember.guild,

        "MEMBER_LOG_CHANNEL_ID",

        embed

    );

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    sendLog,

    logMemberJoin,

    logMemberLeave,

    logMessageDelete,

    logMessageUpdate,

    logMemberUpdate

};