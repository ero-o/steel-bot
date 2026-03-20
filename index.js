require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const http = require("http");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is alive");
}).listen(process.env.PORT || 3000);

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

function loadSystem(fileName) {
  try {
    const fullPath = path.join(__dirname, "systems", fileName);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[SYSTEM SKIPPED] systems/${fileName} not found`);
      return;
    }

    const mod = require(fullPath);
    if (typeof mod === "function") {
      mod(client);
      console.log(`[SYSTEM LOADED] ${fileName}`);
    } else {
      console.warn(`[SYSTEM SKIPPED] ${fileName} does not export a function`);
    }
  } catch (error) {
    console.error(`[SYSTEM ERROR] ${fileName}`, error);
  }
}

loadSystem("tickets.js");
loadSystem("guideline.js");
loadSystem("levels.js");
loadSystem("boosters.js");
loadSystem("rules.js");

client.login(process.env.TOKEN);
