require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("KuramaMC Discord Bot Aktif");
});

app.listen(PORT, () => {
  console.log(`Web server açık: ${PORT}`);
});

const {
  Client,
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const PREFIX = '!';

const komutlarPath = path.join(__dirname, 'komutlar');
const komutDosyalari = fs.readdirSync(komutlarPath).filter(f => f.endsWith('.js'));

for (const dosya of komutDosyalari) {
  const komut = require(path.join(komutlarPath, dosya));
  if (!komut.name) continue;
  client.commands.set(komut.name, komut);
}

client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const komutAdi = args.shift().toLowerCase();
  const komut = client.commands.get(komutAdi);
  if (!komut) return;

  await komut.execute(message, client);
});

const BASVURU_LOG_KANAL = "1454533545396670747";
const ONAY_KANAL = "1454515007806115984";
const AI_CHAT_KANAL = "1454516320459690097";

const sohbetHafiza = new Map();

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (message.channel.id !== AI_CHAT_KANAL) return;

  const userId = message.author.id;

  if (!sohbetHafiza.has(userId)) {
    sohbetHafiza.set(userId, []);
  }

  const gecmis = sohbetHafiza.get(userId);

  gecmis.push({ role: "user", content: message.content });
  if (gecmis.length > 50) gecmis.shift();

  try {
    await message.channel.sendTyping();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "Sen KuramaMC sunucusu için çalışan yardımcı bir yapay zekasın. Sunucu IP Adresi kuramamc.tkmc.net Sürümü 1.21.5 ve Sunucu Henüz Açılmadı Bunları Oyuncular Sorduğuna Söyle" },
        ...gecmis
      ]
    });

    const cevap = response.output_text?.slice(0, 1900) || "KuramaMC AI - Error 605.";

    gecmis.push({ role: "assistant", content: cevap });

    await message.reply(cevap);
  } catch (err) {
    console.error(err);
    message.reply("KuramaMC AI - Error 605");
  }
});

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isButton() && interaction.customId === "yetkili_basvuru_buton") {

    const modal = new ModalBuilder()
      .setCustomId("yetkili_basvuru_modal")
      .setTitle("KuramaMC - Yetkili Başvuru");

    const sorular = [
      ["ad", "Adınız Nedir?"],
      ["yas", "Yaşınız Kaç?"],
      ["aktiflik", "Kaç Saat Aktif Kalabilirsiniz?"],
      ["ign", "IGN"],
      ["yetki", "İstediğiniz Yetki"]
    ];

    sorular.forEach(s => {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(s[0])
            .setLabel(s[1])
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );
    });

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "yetkili_basvuru_modal") {

    const cevaplar = ["ad","yas","aktiflik","ign","yetki"]
      .map(x => interaction.fields.getTextInputValue(x));

    const embed = new EmbedBuilder()
      .setTitle("Yeni Yetkili Başvurusu")
      .setColor("Blurple")
      .setDescription(
        `${interaction.user}\n\n` +
        `Ad: ${cevaplar[0]}\n` +
        `Yaş: ${cevaplar[1]}\n` +
        `Aktiflik: ${cevaplar[2]}\n` +
        `IGN: ${cevaplar[3]}\n` +
        `Yetki: ${cevaplar[4]}`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`basvuru_onay_${interaction.user.id}`)
        .setLabel("ONAYLA")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`basvuru_red_${interaction.user.id}`)
        .setLabel("REDDET")
        .setStyle(ButtonStyle.Danger)
    );

    interaction.guild.channels.cache
      .get(BASVURU_LOG_KANAL)
      ?.send({ embeds: [embed], components: [row] });

    return interaction.reply({ content: "Başvuru gönderildi.", ephemeral: true });
  }

  if (
    interaction.isButton() &&
    (interaction.customId.startsWith("basvuru_onay_") ||
     interaction.customId.startsWith("basvuru_red_"))
  ) {

    const id = interaction.customId.split("_").pop();
    const basvuran = await interaction.guild.members.fetch(id).catch(() => null);
    if (!basvuran) return;

    const onay = interaction.customId.startsWith("basvuru_onay_");

    const embed = new EmbedBuilder()
      .setTitle(onay ? "Başvuru Onaylandı" : "Başvuru Reddedildi")
      .setColor(onay ? "Green" : "Red")
      .setDescription(`${basvuran} - ${interaction.user}`);

    await interaction.guild.channels.cache
      .get(ONAY_KANAL)
      ?.send({ embeds: [embed] });

    await interaction.message.edit({ components: [] });
    return interaction.reply({ content: "Tamamlandı.", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
