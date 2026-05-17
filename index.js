import discord
from discord.ext import commands
from discord import app_commands
import asyncio

# ตั้งค่า Intents พื้นฐาน
intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

# ID ของห้อง "ข้อความถึงแล้ว" ที่คุณกำหนดไว้
TARGET_CHANNEL_ID = 1496039934912630854

@bot.event
async def on_ready():
    print(f"ล็อกอินเข้าใช้งานสำเร็จในชื่อ: {bot.user.name}")
    try:
        # ซิงค์คำสั่ง Slash Commands ไปยัง Discord
        synced = await bot.tree.sync()
        print(f"ซิงค์ Slash Commands สำเร็จทั้งหมด {len(synced)} คำสั่ง")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการซิงค์คำสั่ง: {e}")

# ==========================================
# 1. คำสั่ง /send (ฝากข้อความแบบไม่ระบุชื่อ)
# ==========================================
@bot.tree.command(name="send", description="ฝากข้อความส่งถึงใครบางคนแบบไม่ระบุตัวตน")
@app_commands.describe(
    to_someone="คำที่อยากฝากถึงเขา (ช่องที่ 1)",
    hint="คำใบ้ถึงเขา (ช่องที่ 2)"
)
async def send_anonymous(interaction: discord.Interaction, to_someone: str, hint: str):
    # ดึงข้อมูลห้องส่งข้อความปลายทาง
    channel = bot.get_channel(TARGET_CHANNEL_ID)
    
    if channel is None:
        # ถ้าหาห้องไม่เจอ จะตอบกลับแจ้งเตือน (ข้อความนี้เห็นเฉพาะคนกด)
        await interaction.response.send_message("❌ ไม่พบห้องรับข้อความในเซิร์ฟเวอร์ กรุณาตรวจสอบ ID ห้องอีกครั้ง", ephemeral=True)
        return

    # รูปแบบข้อความที่คุณต้องการให้แสดงในห้องปลายทาง
    message_content = (
        "เธอค้าบ มีคนส่งข้อความหา\n"
        f"ฝากถึงว่า\n"
        f"{to_someone}\n"
        f"ใบ้ถึงคนที่น่ารัก\n"
        f"{hint}\n"
        "︶ ⏝ ︶ ୨୧ ︶ ⏝ ︶\n"
        "ตอบกลับเลยครับ"
    )

    try:
        # ส่งข้อความไปยังห้องปลายทาง
        await channel.send(message_content)
        
        # ตอบกลับผู้ใช้ที่พิมพ์คำสั่ง โดยข้อความนี้จะลบตัวเองใน 1 นาที (60 วินาที)
        await interaction.response.send_message("📬 ส่งข้อความลับของคุณเรียบร้อยแล้วครับ! (ข้อความนี้จะหายไปใน 1 นาที)", ephemeral=False)
        
        # รอ 60 วินาทีแล้วทำการลบข้อความโต้ตอบนั้นทิ้งเพื่อความปลอดภัย
        await asyncio.sleep(60)
        await interaction.delete_original_response()
        
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในคำสั่ง /send: {e}")

# ==========================================
# 2. คำสั่ง /way (ส่งข้อความพร้อมรูปภาพ)
# ==========================================
@bot.tree.command(name="way", description="พิมพ์ข้อความพร้อมแนบรูปภาพส่งลงห้องปัจจุบัน")
@app_commands.describe(
    text="ข้อความที่ต้องการพิมพ์",
    image="รูปภาพที่ต้องการแนบ (1 รูป)"
)
async def way_command(interaction: discord.Interaction, text: str, image: discord.Attachment):
    # ตรวจสอบว่าไฟล์ที่ส่งมาเป็นรูปภาพหรือไม่
    if image.content_type and not image.content_type.startswith("image/"):
        await interaction.response.send_message("❌ ไฟล์ที่แนบมาไม่ใช่รูปภาพ กรุณาลองใหม่อีกครั้ง", ephemeral=True)
        return

    try:
        # ประกาศตอบกลับเพื่อเคลียร์สถานะการกดคำสั่ง (ไม่ให้ขึ้นตุ่มโหลดค้าง)
        # เนื่องจากเราต้องการส่งเป็นข้อความธรรมดาเหมือนผู้ใช้พิมพ์เอง เราจะส่งผลลัพธ์ผ่านทางห้องโดยตรง
        await interaction.response.defer(ephemeral=True)
        
        # แปลงไฟล์รูปภาพที่แนบมาเพื่อให้บอทส่งต่อได้
        image_file = await image.to_file()
        
        # ส่งข้อความธรรมดาที่ผู้ใช้พิมพ์ โดยเอารูปภาพไว้ด้านล่างข้อความตามที่ขอ
        await interaction.channel.send(content=text, file=image_file)
        
        # แจ้งเตือนผู้สั่งคำสั่งเบาๆ ว่าส่งแล้ว (เห็นแค่คนกด และจะหายไปเอง)
        await interaction.followup.send("✅ ส่งข้อความสำเร็จ", ephemeral=True)
        
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในคำสั่ง /way: {e}")

# Token บอทที่คุณให้มา
TOKEN = "MTUwMzcwMjY4Mzc0MjI0MDg4OQ.G-53Yk.PSw8Zq9iWdK_bzGGeSheo4xPgaI5r-sAqvKcuk"

# เปิดใช้งานบอท
if __name__ == "__main__":
    bot.run(TOKEN)
