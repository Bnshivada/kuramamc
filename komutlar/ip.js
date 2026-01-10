const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ip',
  description: 'Sunucu IP bilgilerini gösterir',
  execute(message) {
    const embed = new EmbedBuilder()
  .setTitle('🌍 KuramaMC Sunucu IP Bilgisi')
  .setDescription(`**IP:** \`5.133.100.199\`\n**Versiyon:** 1.21.5+`)
  .setColor('#00FF00')
  .setThumbnail(message.guild.iconURL({ dynamic: true, size: 512 }))
  .setFooter({ text: 'Haydi Oyuna Katıl!' })
  .setTimestamp();
    message.channel.send({ embeds: [embed] });
  }
};
