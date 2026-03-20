
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

const LEVEL_FILE = "./levels.json";

const ALLOWED_CATEGORIES = [
  "1412184394814455829",
  "1412187957225590979",
  "1431354138431848488",
  "1412473247697600583"
];

const RANK_COMMAND_CHANNEL_ID = "1484477983291867200";
const ACHIEVE_CHANNEL_ID = "1484432879596474528";

const LEVELUP_IMAGE = "https://media.discordapp.net/attachments/1405598492549840948/1484427337490501742/levelup.gif";

function loadData() {
  if (!fs.existsSync(LEVEL_FILE)) return {};
  return JSON.parse(fs.readFileSync(LEVEL_FILE));
}

function saveData(data) {
  fs.writeFileSync(LEVEL_FILE, JSON.stringify(data, null, 2));
}

function ensureUser(data, id) {
  if (!data[id]) data[id] = { xp: 0, level: 1 };
}

function getNeededXP(level) {
  if (level < 45) return 100;
  if (level < 60) return 200;
  return 300;
}

function progressBar(current, max, size = 12) {
  const percent = current / max;
  const progress = Math.round(size * percent);
  const empty = size - progress;
  return "🟪".repeat(progress) + "⬛".repeat(empty);
}

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (!message.channel.parentId || !ALLOWED_CATEGORIES.includes(message.channel.parentId)) return;

    const data = loadData();
    const id = message.author.id;

    ensureUser(data, id);

    data[id].xp += 10;

    const neededXP = getNeededXP(data[id].level);

    if (data[id].xp >= neededXP) {
      data[id].xp = 0;
      data[id].level++;

      const ch = message.guild.channels.cache.get(ACHIEVE_CHANNEL_ID);
      if (ch) {

        const embed = new EmbedBuilder()
          .setColor("#8b5cf6")
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTitle("✨ LEVEL UP!")
          .setDescription(
            `🎉 **${message.author} leveled up!**\n\n` +
            `🚀 You reached **Level ${data[id].level}**`
          )
          .addFields(
            {
              name: "🏆 Level",
              value: `**${data[id].level} / 80**`,
              inline: true
            },
            {
              name: "⚡ XP",
              value: `**0 / ${getNeededXP(data[id].level)}**`,
              inline: true
            },
            {
              name: "📊 Progress",
              value: progressBar(0, getNeededXP(data[id].level)),
              inline: false
            }
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 1024 }))
          .setImage(LEVELUP_IMAGE)
          .setFooter({ text: "Steel Community • Level System" })
          .setTimestamp();

        ch.send({
          content: `${message.author}`,
          embeds: [embed]
        });
      }
    }

    saveData(data);
  });
};
