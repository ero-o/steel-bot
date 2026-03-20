const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content !== "!guideline") return;

    const embed = new EmbedBuilder()
      .setColor("#8b5cf6")
      .setImage("https://media.discordapp.net/attachments/1405598492549840948/1484267195314868395/steel_guide.gif")
      .setDescription(
`**Information**

**Thank you for joining us, and we hope you enjoy your time here.**

**Steel Community is an international community** that brings together players of MMORPG/MMO and popular games from around the world.

**What can you expect inside?**  
We have lively discussions about various games, trending topics, sports and much more.

**Also we provide professional services.**  
Our friendly chat allows you to build strong friendships and find everything you're looking for while having a great time.

**In addition, we offer:**  
• Discord Chat Ranks  
• Giveaways  
• Promotions  
• Games  

**All languages are welcome on the server.**  
**This server is not subject to your definition of "fairness".**

━━━━━━━━━━━━━━━━━━━━

**Server Info**

• **Invite:** https://discord.gg/steelcommunity  
• **Code:** 2FxMM9zeAX  
• **Server Release Date:** Tuesday, September 2, 2025`
      );

    await message.channel.send({ embeds: [embed] });
  });
};
