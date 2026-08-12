const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  PermissionOverwrites
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("setupserver")

    .setDescription(
      "Configura automáticamente la estructura de LAST SHIFT."
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {

    const guild =
      interaction.guild;

    await interaction.deferReply({
      flags: 64
    });

    // ========================================================
    // CATEGORIES
    // ========================================================

    const categories = [

      {
        name: "📁 INFORMATION",
        channels: [
          {
            name: "📜・welcome",
            type: ChannelType.GuildText
          },
          {
            name: "📜・rules",
            type: ChannelType.GuildText
          },
          {
            name: "📜・announcements",
            type: ChannelType.GuildText
          },
          {
            name: "📜・faq",
            type: ChannelType.GuildText
          }
        ]
      },

      {
        name: "📁 COMMUNITY",
        channels: [
          {
            name: "💬・general",
            type: ChannelType.GuildText
          },
          {
            name: "💬・media",
            type: ChannelType.GuildText
          },
          {
            name: "💡・suggestions",
            type: ChannelType.GuildText
          },
          {
            name: "🎉・giveaways",
            type: ChannelType.GuildText
          }
        ]
      },

      {
        name: "📁 SUPPORT",
        channels: [
          {
            name: "🎫・support",
            type: ChannelType.GuildText
          },
          {
            name: "🚨・reports",
            type: ChannelType.GuildText
          }
        ]
      },

      {
        name: "📁 LAST SHIFT",
        channels: [
          {
            name: "🕹️・game-chat",
            type: ChannelType.GuildText
          },
          {
            name: "📰・game-news",
            type: ChannelType.GuildText
          },
          {
            name: "🧪・testing",
            type: ChannelType.GuildText
          }
        ]
      },

      {
        name: "📁 STAFF",
        channels: [
          {
            name: "🔒・staff-chat",
            type: ChannelType.GuildText
          },
          {
            name: "📋・logs",
            type: ChannelType.GuildText
          },
          {
            name: "🚨・mod-logs",
            type: ChannelType.GuildText
          }
        ]
      }

    ];

    let createdCategories = 0;
    let createdChannels = 0;

    // ========================================================
    // CREATE STRUCTURE
    // ========================================================

    for (
      const categoryData of categories
    ) {

      let category =
        guild.channels.cache.find(
          channel =>
            channel.type ===
            ChannelType.GuildCategory &&
            channel.name ===
            categoryData.name
        );

      if (!category) {

        category =
          await guild.channels.create({

            name:
              categoryData.name,

            type:
              ChannelType.GuildCategory

          });

        createdCategories++;

      }

      // ======================================================
      // CHANNELS
      // ======================================================

      for (
        const channelData of
        categoryData.channels
      ) {

        const existing =
          guild.channels.cache.find(
            channel =>
              channel.parentId ===
                category.id &&
              channel.name ===
                channelData.name
          );

        if (existing) {
          continue;
        }

        await guild.channels.create({

          name:
            channelData.name,

          type:
            channelData.type,

          parent:
            category.id

        });

        createdChannels++;

      }

    }

    // ========================================================
    // RESULT
    // ========================================================

    return interaction.editReply({

      content:
        `🏗️ **SHIFT // SERVER CONFIGURATION COMPLETE**\n\n` +

        `📁 **Categorías creadas:** \`${createdCategories}\`\n` +
        `📜 **Canales creados:** \`${createdChannels}\`\n\n` +

        `El sistema verificó la estructura existente y ` +
        `evitó crear duplicados.\n\n` +

        `\`SHIFT // INFRASTRUCTURE ONLINE\``

    });

  }

};
