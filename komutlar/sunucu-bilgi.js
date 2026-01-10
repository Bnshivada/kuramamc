const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "sunucu-info",
    description: "Sunucu hakkında bilgi verir.",
    usage: "!sunucu-info",
    async execute(message) {
        const { guild } = message;

        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        const embed = new EmbedBuilder()
            .setColor(`#${randomColor}`)
            .setTitle("KuramaMC Sunucu Bilgileri")
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: "🏷️ Sunucu Adı", value: `${guild.name}`, inline: true },
                { name: "🆔 Sunucu ID", value: `${guild.id}`, inline: true },
                { name: "👑 Sunucu Sahibi", value: `<@${guild.ownerId}>`, inline: true },
                { name: "👥 Üye Sayısı", value: `${guild.memberCount}`, inline: true },
                { name: "💬 Kanal Sayısı", value: `${guild.channels.cache.size}`, inline: true },
                { name: "📅 Oluşturulma Tarihi", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
            )
            .setFooter({ text: "5.133.100.199 | KuramaMC" })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
