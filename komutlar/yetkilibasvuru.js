const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  name: "yetkilibasvuru",

  async execute(message) {
    if (!message.member.permissions.has("Administrator")) {

      return message.reply({ content: "❌ Bu komutu kullanmak için yetkiniz yok!", ephemeral: true });
    }

    await message.delete().catch(() => {});

    const randomColor = Math.floor(Math.random() * 16777215);

    const embed = new EmbedBuilder()
      .setTitle("🌟 KuramaMC - Yetkili Başvuru")
      .setDescription(
        `Merhaba Oyuncu!\n\n` +
        `KuramaMC Sunucusunun Yetkili Takımına Katılmak İstersen Aşağıdaki Formu Doldurabilirsin\n\n` +
        `📃 **Başvuru Şartlarımız:**\n` +
        `- En Az 15 Yaşında Olmak\n` +
        `- Gün İçinde En Az 4-5 Saat Aktiflik\n` +
        `- Takım Çalışmalarına Uyumlu Olmak\n` +
        `- Minecraft Bilgisine Sahip Olmak (Rolünüze Göre Değişir)`
      )
      .setColor(randomColor)
      .setFooter({
        text: "KuramaMC - Yetkili Alım Sistemi",
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    const button = new ButtonBuilder()
      .setCustomId("yetkili_basvuru_buton")
      .setLabel("📃 Başvuru Formu")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
