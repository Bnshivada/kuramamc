const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const member = interaction.member;

    if (interaction.customId === "destek_talebi_olustur") {
      const channelName = `destek-${member.user.username.toLowerCase()}`;

      if (guild.channels.cache.find(c => c.name === channelName)) {
        return interaction.reply({ content: "Zaten Aktif Bir Destek Talebiniz Var!!", ephemeral: true });
      }

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: 0,
        parent: "1454604502295642375",
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          { id: "1454393829577986099", allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
        ]
      });

      await ticketChannel.send(`<@&1454393829577986099>`);

      const embed = new EmbedBuilder()
        .setDescription(`${member} Destek Sistemimize Hoşgeldin, Destek Görevlileri En Kısa Sürede Seninle İlgilenecektir, Sorununu Bildirebilirsin!`)
        .setColor("Blue")
        .setFooter({ text: "kuramamc.tkmc.net | KuramaMC", iconURL: guild.iconURL({ dynamic: true }) });

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("destek_sahiplen").setLabel("Desteği Sahiplen").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("destek_kaldir").setLabel("Desteği Sil").setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ content: "", embeds: [embed], components: [buttonRow] });
      return interaction.reply({ content: `Destek Talebiniz Başarıyla Oluşturuldu: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === "destek_sahiplen") {
      if (!member.roles.cache.has("1454393829577986099")) {
        return interaction.reply({ content: "Kendi Destek Biletini Sahiplenemezsin!", ephemeral: true });
      }

      const ticketChannel = interaction.channel;
      const message = interaction.message;

      await ticketChannel.send(`🎉 Destek Sahiplenildi! ${member} artık bu ticket ile ilgilenecek.`);

      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("destek_sahiplen")
          .setLabel("Destek Sahiplenildi!")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("destek_kaldir")
          .setLabel("Desteği Sil")
          .setStyle(ButtonStyle.Danger)
      );

      await message.edit({ components: [updatedRow] });
      return interaction.reply({ content: "Destek Sahiplenildi!", ephemeral: true });
    }

    if (interaction.customId === "destek_kaldir") {
      const message = interaction.message;
      const channel = interaction.channel;

      if (!member.roles.cache.has("1454393829577986099") && member.id !== channel.name.replace("destek-", "")) {
        return interaction.reply({ content: "İşlem Başarıyla Sıraya Alındı.", ephemeral: true });
      }

      const embed = EmbedBuilder.from(message.embeds[0]);
      embed.setDescription(`${channel.name} üzerindeki destek kaldırıldı.`);
      await message.edit({ embeds: [embed], components: [] });

      await channel.send("Destek 5sn İçinde Silinecek..");

      setTimeout(async () => {
        await channel.delete().catch(() => {});
      }, 5000);

      return;
    }
  }
};
