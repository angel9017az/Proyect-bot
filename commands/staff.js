const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


// ============================================================
// SHIFT // STAFF DIRECTORY
// ============================================================

const FOOTER = "LAST SHIFT // SECURITY SYSTEM";


// ============================================================
// ROLE GROUPS
// ============================================================

const ROLE_GROUPS = {

    owner: [
        "Owner",
        "OWNER"
    ],

    developer: [
        "Dev's",
        "Dev",
        "Developer",
        "Developers",
        "DEV"
    ],

    moderator: [
        "Moderator",
        "Moderators",
        "MOD",
        "Mod"
    ]

};


// ============================================================
// CHECK ROLE
// ============================================================

function hasAnyRole(member, roleNames) {

    return member.roles.cache.some(
        role => roleNames.includes(role.name)
    );

}


// ============================================================
// GET MEMBERS
// ============================================================

function getMembersByRole(members, roleNames) {

    return members.filter(member => {

        // SHIFT no puede aparecer como staff humano
        if (member.user.bot) {
            return false;
        }

        return hasAnyRole(member, roleNames);

    });

}


// ============================================================
// FORMAT MEMBERS
// ============================================================

function formatMembers(members) {

    if (!members || members.size === 0) {

        return "No personnel assigned.";

    }

    return [...members.values()]
        .map(member => {

            return `• <@${member.id}>`;

        })
        .join("\n");

}


// ============================================================
// COMMAND
// ============================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("staff")

        .setDescription(
            "View the official LAST SHIFT staff directory."
        ),


    async execute(interaction) {

        // ====================================================
        // SERVER CHECK
        // ====================================================

        if (!interaction.guild) {

            return interaction.reply({

                content:
                    "**SHIFT // ACCESS DENIED**\n\n" +
                    "This command can only be used inside a server.",

                ephemeral: true

            });

        }


        const guild = interaction.guild;


        // ====================================================
        // FETCH MEMBERS
        // ====================================================

        try {

            await guild.members.fetch();

        } catch (error) {

            console.error(
                "SHIFT // Staff member fetch error:",
                error
            );

            return interaction.reply({

                content:
                    "**SHIFT // SYSTEM ERROR**\n\n" +
                    "The staff directory could not be loaded.",

                ephemeral: true

            });

        }


        const members =
            guild.members.cache;


        // ====================================================
        // SHIFT BOT
        // ====================================================

        const shift =
            members.get(
                interaction.client.user.id
            );


        // ====================================================
        // STAFF GROUPS
        // ====================================================

        const owners =
            getMembersByRole(
                members,
                ROLE_GROUPS.owner
            );


        const developers =
            getMembersByRole(
                members,
                ROLE_GROUPS.developer
            );


        const moderators =
            getMembersByRole(
                members,
                ROLE_GROUPS.moderator
            );


        // ====================================================
        // EMBED
        // ====================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x5865F2)

                .setTitle(
                    "LAST SHIFT // STAFF"
                )

                .setDescription(
                    "Official personnel directory of LAST SHIFT.\n\n" +
                    "Personnel are classified according to their " +
                    "current authorization level."
                )

                .addFields({

                    name: "OWNER",

                    value:
                        formatMembers(owners),

                    inline: false

                })

                .addFields({

                    name: "DEVELOPMENT",

                    value:
                        formatMembers(developers),

                    inline: false

                })

                .addFields({

                    name: "MODERATION",

                    value:
                        formatMembers(moderators),

                    inline: false

                })

                .addFields({

                    name: "SECURITY SYSTEM",

                    value:
                        shift
                            ? `• <@${shift.id}> — Official LAST SHIFT Security System`
                            : "SHIFT — System unavailable.",

                    inline: false

                })

                .setFooter({

                    text: FOOTER

                })

                .setTimestamp();


        // ====================================================
        // SEND
        // ====================================================

        await interaction.reply({

            embeds: [
                embed
            ]

        });

    }

};
