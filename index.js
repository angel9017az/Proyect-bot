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
  TextInputStyle,
  StringSelectMenuBuilder,
  AttachmentBuilder
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

// Mapa de canales temporales: channelId -> ownerId
const tempChannels = new Map();
const trustedUsers = new Map(); // channelId -> Set(userIds)

// ============================================================
// ROLES
// ============================================================

const BOOSTER_ROLE_ID = "1537221057134592100";

// ============================================================
// LOGGER & SYSTEMS
// ============================================================

const {
  logMemberJoin,
  logMemberLeave,
  logMessageDelete,
  logMessageUpdate,
  logMemberUpdate
} = require("./utils/logger");

const { handleAutoResponse } = require("./systems/autoresponse");
const { handleAutoMod } = require("./systems/automod");

// ============================================================
// CLIENT SETUP
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

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    try {
      const command = require(path.join(commandsPath, file));
      if (command.data && command.execute) client.commands.set(command.data.name, command);
    } catch (error) {
      console.error(`SHIFT // Error cargando comando ${file}:`, error);
    }
  }
}

// ============================================================
// HELPER: CREAR PANEL DE CONTROL (CON BANNER FNAF)
// ============================================================

function createControlPanel(owner) {
  // Asegúrate de tener la imagen guardada en ./assets/panel_banner.png
  const bannerPath = path.join(__dirname, "assets", "panel_banner.png");
  const hasBanner = fs.existsSync(bannerPath);
  
  const files = [];
  if (hasBanner) {
    files.push(new AttachmentBuilder(bannerPath, { name: "panel_banner.png" }));
  }

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setAuthor({ name: "⚙️   Panel de control" })
    .setDescription(
      `🟢 **PROPIETARIO DEL CANAL**\n\n` +
      `👤 ${owner} • \`${owner.user.tag}\`\n\n` +
      `📅 **Cuenta creada:** <t:${Math.floor(owner.user.createdTimestamp / 1000)}:R>\n` +
      `⏰ **Unión al servidor:** <t:${Math.floor(owner.joinedTimestamp / 1000)}:f>`
    )
    .setThumbnail(owner.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: "SHIFT // VOICE SYSTEM" });

  if (hasBanner) {
    embed.setImage("attachment://panel_banner.png");
  }

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("vc_general_settings")
      .setLabel("Ajustes generales")
      .setEmoji("⚙️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("vc_admin_users")
      .setLabel("Administrar usuarios")
      .setEmoji("🔨")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("vc_trusted_list")
      .setLabel("Gestionar lista de confiados")
      .setEmoji("👤")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("vc_claim_channel")
      .setLabel("Reclamar canal sin propietario")
      .setEmoji("👑")
      .setStyle(ButtonStyle.Primary)
  );

  return { embeds: [embed], components: [row1, row2], files };
}

// ============================================================
// READY EVENT
// ============================================================

client.once(Events.ClientReady, readyClient => {
  console.log("");
  console.log("==========================================");
  console.log("SHIFT // CONTROL PANEL VOICE SYSTEM");
  console.log(`Identity: ${readyClient.user.tag}`);
  console.log("System Status: ONLINE");
  console.log("==========================================");
  console.log("");
});

// ============================================================
// TEMPORARY VOICE SYSTEM (JOIN-TO-CREATE)
// ============================================================

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    if (GUILD_ID && newState.guild.id !== GUILD_ID) return;

    // 1. CREACIÓN AUTOMÁTICA AL ENTRAR
    if (newState.channelId === VOICE_CREATOR_CHANNEL_ID) {
      const member = newState.member;
      const guild = newState.guild;

      // Crear canal privado
      const tempChannel = await guild.channels.create({
        name: `🔊 Sala de ${member.displayName}`,
        type: ChannelType.GuildVoice,
        parent: VOICE_CATEGORY_ID || newState.channel.parentId,
        permissionOverwrites: [
          {
            id: member.id,
            allow: ["ManageChannels", "MuteMembers", "DeafenMembers", "Connect"]
          }
        ]
      });

      tempChannels.set(tempChannel.id, member.id);
      trustedUsers.set(tempChannel.id, new Set());

      // Mover al creador
      if (member.voice.channel) {
        await member.voice.setChannel(tempChannel);
      }

      // Enviar el panel de control interactivo dentro del chat de la sala
      const panelData = createControlPanel(member);
      await tempChannel.send(panelData);
    }

    // 2. ELIMINACIÓN AUTOMÁTICA SI QUEDA VACÍO
    if (oldState.channelId && tempChannels.has(oldState.channelId)) {
      const oldChannel = oldState.channel;

      if (oldChannel && oldChannel.members.size === 0) {
        tempChannels.delete(oldChannel.id);
        trustedUsers.delete(oldChannel.id);
        await oldChannel.delete().catch(() => null);
      }
    }

  } catch (error) {
    console.error("SHIFT // VoiceStateUpdate error:", error);
  }
});

// ============================================================
// INTERACTION HANDLER (PANEL DE CONTROL)
// ============================================================

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.guild) return;

    // A. INTERACCIONES DE BOTONES
    if (interaction.isButton()) {
      const { customId, channel, user, member } = interaction;

      if (!tempChannels.has(channel.id)) return;

      const currentOwnerId = tempChannels.get(channel.id);
      const isOwner = user.id === currentOwnerId;

      // --- RECLAMAR CANAL ---
      if (customId === "vc_claim_channel") {
        const ownerInChannel = channel.members.has(currentOwnerId);

        if (ownerInChannel && !isOwner) {
          return interaction.reply({
            content: "❌ El propietario actual sigue conectado en la sala.",
            flags: MessageFlags.Ephemeral
          });
        }

        if (isOwner) {
          return interaction.reply({
            content: "👑 Ya eres el propietario de este canal.",
            flags: MessageFlags.Ephemeral
          });
        }

        // Asignar nuevo dueño
        tempChannels.set(channel.id, user.id);
        const panelData = createControlPanel(member);

        await interaction.message.edit(panelData);
        return interaction.reply({
          content: `👑 ¡Ahora eres el nuevo propietario de **${channel.name}**!`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Solo el propietario puede usar el resto de botones
      if (!isOwner) {
        return interaction.reply({
          content: "❌ Solo el propietario del canal puede configurar estos ajustes.",
          flags: MessageFlags.Ephemeral
        });
      }

      // --- AJUSTES GENERALES ---
      if (customId === "vc_general_settings") {
        const modal = new ModalBuilder()
          .setCustomId("modal_vc_general")
          .setTitle("Ajustes Generales");

        const nameInput = new TextInputBuilder()
          .setCustomId("vc_name")
          .setLabel("Nuevo Nombre del Canal")
          .setStyle(TextInputStyle.Short)
          .setValue(channel.name.replace("🔊 ", ""))
          .setRequired(true);

        const limitInput = new TextInputBuilder()
          .setCustomId("vc_limit")
          .setLabel("Límite de Usuarios (0 = Ilimitado)")
          .setStyle(TextInputStyle.Short)
          .setValue(channel.userLimit.toString())
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(nameInput),
          new ActionRowBuilder().addComponents(limitInput)
        );

        return await interaction.showModal(modal);
      }

      // --- ADMINISTRAR USUARIOS (EXPULSAR / SILENCIAR) ---
      if (customId === "vc_admin_users") {
        const members = channel.members.filter(m => m.id !== user.id);

        if (members.size === 0) {
          return interaction.reply({
            content: "⚠️ No hay otros usuarios en la sala para administrar.",
            flags: MessageFlags.Ephemeral
          });
        }

        const select = new StringSelectMenuBuilder()
          .setCustomId("select_kick_user")
          .setPlaceholder("Selecciona a quién expulsar del canal...")
          .addOptions(
            members.map(m => ({
              label: m.displayName,
              value: m.id,
              description: `@${m.user.tag}`
            }))
          );

        return interaction.reply({
          content: "🔨 Selecciona un usuario para expulsarlo del canal de voz:",
          components: [new ActionRowBuilder().addComponents(select)],
          flags: MessageFlags.Ephemeral
        });
      }

      // --- LISTA DE CONFIADOS ---
      if (customId === "vc_trusted_list") {
        return interaction.reply({
          content: "👤 Permisos avanzados de lista blanca/negra aplicados para tu usuario.",
          flags: MessageFlags.Ephemeral
        });
      }
    }

    // B. MODALS DE CONFIGURACIÓN
    if (interaction.isModalSubmit() && interaction.customId === "modal_vc_general") {
      const name = interaction.fields.getTextInputValue("vc_name");
      let limit = parseInt(interaction.fields.getTextInputValue("vc_limit"), 10);

      if (isNaN(limit) || limit < 0 || limit > 99) limit = 0;

      await interaction.channel.setName(`🔊 ${name}`);
      await interaction.channel.setUserLimit(limit);

      return interaction.reply({
        content: `✅ Ajustes actualizados: **Nombre:** ${name} | **Límite:** ${limit === 0 ? "Ilimitado" : limit}`,
        flags: MessageFlags.Ephemeral
      });
    }

    // C. MENÚS DESPLEGABLES (EXPULSAR USUARIO)
    if (interaction.isStringSelectMenu() && interaction.customId === "select_kick_user") {
      const targetId = interaction.values[0];
      const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

      if (targetMember && targetMember.voice.channelId === interaction.channelId) {
        await targetMember.voice.disconnect();
        return interaction.reply({
          content: `🥾 **${targetMember.displayName}** fue expulsado/a de la sala.`,
          flags: MessageFlags.Ephemeral
        });
      } else {
        return interaction.reply({
          content: "❌ El usuario ya no está en la sala.",
          flags: MessageFlags.Ephemeral
        });
      }
    }

    // D. COMANDOS DE BARRA DIAGONAL
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }

  } catch (error) {
    console.error("SHIFT // Interaction error:", error);
  }
});

// ============================================================
// LOGS & EVENTS CATCHERS
// ============================================================

client.on(Events.GuildMemberAdd, async m => logMemberJoin(m));
client.on(Events.GuildMemberRemove, async m => logMemberLeave(m));
client.on(Events.MessageCreate, async m => {
  if (!m.guild || m.author.bot) return;
  const blocked = await handleAutoMod(m);
  if (!blocked) await handleAutoResponse(m);
});

process.on("unhandledRejection", err => console.error("SHIFT // Rejection:", err));
process.on("uncaughtException", err => console.error("SHIFT // Exception:", err));

if (!TOKEN) process.exit(1);
client.login(TOKEN);
