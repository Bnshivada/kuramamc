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

const { Client, Collection, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
const komutDosyalari = fs
  .readdirSync(komutlarPath)
  .filter(file => file.endsWith('.js'));

for (const dosya of komutDosyalari) {
  const dosyaYolu = path.join(komutlarPath, dosya);
  const komut = require(dosyaYolu);

  if (!komut.name) continue;

  client.commands.set(komut.name, komut);

  if (Array.isArray(komut.aliases)) {
    komut.aliases.forEach(alias => {
      client.commands.set(alias, komut);
    });
  }
}

client.once('clientReady', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);

  setTimeout(() => {
    client.user.setPresence({
      activities: [
        { name: '⚒️ KuramaMC Yapım Aşamasında! ⚒️', type: 0 }
      ],
      status: 'online'
    });
  }, 5000);
});

const OTOROL_ID = '1454393822728421470';
const HOSGELDIN_KANALI_ID = '1454515855671951524';

client.on('guildMemberAdd', async member => {
  const rol = member.guild.roles.cache.get(OTOROL_ID);
  if (rol) {
    try {
      await member.roles.add(rol);
      console.log(`${member.user.tag} üyesine otorol verildi: ${rol.name}`);
    } catch (err) {
      console.error('Rol verilirken hata:', err);
    }
  }

  const kanal = member.guild.channels.cache.get(HOSGELDIN_KANALI_ID);
  if (!kanal) return;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: 'KuramaMC - Hoşgeldin!',
      iconURL: 'https://i.imgur.com/jLDX0Wf.png'
    })
    .setDescription(`
**${member.user.tag}** aramıza katıldı! 🌟
Herkes Yeni Üyemize Merhaba Desin!! 👋

🟢 **IP:** \`kuramamc.tkmc.net\`
🟢 **Versiyon:** 1.21.3+
`)
    .setColor('#00FF00')
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Keyifli oyunlar dileriz!' })
    .setTimestamp();

  kanal.send({ embeds: [embed] });
});


client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const komutAdi = args.shift().toLowerCase();
  const komut = client.commands.get(komutAdi);

  if (!komut) return;

  try {
    await komut.execute(message, client);
  } catch (err) {
    console.error(err);
    message.reply('❌ Komut çalışırken hata oluştu.');
  }
});

client.login(process.env.TOKEN);
