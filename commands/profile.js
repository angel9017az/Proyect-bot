const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Consulta el perfil de seguridad de un miembro.")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Miembro cuyo perfil desea consultar.")
                .setRequired(false)
        ),

    async execute(interaction) {

        // ============================================
        // TARGET USER
        // ============================================

        const target =
            interaction.options.getUser("user") ||
            interaction.user;


        // ============================================
        // MEMBER
        // ============================================

        const member =
            await interaction.guild.members
                .fetch(target.id)
                .catch(() => null);


        // ============================================
        // ROLE DETECTION
        // ============================================

        const hasRole = roleName => {

            if (!member) {
                return false;
            }

            return member.roles.cache.some(
                role => role.name === roleName
            );

        };


        // ============================================
        // CLASSIFICATION
        // ============================================

        let classification = "STANDARD USER";

        let classificationDescription =
            "No special authorization has been detected for this account.";

        let accessLevel = "STANDARD";


        // ============================================
        // SHIFT
        // HIGHEST PRIORITY
        // ============================================

        if (hasRole("Shift")) {

            classification = "SHIFT";

            classificationDescription =
                "Official Security System account of LAST SHIFT.";

            accessLevel = "SYSTEM";

        }


        // ============================================
        // OWNER
        // ============================================

        else if (hasRole("Owner")) {

            classification = "SYSTEM OWNER";

            classificationDescription =
                "Primary authority of LAST SHIFT.";

            accessLevel = "ABSOLUTE";

        }


        // ============================================
        // DEVELOPER
        // ============================================

        else if (hasRole("Dev's")) {

            classification = "AUTHORIZED DEVELOPER";

            classificationDescription =
                "Member of the LAST SHIFT development team.";

            accessLevel = "DEVELOPMENT";

        }


        // ============================================
        // VERIFIED
        // ============================================

        else if (hasRole("Verificado")) {

            classification = "VERIFIED MEMBER";

            classificationDescription =
                "Verified member recognized by the LAST SHIFT Security System.";

            accessLevel = "VERIFIED";

        }


        // ============================================
        // ACCOUNT DATA
        // ============================================

        const accountCreated =
            `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`;

        const accountCreatedRelative =
            `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`;


        let joinedServer = "Unavailable";

        if (member && member.joinedTimestamp) {

            joinedServer =
                `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`;

        }


        // ============================================
        // ROLES
        // ============================================

        let roles = "No additional roles";

        if (member) {

            const memberRoles =
                member.roles.cache
                    .filter(role => role.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position);

            if (memberRoles.size > 0) {

                roles =
                    memberRoles
                        .map(role => role.name)
                        .slice(0, 8)
                        .join(", ");

            }

        }


        // ============================================
        // EMBED
        // ============================================

        const embed =
            new EmbedBuilder()

                .setColor("#7A0F16")

                .setAuthor({
                    name: "LAST SHIFT // SECURITY SYSTEM",
                    iconURL:
                        interaction.client.user.displayAvatarURL()
                })

                .setTitle("USER PROFILE")

                .setDescription(
                    "Official security record associated with this Discord account."
                )

                .setThumbnail(
                    target.displayAvatarURL({
                        size: 512,
                        extension: "png"
                    })
                )


                // ====================================
                // IDENTITY
                // ====================================

                .addFields({

                    name: "IDENTITY",

                    value:
                        `**Display Name**\n` +
                        `${target.displayName}\n\n` +

                        `**Username**\n` +
                        `@${target.username}\n\n` +

                        `**Discord ID**\n` +
                        `\`${target.id}\``,

                    inline: true

                })


                // ====================================
                // CLASSIFICATION
                // ====================================

                .addFields({

                    name: "IDENTITY CLASSIFICATION",

                    value:
                        `**${classification}**\n` +
                        `${classificationDescription}\n\n` +

                        `**ACCESS LEVEL**\n` +
                        `${accessLevel}`,

                    inline: true

                })


                // ====================================
                // ACCOUNT INFORMATION
                // ====================================

                .addFields({

                    name: "ACCOUNT INFORMATION",

                    value:
                        `**Account Created**\n` +
                        `${accountCreated}\n` +
                        `${accountCreatedRelative}\n\n` +

                        `**Server Joined**\n` +
                        `${joinedServer}`,

                    inline: false

                })


                // ====================================
                // AUTHORIZED ROLES
                // ====================================

                .addFields({

                    name: "AUTHORIZED ROLES",

                    value:
                        roles,

                    inline: false

                })


                // ====================================
                // SYSTEM NOTICE
                // ====================================

                .addFields({

                    name: "SYSTEM NOTICE",

                    value:
                        classificationDescription,

                    inline: false

                })


                // ====================================
                // FOOTER
                // ====================================

                .setFooter({

                    text:
                        "LAST SHIFT // SECURITY SYSTEM"

                })

                .setTimestamp();


        // ============================================
        // SEND PROFILE
        // ============================================

        return interaction.reply({

            embeds: [embed]

        });

    }

};