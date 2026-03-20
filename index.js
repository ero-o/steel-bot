require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const http = require("http");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// 🔥 WEB SERVER FOR RENDER UPTIME
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is alive");
}).listen(process.env.PORT || 3000);

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

require("./systems/tickets")(client);
require("./systems/guideline")(client);
require("./systems/levels")(client);
require("./systems/boosters")(client);
require("./systems/rules")(client);

client.login(process.env.TOKEN);
