const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ดึงค่าจาก Environment Variables
const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1503702683742240889'; 
const GUILD_ID = '1480399608457859082'; 

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

// สร้างโครงสร้างคำสั่ง
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

// ฟังก์ชันลงทะเบียนคำสั่ง
(async () => {
    try {
        console.log('--- เริ่มการลงทะเบียนคำสั่ง ---');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log('--- ลงทะเบียนคำสั่งสำเร็จ! ---');
    } catch (error) {
        console.error('❌ ลงทะเบียนคำสั่งไม่สำเร็จ:', error);
    }
})();

client.on('ready', () => {
    console.log(`✅ บอทออนไลน์แล้วในชื่อ: ${client.user.tag}`);
});

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
            // ส่งข้อความลงในช่องที่ใช้คำสั่ง
            await interaction.channel.send({ embeds: [embed] });
            // ตอบกลับเฉพาะคนที่ใช้คำสั่งว่าส่งแล้วนะ
            await interaction.reply({ content: 'ส่งข้อความเรียบร้อยแล้ว!', ephemeral: true });
        } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดตอนส่งข้อความ:', error);
        }
    }
});

// ตรวจสอบก่อน Login
if (!TOKEN) {
    console.error('❌ ไม่พบค่า TOKEN ใน Environment Variables!');
} else {
    client.login(TOKEN).catch(err => {
        console.error('❌ Login ไม่สำเร็จ (เช็ก Token อีกรอบนะเธอ):', err);
    });
}
