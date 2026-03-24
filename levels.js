const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

const path = "./data/levels.json";

if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

const XP_PER_MESSAGE = 10;
const XP_COOLDOWN_MS = 3000;
const MAX_LEVEL = 80;

const ALLOWED_CATEGORIES = [
  "1412184394814455829",
  "1412187957225590979",
  "1431354138431848488",
  "1412473247697600583"
];

const ACHIEVE_CHANNEL_ID = "1484432879596474528";
const RANK_COMMAND_CHANNEL_ID = "1484477983291867200";
const LEVEL_UP_IMAGE_URL = "https://media.discordapp.net/attachments/1405598492549840948/1484427337490501742/levelup.gif";

const LEVEL_ROLES = {
  5: "1430855918974799882",
  15: "1430852814766215271",
  20: "1430853020941291600",
  30: "1430853541861523568",
  45: "1430853656588189797",
  60: "1430853820099072041",
  80: "1430854271804506163"
};

const cooldowns = new Map();

function getNeededXP(level) {
  if (level < 45) return 100;
  if (level < 60) return 200;
  return 300;
}

function loadData() {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function ensureUser(data, userId) {
  if (!data[userId]) {
    data[userId] = { xp: 0, level: 1 };
  }
}

function getConfiguredRoleIdForLevel(level) {
  return LEVEL_ROLES[level] || null;
}

async function updateLevelRoles(member, level) {
  if (!member || !member.roles) return null;

  const milestones = Object.keys(LEVEL_ROLES).map(Number).sort((a, b) => a - b);
  let addedRole = null;

  for (const milestone of milestones) {
    const roleId = LEVEL_ROLES[milestone];
    if (level >= milestone) addedRole = roleId;
  }

  const allConfiguredRoleIds = milestones.map((milestone) => LEVEL_ROLES[milestone]);
  const removeIds = allConfiguredRoleIds.filter((id) => id !== addedRole);

  try {
    if (removeIds.length) {
      await member.roles.remove(removeIds).catch(() => {});
    }

    if (addedRole && !member.roles.cache.has(addedRole)) {
      await member.roles.add(addedRole).catch(() => {});
    }
  } catch (_) {}

  return addedRole;
}

function progressBar(current, max, size = 14) {
  const safeMax = Math.max(1, max);
  const ratio = Math.max(0, Math.min(1, current / safeMax));
  const filled = Math.round(size * ratio);
  const empty = size - filled;
  return "▰".repeat(filled) + "▱".repeat(empty);
}

function buildLevelEmbed(user, stats, unlockedRoleId = null) {
  const neededXP = stats.level >= MAX_LEVEL ? getNeededXP(MAX_LEVEL) : getNeededXP(stats.level);

  const descriptionLines = [
    `🎉 **${user} leveled up!**`,
    "",
    `🚀 You reached **Level ${stats.level}**`
  ];

  if (unlockedRoleId) {
    descriptionLines.push(`✨ Congratulations! You unlocked <@&${unlockedRoleId}>`);
  }

  return new EmbedBuilder()
    .setColor("#8b5cf6")
    .setAuthor({
      name: user.username ?? user.tag ?? "Level System",
      iconURL: user.displayAvatarURL ? user.displayAvatarURL({ dynamic: true }) : null
    })
    .setTitle("✨ LEVEL UP!")
    .setDescription(descriptionLines.join("\n"))
    .addFields(
      {
        name: "🏆 Level",
        value: `**${stats.level} / ${MAX_LEVEL}**`,
        inline: true
      },
      {
        name: "⚡ XP",
        value: `**${stats.xp} / ${neededXP}**`,
        inline: true
      },
      {
        name: "📊 Progress",
        value: progressBar(stats.xp, neededXP),
        inline: false
      }
    )
    .setThumbnail(user.displayAvatarURL ? user.displayAvatarURL({ dynamic: true, size: 1024 }) : null)
    .setImage(LEVEL_UP_IMAGE_URL)
    .setFooter({ text: "Steel Community • Level System" })
    .setTimestamp();
}

function buildRankEmbed(user, stats) {
  const neededXP = stats.level >= MAX_LEVEL ? getNeededXP(MAX_LEVEL) : getNeededXP(stats.level);

  return new EmbedBuilder()
    .setColor("#8b5cf6")
    .setAuthor({
      name: user.username ?? user.tag ?? "Rank",
      iconURL: user.displayAvatarURL ? user.displayAvatarURL({ dynamic: true }) : null
    })
    .setTitle("📊 YOUR RANK")
    .addFields(
      {
        name: "🏆 Level",
        value: `**${stats.level} / ${MAX_LEVEL}**`,
        inline: true
      },
      {
        name: "⚡ XP",
        value: `**${stats.xp} / ${neededXP}**`,
        inline: true
      },
      {
        name: "📈 Progress",
        value: progressBar(stats.xp, neededXP),
        inline: false
      }
    )
    .setThumbnail(user.displayAvatarURL ? user.displayAvatarURL({ dynamic: true, size: 1024 }) : null)
    .setFooter({ text: "Steel Community • Rank System" })
    .setTimestamp();
}

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();

    if (content.startsWith(".rank")) {
      if (message.channel.id !== RANK_COMMAND_CHANNEL_ID) {
        return message.reply(`❌ Command allowed only in <#${RANK_COMMAND_CHANNEL_ID}>`);
      }

      const target = message.mentions.users.first() || message.author;
      const data = loadData();
      ensureUser(data, target.id);

      return message.channel.send({
        content: `${target}`,
        embeds: [buildRankEmbed(target, data[target.id])]
      });
    }

    if (content.startsWith("!testlevel")) {
      const target = message.mentions.users.first() || message.author;
      const data = loadData();
      ensureUser(data, target.id);

      return message.channel.send({
        content: `${target}`,
        embeds: [buildLevelEmbed(target, data[target.id], null)]
      });
    }

    if (content.startsWith("!setlevel")) {
      if (!message.member?.permissions?.has("Administrator")) {
        return message.reply("❌ You don't have permission.");
      }

      const target = message.mentions.users.first();
      const parts = content.split(/\s+/);
      const newLevel = Number(parts[parts.length - 1]);

      if (!target || Number.isNaN(newLevel) || newLevel < 1 || newLevel > MAX_LEVEL) {
        return message.reply(`❌ Use: !setlevel @user 1-${MAX_LEVEL}`);
      }

      const data = loadData();
      ensureUser(data, target.id);
      data[target.id].level = newLevel;
      data[target.id].xp = 0;
      saveData(data);

      const member = await message.guild.members.fetch(target.id).catch(() => null);
      const addedRole = await updateLevelRoles(member, newLevel);

      return message.channel.send({
        content: `${target}`,
        embeds: [buildLevelEmbed(target, data[target.id], addedRole)]
      });
    }

    if (!message.channel.parentId || !ALLOWED_CATEGORIES.includes(message.channel.parentId)) return;

    const data = loadData();
    const id = message.author.id;
    ensureUser(data, id);

    if (data[id].level >= MAX_LEVEL) {
      data[id].level = MAX_LEVEL;
      data[id].xp = getNeededXP(MAX_LEVEL);
      saveData(data);
      return;
    }

    const now = Date.now();
    const last = cooldowns.get(id) || 0;

    if (now - last < XP_COOLDOWN_MS) return;
    cooldowns.set(id, now);

    data[id].xp += XP_PER_MESSAGE;

    const achievedLevels = [];

    while (data[id].level < MAX_LEVEL && data[id].xp >= getNeededXP(data[id].level)) {
      data[id].xp -= getNeededXP(data[id].level);
      data[id].level++;
      achievedLevels.push(data[id].level);
    }

    saveData(data);

    if (!achievedLevels.length) return;

    const member = await message.guild.members.fetch(message.author.id).catch(() => null);
    const achieveChannel = message.guild.channels.cache.get(ACHIEVE_CHANNEL_ID);

    for (const reachedLevel of achievedLevels) {
      const roleForThisLevel = getConfiguredRoleIdForLevel(reachedLevel);
      let unlockedRoleId = null;

      if (roleForThisLevel) {
        unlockedRoleId = await updateLevelRoles(member, reachedLevel);
      } else {
        await updateLevelRoles(member, reachedLevel);
      }

      if (achieveChannel) {
        await achieveChannel.send({
          content: `${message.author}`,
          embeds: [buildLevelEmbed(message.author, { level: reachedLevel, xp: data[id].xp }, unlockedRoleId)]
        }).catch(() => {});
      }
    }
  });
};
