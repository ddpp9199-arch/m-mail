const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ตั้งค่าพื้นฐาน
const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1503702683742240889'; 
const GUILD_ID = '1480399608457859082'; 

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// สร้างคำสั่ง /ssoo
const commands = [
    new SlashCommandBuilder()
        .setName('ssoo')
        .setDescription('ส่งข้อความลับแบบไม่ระบุตัวตน')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('ข้อความที่ต้องการส่ง')
                .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// ลงทะเบียนคำสั่ง
(async () => {
    try {
        console.log('กำลังลงทะเบียน Slash Commands...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log('ลงทะเบียนคำสั่งสำเร็จแล้ว!');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลงทะเบียนคำสั่ง:', error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// รอรับคำสั่ง
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ssoo') {
        const msg = interaction.options.getString('message');
        
        const embed = new EmbedBuilder()
            .setColor('#ffafcc')
            .setTitle('💌 มีข้อความลับส่งถึงคุณ!')
            .setDescription(msg)
            .setFooter({ text: 'ส่งผ่านระบบ M-Mail' })
            .setTimestamp();

        try {
            await interaction.reply({ content: 'ส่งข้อความสำเร็จแล้ว!', ephemeral: true });
            await interaction.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error interaction:', error);
        }
    }
});

client.login(TOKEN);
