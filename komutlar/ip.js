const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ip',
  description: 'Sunucu IP bilgilerini gösterir',
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('🌍 KuramaMC Sunucu IP Bilgisi')
      .setDescription(`**IP:** \`kuramamc.tkmc.net\`\n**Versiyon:** 1.21.3+`)
      .setColor('#00FF00')
      .setThumbnail('https://imgur.com/a/Sr8Y47j') 
      .setFooter({ text: 'Haydi Oyuna Katıl!' })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
