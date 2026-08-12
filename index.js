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
  Events,
  MessageFlags,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ============================================================
// ENVIRONMENT
// ============================================================

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

// ============================================================
// ROLES
// ============================================================

const BOOSTER_ROLE_ID = "1537221057134592100";

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
// SYSTEMS
// ============================================================

const {
  handleAutoResponse
} = require("./systems/autoresponse");

const {
  handleAutoMod
} = require("./systems/automod");

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

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.error("SHIFT // Commands directory not found.");
  process.exit(1);
}

// ============================================================
// LOAD COMMANDS
// ============================================================

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const filePath = path.join(commandsPath, file);

  try {

    const command = require(filePath);

    if (!command.data || !command.execute) {
      console.warn(`SHIFT // Invalid command: ${file}`);
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
    console.log("==========================================");
    console.log("SHIFT // SECURITY SYSTEM");
    console.log("System: ONLINE");
    console.log(`Identity: ${readyClient.user.tag}`);
    console.log(`Servers: ${readyClient.guilds.cache.size}`);
    console.log(`Commands: ${client.commands.size}`);
    console.log("Logging System: ONLINE");
    console.log("Booster System: ONLINE");
    console.log("AutoMod System: ONLINE");
    console.log("AutoResponse System: ONLINE");
    console.log("Environment: RAILWAY");
    console.log("==========================================");
    console.log("");

  }
);

// ============================================================
// MEMBER JOIN
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

      // MEMBER LOG
      await logMemberJoin(member);

      // ======================================================
      // WELCOME
      // ======================================================

      if (WELCOME_CHANNEL_ID) {

        const welcomeChannel =
          member.guild.channels.cache.get(
            WELCOME_CHANNEL_ID
          );

        if (welcomeChannel) {

          const welcomeEmbed =
            new EmbedBuilder()

              .setColor("#00ffb3")

              .setTitle(
                "🛡️ REGISTRO DE INGRESO // ACCESS CONTROL"
              )

              .setThumbnail(
                member.user.displayAvatarURL({
                  dynamic: true,
                  size: 256
                })
              )

              .setDescription(

                `🟢 **NUEVO ACCESO DETECTADO**\n\n` +

                `🇪🇸 **Estimado/a ${member}, bienvenido/a a ${member.guild.name}.**\n\n` +

                `Se ha establecido una nueva conexión con la comunidad. ` +
                `Para obtener acceso completo, revisa el reglamento ` +
                `y completa el proceso de verificación correspondiente.\n\n` +

                `🇺🇸 **Welcome to ${member.guild.name}, ${member}.**\n\n` +

                `A new connection has been established with the community. ` +
                `Please review the community guidelines and complete ` +
                `the required verification process.`

              )

              .addFields(

                {
                  name: "👤 USER",
                  value: `${member}`,
                  inline: true
                },

                {
                  name: "🆔 USER IDENTIFIER",
                  value: `\`${member.id}\``,
                  inline: true
                },

                {
                  name: "📋 ACCESS RECORD",
                  value: `\`#${member.guild.memberCount}\``,
                  inline: true
                },

                {
                  name: "🔐 ACCESS STATUS",
                  value: "`PENDING VERIFICATION`",
                  inline: false
                }

              )

              .setFooter({
                text:
                  "SHIFT // SECURITY NETWORK • CONNECTION ESTABLISHED",
                iconURL:
                  member.guild.iconURL()
              })

              .setTimestamp();

          await welcomeChannel.send({

            content:
              `🟢 **SHIFT // ACCESS DETECTED**\n${member}`,

            embeds: [welcomeEmbed]

          });

        }
      }

      // ======================================================
      // VERIFICATION RESTORATION
      // ======================================================

      const verifyCommand =
        client.commands.get("verify");

      if (
        verifyCommand &&
        typeof verifyCommand.restoreVerification ===
        "function"
      ) {

        const restored =
          await verifyCommand.restoreVerification(
            member
          );

        if (restored) {

          console.log(
            `SHIFT // Verification restored: ${member.user.tag}`
          );

        }
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
// ROLES / NICKNAME / BOOST
// ============================================================

client.on(
  Events.GuildMemberUpdate,
  async (oldMember, newMember) => {

    try {

      if (
        GUILD_ID &&
        newMember.guild.id !== GUILD_ID
      ) {
        return;
      }

      // NORMAL LOGGING
      await logMemberUpdate(
        oldMember,
        newMember
      );

      // ======================================================
      // BOOSTER SYSTEM
      // ======================================================

      const boosterRole =
        newMember.guild.roles.cache.get(
          BOOSTER_ROLE_ID
        );

      if (!boosterRole) {

        console.error(
          `SHIFT // Booster role not found: ${BOOSTER_ROLE_ID}`
        );

        return;
      }

      // BOOST STARTED

      if (
        !oldMember.premiumSince &&
        newMember.premiumSince
      ) {

        if (
          !newMember.roles.cache.has(
            BOOSTER_ROLE_ID
          )
        ) {

          await newMember.roles.add(
            boosterRole,
            "SHIFT // Server Boost detected"
          );

        }

        console.log(
          `SHIFT // Booster activated: ${newMember.user.tag}`
        );

        return;
      }

      // BOOST REMOVED

      if (
        oldMember.premiumSince &&
        !newMember.premiumSince
      ) {

        if (
          newMember.roles.cache.has(
            BOOSTER_ROLE_ID
          )
        ) {

          await newMember.roles.remove(
            boosterRole,
            "SHIFT // Server Boost removed"
          );

        }

        console.log(
          `SHIFT // Booster removed: ${newMember.user.tag}`
        );

      }

    } catch (error) {

      console.error(
        "SHIFT // Member update error:",
        error
      );

    }

  }
);

// ============================================================
// MESSAGE CREATE
// AUTOMOD + AUTORESPONSE
// ============================================================

client.on(
  Events.MessageCreate,
  async message => {

    try {

      if (
        !message.guild ||
        message.author.bot
      ) {
        return;
      }

      if (
        GUILD_ID &&
        message.guild.id !== GUILD_ID
      ) {
        return;
      }

      // AUTOMOD

      const blocked =
        await handleAutoMod(
          message
        );

      if (blocked) {
        return;
      }

      // AUTORESPONSE

      await handleAutoResponse(
        message
      );

    } catch (error) {

      console.error(
        "SHIFT // MessageCreate error:",
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

      await logMessageDelete(
        message
      );

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
  async (oldMessage, newMessage) => {

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

      // ======================================================
      // BUTTONS
      // ======================================================

      if (interaction.isButton()) {

        const customId =
          interaction.customId;

        // HELP

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

        // VERIFICATION

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

        // SUGGESTIONS

        if (
          customId ===
          "open_suggestion_modal"
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

        // SUGGESTION STATUS

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

        // REPORT

        if (
          customId ===
          "open_report_modal"
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

        // REPORT STATUS

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

        // GIVEAWAY

        if (
          customId.startsWith(
            "giveaway_join_"
          )
        ) {

          const command =
            client.commands.get(
              "giveaway"
            );

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

      }

      // ======================================================
      // MODALS
      // ======================================================

      if (interaction.isModalSubmit()) {

        const customId =
          interaction.customId;

        // VERIFICATION

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
            typeof command.handleModal ===
            "function"
          ) {

            await command.handleModal(
              interaction
            );

          }

          return;
        }

        // SUGGESTION

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
            typeof command.handleModal ===
            "function"
          ) {

            await command.handleModal(
              interaction
            );

          }

          return;
        }

        // REPORT

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

      // ======================================================
      // SLASH COMMANDS
      // ======================================================

      if (
        !interaction.isChatInputCommand()
      ) {
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

          flags:
            MessageFlags.Ephemeral

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

      try {

        const response = {

          content:
            "**SHIFT // SYSTEM ERROR**\n\n" +
            "The requested operation could not be completed.",

          flags:
            MessageFlags.Ephemeral

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
