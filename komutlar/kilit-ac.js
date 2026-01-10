const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "kilit-ac",
    description: "Belirtilen kanalı yazı yazmaya açar.",
    usage: "!kilit-ac #kanal",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) 
            return message.reply("Bu komutu kullanmak için yeterli yetkin yok. ❌");

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });

            const randomColor = Math.floor(Math.random() * 16777215).toString(16);

            const embed = new EmbedBuilder()
                .setColor(`#${randomColor}`)
                .setTitle("🔓 Kanalın Kilidi Başarıyla Açıldı")
                .setDescription(`${channel} Adlı Kanalın Kilidi \n<@${message.member.id}> İsimli Yetkili Tarafından Açıldı .\nKanal artık yazmaya açık, üyeler mesaj gönderebilir.`)
                .setFooter({ text: "5.133.100.199 | KuramaMC" })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            message.reply("Kanalın Kilidi Açılırken Bir Hata Oluştu ❌");
            console.error(err);
        }
    },
};
