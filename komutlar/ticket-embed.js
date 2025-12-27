const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "ticketolustur",

  async execute(message) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({ content: "Bu Komutu Kullanmak İçin YeterliYetkiniz Bulunmuyor!!", ephemeral: true });
    }

    await message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle("🎟️ KuramaMC Destek Talebi Sistemi")
      .setDescription(
        "-------------------------------\n\n" +
        "Destek Sistemine Hoşgeldiniz, Bir Sorunla Karşılaştığınızda Alttaki Butona Tıklayarak Kolayca Destek Talebi Oluşturabilirsiniz\n\n" +
        "🔧 Teknik Destek\n" +
        "💳 Ödeme Sorunları\n" +
        "🔑 Hesap İşlemleri"
      )
      .setColor("Blue")
      .setFooter({
        text: "kuramamc.tkmc.net | KuramaMC",
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    const button = new ButtonBuilder()
      .setCustomId("destek_talebi_olustur")
      .setLabel("🎟️ Destek Talebi Oluştur")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
