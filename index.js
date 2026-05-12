const http = require('http');
http.createServer((req, res) => { res.write("M-Mail Online!"); res.end(); }).listen(process.env.PORT || 8080);

const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// --- ข้อมูลไอดีที่เธอให้มาล่าสุด ---
const SOURCE_ID = '1496039663540895774'; // ห้องเขียนคำสั่ง /send
const TARGET_ID = '1496039934912630854'; // ห้องที่ข้อความจะไปถึง
const CLIENT_ID = 'ใส่ไอดีบอทตัวที่2ตรงนี้'; // เอามาจาก Discord Developer Portal
const GUILD_ID = 'ใส่ไอดีเซิร์ฟเวอร์ตรงนี้'; // ไอดีดิสคอร์ดของเธอ
// -----------------------

const commands = [
    new SlashCommandBuilder().setName('send').setDescription('ฝากบอกคนน่ารัก')
        .addStringOption(opt => opt.setName('ฝาก').setDescription('พิมพ์ข้อความที่อยากบอก').setRequired(true).setMaxLength(150))
        .addStringOption(opt => opt.setName('ใบ้').setDescription('พิมพ์คำใบ้เกี่ยวกับตัวเขา').setRequired(true).setMaxLength(150)),
    new SlashCommandBuilder().setName('ssoo').setDescription('วิธีใช้งานบอท M-Mail')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => { try { await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands }); } catch (e) { console.error(e); } })();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'send') {
        if (interaction.channelId !== SOURCE_ID) {
            return interaction.reply({ content: 'ต้องพิมพ์ในห้องที่กำหนดเท่านั้นนะเธอ!', ephemeral: true });
        }

        const tell = interaction.options.getString('ฝาก');
        const hint = interaction.options.getString('ใบ้');
        const target = client.channels.cache.get(TARGET_ID);

        if (target) {
            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('🦴 🎶 มีคนฝากข้อความ')
                .addFields(
                    { name: 'ที่อยากบอกคนนั้น:', value: tell },
                    { name: 'ใบ้ถึงคนนั้น:', value: hint }
                )
                .setImage('https://raw.githubusercontent.com/ddpp9199-arch/-/main/1000016742_3.jpg')
                .setFooter({ text: `ส่งเมื่อ: ${new Date().toLocaleTimeString('th-TH')}` });

            await target.send({ embeds: [embed] });
            
            await interaction.reply({ content: 'ส่งข้อความเรียบร้อยแล้วครับ! ദ്ดิ◝ ⩊ ◜.ᐟ' });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 2000);
        }
    }

    if (interaction.commandName === 'ssoo') {
        const helpText = `**วิธี ฝากบอกคนน่ารัก  ദ്ดิ◝ ⩊ ◜.ᐟ**\n- พิมพ์คำสั่ง \`/send\` ในช่องแชทห้องนี้\n- จะมีช่องขึ้นมาให้เติม 2 ช่อง: **ฝาก** และ **ใบ้**\n- กด Enter เพื่อส่งได้เลยครับ ข้อความจะเด้งไปอีกช่องนึงทันที`;
        await interaction.reply({ content: helpText });
    }
});

client.login(process.env.TOKEN);
