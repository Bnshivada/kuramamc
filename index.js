require('dotenv').config();
const { Client, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers']
});

client.commands = new Collection();

const PREFIX = '!';

const komutlarPath = path.join(__dirname, 'komutlar');
const komutDosyalari = fs.readdirSync(komutlarPath).filter(file => file.endsWith('.js'));

for (const dosya of komutDosyalari) {
  const dosyaYolu = path.join(komutlarPath, dosya);
  const komut = require(dosyaYolu);

  if ('name' in komut) {
    client.commands.set(komut.name, komut);
    
    if (komut.aliases && Array.isArray(komut.aliases)) {
      komut.aliases.forEach(alias => {
        client.commands.set(alias, komut);
      });
    }
  }
}

client.once('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
  client.user.setActivity('KuramaMC On The Top!', { type: 'PLAYING' });
});

const OTOROL_ID = '1449295934843388024';
const HOSGELDIN_KANALI_ID = '1448679747650322454';

client.on('guildMemberAdd', async member => {
  const rol = member.guild.roles.cache.get(OTOROL_ID);
  if (rol) {
    try {
      await member.roles.add(rol);
      console.log(`${member.user.tag} üyesine otorol verildi: ${rol.name}`);
    } catch (error) {
      console.error('Rol verilirken hata:', error);
    }
  }

  const kanal = member.guild.channels.cache.get(HOSGELDIN_KANALI_ID);
  if (kanal) {
    const embed = new EmbedBuilder()
      .setTitle('🎉 KuramaMC Ailesine Hoş Geldin!')
      .setDescription(`
        **${member.user.tag}** aramıza katıldı! 🌟
        
        Herkes Yeni Üyemize Merhaba Desin! 
        IP: \`kuramamc.tkmc.net\`
        Versiyon: 1.21.3+
      `)
      .setColor('#00FF00')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage('https://i.imgur.com/jLDX0Wf.png')
      .setFooter({ text: 'Keyifli oyunlar dileriz!' })
      .setTimestamp();

    kanal.send({ embeds: [embed] });
  }
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const komutAdi = args.shift().toLowerCase();

  const komut = client.commands.get(komutAdi);

  if (!komut) return;

  try {
    if (komut.name === 'ping') {
      await komut.execute(message, client);
    } else {
      await komut.execute(message);
    }
  } catch (error) {
    console.error(error);
    message.reply('Komut çalışırken bir hata oldu');
  }
});

client.login(process.env.TOKEN);
