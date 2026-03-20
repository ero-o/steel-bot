module.exports = (client) => {
    const BOOST_CHANNEL_ID = "1484490568007553046";
    const VIP_ROLE_ID = "1413238681128534017";
    const BOOST_GIF = "https://media.discordapp.net/attachments/1405598492549840948/1484427336513224734/serverbooster.gif";

    async function sendBoostEmbed(member, sourceUser) {
        const channel = member.guild.channels.cache.get(BOOST_CHANNEL_ID);
        if (!channel) throw new Error(`Boost channel not found: ${BOOST_CHANNEL_ID}`);

        const user = sourceUser || member.user;

        await channel.send({
            content: `${member}`,
            embeds: [{
                color: 0xfacc15,
                author: {
                    name: user.username,
                    icon_url: user.displayAvatarURL({ dynamic: true })
                },
                title: "<a:booster:1484595562769682443> SERVER BOOSTED!",
                description:
                    `🚀 **${member} just boosted the server!**\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `<a:purplefire:1484593378145468606> Thank you for supporting **Steel Community**\n` +
                    `<:purplevip:1484595392355238090> You have unlocked <@&${VIP_ROLE_ID}>`,
                thumbnail: {
                    url: user.displayAvatarURL({ dynamic: true, size: 1024 })
                },
                image: {
                    url: BOOST_GIF
                },
                footer: {
                    text: "Steel Community • Booster System"
                },
                timestamp: new Date().toISOString()
            }]
        });
    }

    async function giveVipRole(member) {
        const role = member.guild.roles.cache.get(VIP_ROLE_ID);
        if (!role) throw new Error(`VIP role not found: ${VIP_ROLE_ID}`);
        if (member.roles.cache.has(VIP_ROLE_ID)) return;
        await member.roles.add(role);
    }

    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        try {
            if (!oldMember.premiumSince && newMember.premiumSince) {
                await giveVipRole(newMember);
                await sendBoostEmbed(newMember);
            }
        } catch (err) {
            console.error("Booster system error:", err);
        }
    });

    client.on("messageCreate", async (message) => {
        try {
            if (message.author.bot) return;
            if (!message.guild) return;

            const content = message.content.trim().toLowerCase();

            if (content === ".testboost") {
                await message.reply("✅ testboost received");

                await giveVipRole(message.member);
                await sendBoostEmbed(message.member, message.author);

                await message.channel.send("✅ boost test sent");
            }
        } catch (err) {
            console.error("Test boost command error:", err);
            await message.reply(`❌ ${err.message || "Something went wrong"}`);
        }
    });
};
