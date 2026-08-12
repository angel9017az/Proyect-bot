const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


// ============================================================
// SHIFT // HELP
// ============================================================

const FOOTER = "LAST SHIFT // SECURITY SYSTEM";


// ============================================================
// SYSTEM COMMANDS
// ============================================================

function systemEmbed() {

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("SHIFT // COMMAND CENTER")
        .setDescription(
            "Official command directory for LAST SHIFT.\n\n" +
            "Select a category below to access available system functions."
        )
        .addFields({

            name: "SYSTEM",

            value:
                "`/help` — Open the command center.\n" +
                "`/ping` — Check SHIFT system latency.\n" +
                "`/server` — View server information.\n" +
                "`/status` — View LAST SHIFT system status.\n" +
                "`/links` — View official LAST SHIFT links.\n" +
                "`/profile` — View a member security profile."

        })
        .addFields({

            name: "LAST SHIFT",

            value:
                "`/game` — View official game information.\n" +
                "`/update` — Publish an official game update.\n" +
                "`/announce` — Publish an official announcement."

        })
        .addFields({

            name: "COMMUNITY",

            value:
                "`/suggest` — Submit or manage suggestions.\n" +
                "`/report` — Submit or manage player reports."

        })
        .addFields({

            name: "VERIFICATION",

            value:
                "`/verify` — LAST SHIFT account verification."

        })
        .setFooter({
            text: FOOTER
        })
        .setTimestamp();

}


// ============================================================
// MODERATION
// ============================================================

function moderationEmbed() {

    return new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("SHIFT // MODERATION")
        .setDescription(
            "Authorized moderation commands.\n\n" +
            "These commands require the appropriate staff permissions."
        )
        .addFields({

            name: "MODERATION",

            value:
                "`/moderation ban` — Ban a member.\n" +
                "`/moderation kick` — Remove a member.\n" +
                "`/moderation timeout` — Temporarily restrict a member.\n" +
                "`/moderation untimeout` — Remove an active timeout.\n" +
                "`/moderation unban` — Remove a ban.\n" +
                "`/moderation warn` — Issue a warning."

        })
        .setFooter({
            text: FOOTER
        })
        .setTimestamp();

}


// ============================================================
// STAFF
// ============================================================

function staffEmbed() {

    return new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle("SHIFT // STAFF")
        .setDescription(
            "Official LAST SHIFT staff directory.\n\n" +
            "Use `/staff` to view the current team."
        )
        .addFields({

            name: "STAFF",

            value:
                "`/staff` — View the official staff directory."

        })
        .setFooter({
            text: FOOTER
        })
        .setTimestamp();

}


// ============================================================
// BUTTONS
// ============================================================

function createButtons() {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("help_system")
                .setLabel("System")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("help_moderation")
                .setLabel("Moderation")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("help_staff")
                .setLabel("Staff")
                .setStyle(ButtonStyle.Secondary)

        );

}


// ============================================================
// COMMAND
// ============================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("help")

        .setDescription(
            "Open the official SHIFT command center."
        ),


    async execute(interaction) {

        await interaction.reply({

            embeds: [
                systemEmbed()
            ],

            components: [
                createButtons()
            ]

        });

    },


    // ========================================================
    // BUTTON HANDLER
    // ========================================================

    async handleButton(interaction) {

        let embed;

        switch (interaction.customId) {

            case "help_system":

                embed = systemEmbed();

                break;


            case "help_moderation":

                embed = moderationEmbed();

                break;


            case "help_staff":

                embed = staffEmbed();

                break;


            default:

                return;

        }


        await interaction.update({

            embeds: [
                embed
            ],

            components: [
                createButtons()
            ]

        });

    }

};
