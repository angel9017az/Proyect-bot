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
  EmbedBuilder,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ============================================================
// ENVIRONMENT & VOICE CONFIG
// ============================================================

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

const VOICE_CREATOR_CHANNEL_ID = process.env.VOICE_CREATOR_CHANNEL_ID || "ID_CANAL_CREADOR_AQUI";
const VOICE_CATEGORY_ID = process.env.VOICE_CATEGORY_ID || "ID_CATEGORIA_AQUI";

// Estructuras de control para voz
const tempChannels = new Map(); // channelId -> ownerId
const deletionTimers = new Map(); // channelId -> timeoutId
const dailyVoiceUsage = new Map(); // userId -> { count, lastReset }

function checkVoiceLimit(userId) {
  const today = new Date().toDateString();
  const userStats = dailyVoiceUsage.get(userId) || { count: 0, lastReset: today };

  if (userStats.lastReset !== today) {
    userStats.count = 0;
    userStats.lastReset = today;
  }

  if (userStats.count >= 2) return false;

  userStats.count += 1;
  dailyVoiceUsage.set(userId, userStats);
  return true;
}

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

const { handleAutoResponse } = require("./systems/autoresponse");
const { handleAutoMod } = require("./systems/automod");

// ============================================================
// CLIENT
// ============================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
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

    client.commands.set(command.data.name, command);

    console.log(`SHIFT // Command loaded: /${command.data.name}`);
  } catch (error) {
    console.error(`SHIFT // Failed to load ${file}:`, error);
  }
}

// ============================================================
// READY
// ============================================================

client.once(Events.ClientReady, readyClient => {
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
  console.log("Temp Voice System: ONLINE (Modal Mode)");
  console.log("Environment: RAILWAY");
  console.log("==========================================");
  console.log("");
});

// ============================================================
// MEMBER JOIN
// ============================================================

client.on(Events.GuildMemberAdd, async member => {
  try {
    if (GUILD_ID && member.guild.id !== GUILD_ID) return;

    await logMemberJoin(member);

    if (WELCOME_CHANNEL_ID) {
      const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

      if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
          .setColor("#00ffb3")
          .setTitle("🛡️ REGISTRO DE INGRESO // ACCESS CONTROL")
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
            { name: "👤 USER", value: `${member}`, inline: true },
            { name: "🆔 USER IDENTIFIER", value: `\`${member.id}\``, inline: true },
            { name: "📋 ACCESS RECORD", value: `\`#${member.guild.memberCount}\``, inline: true },
            { name: "🔐 ACCESS STATUS", value: "`PENDING VERIFICATION`", inline: false }
          )
          .setFooter({
            text: "SHIFT // SECURITY NETWORK • CONNECTION ESTABLISHED",
            iconURL: member.guild.iconURL()
          })
          .setTimestamp();

        await welcomeChannel.send({
          content: `🟢 **SHIFT // ACCESS DETECTED**\n${member}`,
          embeds: [welcomeEmbed]
        });
      }
    }

    const verifyCommand = client.commands.get("verify");
    if (verifyCommand && typeof verifyCommand.restoreVerification === "function") {
      const restored = await verifyCommand.restoreVerification(member);
      if (restored) console.log(`SHIFT // Verification restored: ${member.user.tag}`);
    }
  } catch (error) {
    console.error("SHIFT // Member join error:", error);
  }
});

// ============================================================
// MEMBER LEAVE
// ============================================================

client.on(Events.GuildMemberRemove, async member => {
  try {
    if (GUILD_ID && member.guild.id !== GUILD_ID) return;
    await logMemberLeave(member);
  } catch (error) {
    console.error("SHIFT // Member leave error:", error);
  }
});

// ============================================================
// MEMBER UPDATE
// ============================================================

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    if (GUILD_ID && newMember.guild.id !== GUILD_ID) return;
    await logMemberUpdate(oldMember, newMember);

    const boosterRole = newMember.guild.roles.cache.get(BOOSTER_ROLE_ID);
    if (!boosterRole) return;

    if (!oldMember.premiumSince && newMember.premiumSince) {
      if (!newMember.roles.cache.has(BOOSTER_ROLE_ID)) {
        await newMember.roles.add(boosterRole, "SHIFT // Server Boost detected");
      }
      return;
    }

    if (oldMember.premiumSince && !newMember.premiumSince) {
      if (newMember.roles.cache.has(BOOSTER_ROLE_ID)) {
        await newMember.roles.remove(boosterRole, "SHIFT // Server Boost removed");
      }
    }
  } catch (error) {
    console.error("SHIFT // Member update error:", error);
  }
});

// ============================================================
// TEMPORARY VOICE SYSTEM
// ============================================================

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    if (GUILD_ID && newState.guild.id !== GUILD_ID) return;

    // 1. EL USUARIO ENTRA AL CANAL CREADOR DE VOZ
    if (newState.channelId === VOICE_CREATOR_CHANNEL_ID) {
      const member = newState.member;
      const creatorChannel = newState.channel;

      // Verificar límite de 2 creaciones diarias
      if (!checkVoiceLimit(member.id)) {
        await member.voice.disconnect().catch(() => null);
        return creatorChannel.send({
          content: `⚠️ ${member}, has alcanzado el límite máximo de **2 canales de voz** creados por día.`
        }).then(msg => setTimeout(() => msg.delete().catch(() => null), 10000));
      }

      // Enviar mensaje en el chat del canal de voz con botón para configurar
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`setup_vc_${member.id}`)
          .setLabel("⚙️ Configurar y Crear Canal")
          .setStyle(ButtonStyle.Success)
      );

      await creatorChannel.send({
        content: `👋 ${member}, presiona el botón para elegir el **nombre** y **límite de usuarios** de tu sala:`,
        components: [row]
      }).then(msg => setTimeout(() => msg.delete().catch(() => null), 30000));
    }

    // 2. GESTIÓN DE INACTIVIDAD (30 MINUTOS SIN USUARIOS)
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      const oldChannel = oldState.channel;

      if (oldChannel && tempChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
        // Temporizador de 30 minutos
        const timer = setTimeout(async () => {
          if (oldChannel && oldChannel.members.size === 0) {
            tempChannels.delete(oldChannel.id);
            deletionTimers.delete(oldChannel.id);
            await oldChannel.delete().catch(() => null);
          }
        }, 30 * 60 * 1000);

        deletionTimers.set(oldChannel.id, timer);
      }
    }

    // Cancelar borrado si entra alguien antes de los 30 min
    if (newState.channelId && tempChannels.has(newState.channelId)) {
      const currentChannel = newState.channel;
      if (currentChannel.members.size > 0 && deletionTimers.has(currentChannel.id)) {
        clearTimeout(deletionTimers.get(currentChannel.id));
        deletionTimers.delete(currentChannel.id);
      }
    }

  } catch (error) {
    console.error("SHIFT // VoiceStateUpdate error:", error);
  }
});

// ============================================================
// MESSAGE CREATE (AUTOMOD + AUTORESPONSE)
// ============================================================

client.on(Events.MessageCreate, async message => {
  try {
    if (!message.guild || message.author.bot) return;
    if (GUILD_ID && message.guild.id !== GUILD_ID) return;

    const blocked = await handleAutoMod(message);
    if (blocked) return;

    await handleAutoResponse(message);
  } catch (error) {
    console.error("SHIFT // MessageCreate error:", error);
  }
});

// ============================================================
// MESSAGE DELETE / UPDATE
// ============================================================

client.on(Events.MessageDelete, async message => {
  try {
    if (!message.guild) return;
    if (GUILD_ID && message.guild.id !== GUILD_ID) return;
    await logMessageDelete(message);
  } catch (error) {
    console.error("SHIFT // Message delete error:", error);
  }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  try {
    if (!newMessage.guild) return;
    if (GUILD_ID && newMessage.guild.id !== GUILD_ID) return;
    await logMessageUpdate(oldMessage, newMessage);
  } catch (error) {
    console.error("SHIFT // Message update error:", error);
  }
});

// ============================================================
// INTERACTIONS
// ============================================================

client.on(Events.InteractionCreate, async interaction => {
  try {

    // 1. PRESIONAR EL BOTÓN EN EL CANAL CREADOR
    if (interaction.isButton() && interaction.customId.startsWith("setup_vc_")) {
      const ownerId = interaction.customId.split("_")[2];

      if (interaction.user.id !== ownerId) {
        return interaction.reply({
          content: "❌ Este botón solo puede ser usado por la persona que entró al canal.",
          flags: MessageFlags.Ephemeral
        });
      }

      // Abrir ventana emergente (Modal)
      const modal = new ModalBuilder()
        .setCustomId("modal_create_vc")
        .setTitle("Configurar Canal de Voz");

      const nameInput = new TextInputBuilder()
        .setCustomId("vc_name")
        .setLabel("Nombre del canal de voz")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej. Sala de Juegos")
        .setRequired(true);

      const limitInput = new TextInputBuilder()
        .setCustomId("vc_limit")
        .setLabel("Límite de usuarios (0 para sin límite)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("0 - 99")
        .setValue("0")
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(limitInput)
      );

      return await interaction.showModal(modal);
    }

    // 2. ENVIAR EL FORMULARIO (MODAL SUBMIT)
    if (interaction.isModalSubmit() && interaction.customId === "modal_create_vc") {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const name = interaction.fields.getTextInputValue("vc_name");
      let limit = parseInt(interaction.fields.getTextInputValue("vc_limit"), 10);

      if (isNaN(limit) || limit < 0 || limit > 99) limit = 0;

      const member = interaction.member;
      const guild = interaction.guild;

      // Crear el canal de voz personalizado
      const tempChannel = await guild.channels.create({
        name: `🔊 ${name}`,
        type: ChannelType.GuildVoice,
        userLimit: limit,
        parent: VOICE_CATEGORY_ID || interaction.channel.parentId,
        permissionOverwrites: [
          {
            id: member.id,
            allow: ["ManageChannels", "MuteMembers", "DeafenMembers", "Connect"]
          }
        ]
      });

      tempChannels.set(tempChannel.id, member.id);

      // Mover al usuario a su nuevo canal si sigue en voz
      if (member.voice.channel) {
        await member.voice.setChannel(tempChannel);
      }

      return await interaction.editReply({
        content: `✅ ¡Canal creado con éxito! Te hemos movido a **${tempChannel.name}**.`
      });
    }

    // BUTTONS DE OTROS SISTEMAS
    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith("help_")) {
        const command = client.commands.get("help");
        if (command && typeof command.handleButton === "function") await command.handleButton(interaction);
        return;
      }

      if (customId === "verify_start" || customId === "verify_check") {
        const command = client.commands.get("verify");
        if (command && typeof command.handleButton === "function") await command.handleButton(interaction);
        return;
      }

      if (customId === "open_suggestion_modal") {
        const command = client.commands.get("suggest");
        if (command && typeof command.handleButton === "function") await command.handleButton(interaction);
        return;
      }

      if (customId.startsWith("suggest_status_")) {
        const command = client.commands.get("suggest");
        if (command && typeof command.handleStatusButton === "function") await command.handleStatusButton(interaction);
        return;
      }

      if (customId === "open_report_modal") {
        const command = client.commands.get("report");
        if (command && typeof command.handleButton === "function") await command.handleButton(interaction);
        return;
      }

      if (customId.startsWith("report_status_")) {
        const command = client.commands.get("report");
        if (command && typeof command.handleStatusButton === "function") await command.handleStatusButton(interaction);
        return;
      }

      if (customId.startsWith("giveaway_join_")) {
        const command = client.commands.get("giveaway");
        if (command && typeof command.handleButton === "function") await command.handleButton(interaction);
        return;
      }
    }

    // OTROS MODALS
    if (interaction.isModalSubmit()) {
      const customId = interaction.customId;

      if (customId === "verify_username_modal") {
        const command = client.commands.get("verify");
        if (command && typeof command.handleModal === "function") await command.handleModal(interaction);
        return;
      }

      if (customId === "suggestion_modal") {
        const command = client.commands.get("suggest");
        if (command && typeof command.handleModal === "function") await command.handleModal(interaction);
        return;
      }

      if (customId === "report_modal") {
        const command = client.commands.get("report");
        if (command && typeof command.handleModal === "function") await command.handleModal(interaction);
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({
        content: "**SHIFT // COMMAND UNAVAILABLE**\n\nThe requested command could not be found.",
        flags: MessageFlags.Ephemeral
      });
    }

    await command.execute(interaction);
  } catch (error) {
    console.error("SHIFT // Interaction error:", error);
  }
});

// ============================================================
// PROCESS ERRORS & LOGIN
// ============================================================

process.on("unhandledRejection", error => {
  console.error("SHIFT // Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("SHIFT // Uncaught Exception:", error);
});

if (!TOKEN) {
  console.error("SHIFT // DISCORD_TOKEN is missing.");
  process.exit(1);
}

client.login(TOKEN)
  .then(() => console.log("SHIFT // Authentication request sent."))
  .catch(error => {
    console.error("SHIFT // Discord authentication failed:", error);
    process.exit(1);
  });
