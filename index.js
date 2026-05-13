const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1503702683742240889'; 

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

// สร้างคำสั่ง /send พร้อมช่องใส่รูป
const commands = [
    new SlashCommandBuilder()
        .setName('send')
        .setDescription('ฝากบอกคนน่ารัก')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('พิมพ์ข้อความที่อยากบอก (อะไรก็ได้)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('hint')
                .setDescription('พิมพ์คำใบ้เกี่ยวกับตัวเขา (ห้ามเกิน 150 ตัวอักษร)')
                .setMaxLength(150)
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('แนบรูปภาพ (ถ้ามี)')
                .setRequired(false))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// ลงทะเบียนคำสั่งแบบ Global (ไม่ต้องใช้ Guild ID แล้วนะเธอ)
(async () => {
    try {
        console.log('กำลังลงทะเบียนคำสั่งแบบ Global...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('ลงทะเบียนคำสั่งสำเร็จ! (อาจใช้เวลาอัปเดต 1 ชม.)');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`✅ บอท ${client.user.tag} พร้อมทำงานแล้วเธอ!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'send') {
        const msg = interaction.options.getString('message');
        const hint = interaction.options.getString('hint');
        const image = interaction.options.getAttachment('image');
        
        const embed = new EmbedBuilder()
            .setColor('#ffafcc')
            .setTitle('💌 มีข้อความลับส่งถึงคุณ!')
            .addFields(
                { name: 'จากผู้ส่งถึงคุณ:', value: msg },
                { name: 'คำใบ้จากเขา:', value: `||${hint}||` } // ใส่สปอยล์ไว้ให้ลุ้น
            )
            .setFooter({ text: 'ส่งผ่านระบบ M-Mail' })
            .setTimestamp();

        if (image) {
            embed.setImage(image.url);
        }

        try {
            // ส่งข้อความลงในช่อง
            await interaction.channel.send({ embeds: [embed] });
            
            // ข้อความตอบกลับตอนกดส่งเสร็จตามที่เธอขอ
            const successMsg = `วิธี ฝากบอกคนน่ารัก ദ്ദി◝ ⩊ ◜.ᐟ\n- พิมพ์คำสั่ง /send ในช่องแชทห้องนี้\n( /send บอทชื่อ M-Mail )\n- จะมีช่องขึ้นมาให้เติม 2 ช่อง:\nฝาก: พิมพ์ข้อความที่อยากบอก (อะไรก็ได้)\nใบ้: พิมพ์คำใบ้เกี่ยวกับตัวเขา\n(ห้ามเกิน 150 ตัวอักษร)ครับ\n- กด Enter เพื่อส่งได้เลยครับ ข้อความจะเด้งไปอีกช่องนึงเลยทันที`;
            
            await interaction.reply({ content: successMsg, ephemeral: true });
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(TOKEN);
