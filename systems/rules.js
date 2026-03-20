
module.exports = (client) => {

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        if (message.content === ".rules") {

            const embed = {
                color: 0x8b5cf6,
                title: "📜 STEEL COMMUNITY RULES",
                description:
`━━━━━━━━━━━━━━━━━━━━━━

🟣 **Respect and Courtesy**
• Treat everyone with respect and courtesy  
• No discrimination or harassment  
• No toxic or cult-like behavior  
• Treat others as you want to be treated  

🟣 **Profanity and Insults**
• Keep profanity to a minimum  
• Bots may delete messages  

🟣 **NSFW & Content**
• Friendly environment only  
• NSFW & explicit content prohibited  

🟣 **Spam & Flood**
• No spam  
• No flooding  

🟣 **Identity & Doxxing**
• No sharing personal info  
• No doxxing  

🟣 **Advertising**
• Not allowed  

🟣 **Server Bots**
• Bots may clean content  

🟣 **Crypto Warning**
• Not financial advice  
• Do your own research  

🟣 **Voice Channels**
• Be respectful  
• No disturbance  

🟣 **DMCA & Copyright**
• Respect ownership  

🟣 **Discord Rules**
• Follow Discord ToS  

🟣 **Acceptance**
• By staying you accept rules  

━━━━━━━━━━━━━━━━━━━━━━`,
                image: {
                    url: "https://media.discordapp.net/attachments/1405598492549840948/1484267195646345379/steel_rules.gif"
                },
                footer: {
                    text: "Steel Community • Rules System"
                }
            };

            message.channel.send({ embeds: [embed] });
        }
    });

};
