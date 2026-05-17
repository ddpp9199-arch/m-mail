const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// --- ตั้งค่าข้อมูลบอท ---
const TOKEN = 'ใส่_TOKEN_ใหม่ที่นี่'; // <<--- *** ห้ามส่งเลขนี้ให้ใครเด็ดขาด ***
const CLIENT_ID = '1503702683742240889'; 
const TARGET_CHANNEL_ID = '1496039934912630854'; 

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// กำหนดคำสั่ง /send และ /way
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

// ลงทะเบียน Slash Commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ ซิงค์คำสั่ง /send และ /way สำเร็จแล้ว!');
    } catch (err) { console.error(err); }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // ระบบคำสั่ง /send
    if (interaction.commandName === 'send') {
        const to = interaction.options.getString('to');
        const hint = interaction.options.getString('hint');
        const channel = await client.channels.fetch(TARGET_CHANNEL_ID);

        const msg = `เธอค้าบ มีคนส่งข้อความหา\nฝากถึงว่า\n${to}\nใบ้ถึงคนที่น่ารัก\n${hint}\n︶ ⏝ ︶ ୨୧ ︶ ⏝ ︶\nตอบกลับเลยครับ`;
        
        await channel.send(msg);
        await interaction.reply({ content: '📬 ส่งข้อความเรียบร้อย! (ข้อความนี้จะหายไปใน 1 นาที)', ephemeral: false });
        
        // ลบข้อความตอบกลับใน 1 นาทีตามที่ขอ
        setTimeout(() => interaction.deleteReply().catch(() => {}), 60000);
    }

    // ระบบคำสั่ง /way
    if (interaction.commandName === 'way') {
        const text = interaction.options.getString('text');
        const image = interaction.options.getAttachment('image');

        await interaction.channel.send({
            content: text,
            files: [image.url]
        });
        await interaction.reply({ content: '✅ ส่งรูปภาพเรียบร้อย', ephemeral: true });
    }
});

client.on('ready', () => console.log(`🚀 บอท ${client.user.tag} ออนไลน์แล้ว!`));
client.login(TOKEN);
