module.exports = (client) => {
    const BOOST_CHANNEL_ID = "1484490568007553046";
    const VIP_ROLE_ID = "1413238681128534017";
    const BOOST_GIF = "https://media.discordapp.net/attachments/1405598492549840948/1484427336513224734/serverbooster.gif";

    async function sendBoostEmbed(member, sourceUser) {
        const channel = member.guild.channels.cache.get(BOOST_CHANNEL_ID);
        if (!channel) return;

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
        try {
            const role = member.guild.roles.cache.get(VIP_ROLE_ID);
            if (!role) return;
            if (member.roles.cache.has(VIP_ROLE_ID)) return;
            await member.roles.add(role);
        } catch (err) {
            console.error("VIP role add error:", err);
        }
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

            if (message.content.toLowerCase() === ".testboost") {
                await giveVipRole(message.member);
                await sendBoostEmbed(message.member, message.author);
                await message.reply("done");
            }
        } catch (err) {
            console.error("Test boost command error:", err);
            await message.reply("❌ Something went wrong");
        }
    });
};
