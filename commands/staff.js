const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


// ============================================================
// SHIFT // STAFF DIRECTORY
// ============================================================

const FOOTER = "LAST SHIFT // SECURITY SYSTEM";


// ============================================================
// ROLE NAMES
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
// FIND ROLE
// ============================================================

function hasAnyRole(member, roleNames) {

    return member.roles.cache.some(
        role =>
            roleNames.includes(role.name)
    );

}


// ============================================================
// GET MEMBERS
// ============================================================

function getMembersByRole(members, roleNames) {

    return members.filter(
        member =>
            hasAnyRole(member, roleNames)
    );

}


// ============================================================
// FORMAT MEMBERS
// ============================================================

function formatMembers(members) {

    if (!members.length) {

        return "No personnel assigned.";

    }

    return members
        .map(member => {

            return `• ${member}`;

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

        const guild =
            interaction.guild;


        if (!guild) {

            return interaction.reply({

                content:
                    "**SHIFT // ACCESS DENIED**\n\n" +
                    "This command can only be used inside a server.",

                ephemeral: true

            });

        }


        // ====================================================
        // FETCH MEMBERS
        // ====================================================

        let members;

        try {

            await guild.members.fetch();

            members =
                guild.members.cache;

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


        // ====================================================
        // BOT
        // ====================================================

        const botMembers =
            members.filter(
                member =>
                    member.user.bot &&
                    member.user.id === interaction.client.user.id
            );


        // ====================================================
        // STAFF GROUPS
        // ====================================================

        const owners =
            getMembersByRole(
                members,
                ROLE_GROUPS.owner
            )
            .filter(
                member =>
                    !member.user.bot
            );


        const developers =
            getMembersByRole(
                members,
                ROLE_GROUPS.developer
            )
            .filter(
                member =>
                    !member.user.bot
            );


        const moderators =
            getMembersByRole(
                members,
                ROLE_GROUPS.moderator
            )
            .filter(
                member =>
                    !member.user.bot
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
                    "Authorized personnel are classified according " +
                    "to their current server access level."
                )

                .addFields({

                    name: "OWNER",

                    value:
                        formatMembers(owners)

                })

                .addFields({

                    name: "DEVELOPMENT",

                    value:
                        formatMembers(developers)

                })

                .addFields({

                    name: "MODERATION",

                    value:
                        formatMembers(moderators)

                })

                .addFields({

                    name: "SECURITY SYSTEM",

                    value:
                        botMembers.size > 0
                            ? "• SHIFT — Official LAST SHIFT Security System"
                            : "SHIFT — System unavailable."

                })

                .setFooter({

                    text: FOOTER

                })

                .setTimestamp();


        await interaction.reply({

            embeds: [
                embed
            ]

        });

    }

};
