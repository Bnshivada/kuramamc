const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Üyeyi sunucudan banlar.',
    usage: '!ban @üye #sebep',
    async execute(message, client) {

        const args = message.content.slice(1).trim().split(/ +/);

        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ KuramamaMC Bu Komutu Kullanmak İçin (Üyeleri Yasakla) Yetkinin Olduğunu Düşünmüyor.');
        }

        const user = message.mentions.members.first();
        if (!user) {
            return message.reply('❌ Banlanacak üyeyi etiketle.\nÖrnek: `!ban @üye #sebep`');
        }

        if (user.id === message.author.id) {
            return message.reply('Az Önce Kendini Banlamayı Mı Denedin? 🥀🥀');
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ KuramaMC Yeterli İzinlere Sahip Olduğunu Düşünmüyor..');
        }

        if (user.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Bu üyeyi yasaklayamazsın (rolü senden yüksek/eşit).');
        }

        const reason = args.slice(2).join(' ') || 'Nedeni Belirtilmedi';
        const banDate = new Date().toLocaleString('tr-TR');

        try {
            await user.ban({ reason });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Oyuncu Yasaklandı! ✈️')
                .setDescription(
                    `${user.user.tag} adlı üye sunucudan yasaklandı.\n\n` +
                    `**Yasaklayan Yetkili:** ${message.author}\n` +
                    `**Sebep:** ${reason}\n` +
                    `**Yasaklanma Tarihi:** ${banDate}`
                )
                .setFooter({ text: 'kuramamc.tkmc.net | KuramaMC' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            message.reply('❌ Bu Oyuncu Yasaklanırken Bir Hata Oluştu.');
        }
    }
};
