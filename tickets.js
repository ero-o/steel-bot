const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const config = require("../config");

const TYPES = {
  partner: {
    label: "Partner",
    emoji: "🤝",
    color: 0x8b5cf6,
    buttonStyle: ButtonStyle.Secondary,
    welcomeTitle: "🤝 Partner Ticket",
    welcomeText:
      "Welcome to your **Partner** ticket.\nPlease send your server details, what you need, and any useful links.\nA staff member will be with you shortly."
  },
  reward: {
    label: "Claim Reward",
    emoji: "🎁",
    color: 0xa855f7,
    buttonStyle: ButtonStyle.Success,
    welcomeTitle: "🎁 Claim Reward Ticket",
    welcomeText:
      "Welcome to your **Claim Reward** ticket.\nPlease explain the reward you want to claim and attach any proof if needed.\nA staff member will review it soon."
  },
  support: {
    label: "Support",
    emoji: "🛠️",
    color: 0x7c3aed,
    buttonStyle: ButtonStyle.Primary,
    welcomeTitle: "🛠️ Support Ticket",
    welcomeText:
      "Welcome to your **Support** ticket.\nPlease describe your issue clearly and send any screenshots or details that can help.\nA staff member will assist you soon."
  }
};

function buildPanelMessage() {
  const gifUrl = "https://media.discordapp.net/attachments/1405598492549840948/1484267196049002526/steel_ticket.gif";

  const text = `
Through this channel, you can contact the [**Steel Community**](${gifUrl}) administrators.

• Partnership and sponsorship processes
• Any issues or problems you experience
• Suggestions and reports

You can also create a communication channel for other related topics through this channel.
`;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_partner")
      .setLabel(TYPES.partner.label)
      .setEmoji(TYPES.partner.emoji)
      .setStyle(TYPES.partner.buttonStyle),
    new ButtonBuilder()
      .setCustomId("ticket_reward")
      .setLabel(TYPES.reward.label)
      .setEmoji(TYPES.reward.emoji)
      .setStyle(TYPES.reward.buttonStyle),
    new ButtonBuilder()
      .setCustomId("ticket_support")
      .setLabel(TYPES.support.label)
      .setEmoji(TYPES.support.emoji)
      .setStyle(TYPES.support.buttonStyle)
  );

  return {
    content: text,
    components: [row]
  };
}

function buildCloseRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Close Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );
}

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content !== config.panelCommand) return;

    try {
      await message.channel.send(buildPanelMessage());
    } catch (error) {
      console.error("Failed to send ticket panel:", error);
      await message.reply("❌ I couldn't send the ticket panel.");
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "ticket_close") {
      const hasManageChannels = interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels);
      const isTicketOwner =
        interaction.channel.topic && interaction.channel.topic.includes(`owner:${interaction.user.id}`);

      if (!hasManageChannels && !isTicketOwner) {
        return interaction.reply({ content: "❌ You can't close this ticket.", ephemeral: true });
      }

      await interaction.reply({ content: "🔒 Ticket will close in 10 seconds..." });

      setTimeout(async () => {
        try {
          await interaction.channel.delete("Ticket closed");
        } catch (error) {
          console.error("Delete ticket error:", error);
        }
      }, 10000);

      return;
    }

    if (!interaction.customId.startsWith("ticket_")) return;

    const typeKey = interaction.customId.replace("ticket_", "");
    const typeInfo = TYPES[typeKey];
    if (!typeInfo) return;

    const categoryId = config.ticketCategories[typeKey];
    if (!categoryId || String(categoryId).startsWith("PUT_")) {
      return interaction.reply({
        content: `❌ Please set the ${typeKey} category ID in config.js first.`,
        ephemeral: true
      });
    }

    const existing = interaction.guild.channels.cache.find(
      (ch) =>
        ch.type === ChannelType.GuildText &&
        ch.topic &&
        ch.topic.includes(`owner:${interaction.user.id}`) &&
        ch.topic.includes(`type:${typeKey}`)
    );

    if (existing) {
      return interaction.reply({
        content: `❌ You already have an open ${typeInfo.label} ticket: ${existing}`,
        ephemeral: true
      });
    }

    try {
      const permissionOverwrites = [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.EmbedLinks
          ]
        }
      ];

      if (config.ticketSupportRoleId && !String(config.ticketSupportRoleId).startsWith("PUT_")) {
        permissionOverwrites.push({
          id: config.ticketSupportRoleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ManageChannels
          ]
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `${typeKey}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        type: ChannelType.GuildText,
        parent: categoryId,
        topic: `owner:${interaction.user.id} | type:${typeKey}`,
        permissionOverwrites
      });

      const welcomeEmbed = new EmbedBuilder()
        .setColor(typeInfo.color)
        .setTitle(typeInfo.welcomeTitle)
        .setDescription(
          `Hey ${interaction.user}, welcome to your ticket.\n\n${typeInfo.welcomeText}\n\nPlease wait for the staff team to respond.`
        )
        .setFooter({ text: "Steel Community Support System" });

      await channel.send({
        content:
          config.ticketSupportRoleId && !String(config.ticketSupportRoleId).startsWith("PUT_")
            ? `${interaction.user} <@&${config.ticketSupportRoleId}>`
            : `${interaction.user}`,
        embeds: [welcomeEmbed],
        components: [buildCloseRow()]
      });

      await interaction.reply({
        content: `✅ Your ${typeInfo.label} ticket has been created: ${channel}`,
        ephemeral: true
      });
    } catch (error) {
      console.error("Ticket create error:", error);
      await interaction.reply({
        content: "❌ I couldn't create the ticket.",
        ephemeral: true
      });
    }
  });
};
