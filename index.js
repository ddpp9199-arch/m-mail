const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// --- การตั้งค่าความปลอดภัย ---
// เราจะดึง Token จากระบบ Environment ของ Render เพื่อไม่ให้ Discord สั่งลบโค้ด
const TOKEN = process.env.DISCORD_TOKEN; 
const CLIENT_ID = '1503702683742240889'; 
const TARGET_CHANNEL_ID = '1496039934912630854'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

// สร้างโครงสร้างคำสั่ง /send และ /way
const commands = [
    new SlashCommandBuilder()
        .setName('send')
        .setDescription('ฝากข้อความลับแบบไม่ระบุตัวตน')
        .addStringOption(opt => opt.setName('to').setDescription('ฝากถึงว่า').setRequired(true))
        .addStringOption(opt => opt.setName('hint').setDescription('ใบ้ถึงคนที่น่ารัก').setRequired(true)),
    new SlashCommandBuilder()
        .setName('way')
        .setDescription('ส่งข้อความพร้อมรูปภาพ')
        .addStringOption(opt => opt.setName('text').setDescription('เขียนข้อความ').setRequired(true))
        .addAttachmentOption(opt => opt.setName('image').setDescription('แนบรูปภาพ').setRequired(true)),
].map(cmd => cmd.toJSON());

// ฟังก์ชันลงทะเบียนคำสั่ง Slash Commands
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('กำลังลงทะเบียนคำสั่ง...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ ลงทะเบียนคำสั่งสำเร็จ!');
    } catch (error) {
        console.error('❌ Error ในการลงทะเบียนคำสั่ง:', error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --- ระบบคำสั่ง /send ---
    if (interaction.commandName === 'send') {
        const to = interaction.options.getString('to');
        const hint = interaction.options.getString('hint');

        try {
            const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
            const msg = `เธอค้าบ มีคนส่งข้อความหา\nฝากถึงว่า\n${to}\nใบ้ถึงคนที่น่ารัก\n${hint}\n︶ ⏝ ︶ ୨୧ ︶ ⏝ ︶\nตอบกลับเลยครับ`;
            
            await channel.send(msg);
            await interaction.reply({ content: '📬 ส่งข้อความเรียบร้อย! (ข้อความนี้จะหายไปใน 1 นาที)', ephemeral: false });
            
            // ลบข้อความแจ้งเตือนหลังจาก 1 นาที
            setTimeout(() => interaction.deleteReply().catch(() => {}), 60000);
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ ส่งข้อความไม่สำเร็จ โปรดเช็ค ID ห้องปลายทาง', ephemeral: true });
        }
    }

    // --- ระบบคำสั่ง /way ---
    if (interaction.commandName === 'way') {
        const text = interaction.options.getString('text');
        const image = interaction.options.getAttachment('image');

        try {
            await interaction.channel.send({
                content: text,
                files: [image.url]
            });
            await interaction.reply({ content: '✅ ส่งรูปภาพเรียบร้อย', ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการส่งรูป', ephemeral: true });
        }
    }
});

client.on('ready', () => {
    console.log(`🚀 บอทออนไลน์แล้วในชื่อ: ${client.user.tag}`);
});

// เริ่มต้นบอท
client.login(TOKEN).catch(err => {
    console.error('❌ เข้าสู่ระบบไม่สำเร็จ:', err.message);
});
