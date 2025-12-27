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

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const prompt = [
      {
        role: "system",
        content: "Sen KuramaMC sunucusu için çalışan yardımcı bir yapay zekasın. Sunucu IP Adresi kuramamc.tkmc.net Sürümü 1.21.5 ve Sunucu Henüz Açılmadı Bunları Oyuncular Sorduğuna Söyle"
      },
      ...gecmis
    ]
      .map(m => `${m.role === "user" ? "Kullanıcı" : "Asistan"}: ${m.content}`)
      .join("\n");

    const result = await geminiModel.generateContent(prompt);
    const cevap = result.response.text().slice(0, 1900);

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
      ["ign", "IGN (Oyun İçi İsim)"],
      ["yetki", "Hangi Yetkiyi İstiyorsunuz?"]
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
  .setTitle("📃 Yeni Yetkili Başvurusu")
  .setColor("Blurple")
  .setDescription(
    `${interaction.user}\n\n` +
    `**1️⃣ Ad**\n${cevaplar[0]}\n\n` +
    `**2️⃣ Yaş**\n${cevaplar[1]}\n\n` +
    `**3️⃣ Aktiflik**\n${cevaplar[2]}\n\n` +
    `**4️⃣ IGN**\n${cevaplar[3]}\n\n` +
    `**5️⃣ Yetki**\n${cevaplar[4]}`
  )
  .setFooter({
    text: "kuramamc.tkmc.net | KuramaMC",
    iconURL: interaction.guild.iconURL({ dynamic: true })
  });

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

    return interaction.reply({ content: "✅ Başvurun gönderildi!", ephemeral: true });
  }

  if (
    interaction.isButton() &&
    (interaction.customId.startsWith("basvuru_onay_") ||
     interaction.customId.startsWith("basvuru_red_"))
  ) {

    const id = interaction.customId.split("_").pop();
    const basvuran = await interaction.guild.members.fetch(id).catch(() => null);
    if (!basvuran) return;
    const yetkili = interaction.user;
    const kanal = interaction.guild.channels.cache.get(ONAY_KANAL);
    const onay = interaction.customId.startsWith("basvuru_onay_");

    const embed = new EmbedBuilder()
      .setTitle(onay ? "KuramaMC - Başvuru Onayı!" : "KuramaMC - Başvuru Reddedildi")
      .setColor(onay ? "Green" : "Red")
      .setDescription(
        onay
          ? `${basvuran} Kullanıcısının Başvurusu ${yetkili} Tarafından **Onaylandı**.`
          : `${basvuran} Kullanıcısının Başvurusu ${yetkili} Tarafından **Reddedildi**.`
      )
      .addFields(
        {
          name: onay ? "**Onaylayan Yetkili**" : "**Reddeden Yetkili**",
          value: `${yetkili}`,
          inline: true
        },
        {
          name: "**Başvuran Kişi**",
          value: `${basvuran}`,
          inline: true
        }
      )
      .setFooter({
        text: "kuramamc.tkmc.net | KuramaMC",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });

    await kanal?.send({ embeds: [embed] });

    await interaction.guild.channels.cache
      .get(ONAY_KANAL)
      ?.send({ embeds: [embed] });

    await interaction.message.edit({ components: [] });
    return interaction.reply({ content: "Tamamlandı.", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
