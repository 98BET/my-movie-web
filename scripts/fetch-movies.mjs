import 'dotenv/config';

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;

async function testFetch() {
  console.log('🚀 กำลังทดสอบเชื่อมต่อ Bunny.net...');

  // 1. สร้าง Video Entry บน Bunny
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        AccessKey: BUNNY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Test Video - Big Buck Bunny' }),
    }
  );

  const createData = await createRes.json();
  const videoId = createData.guid;

  if (!videoId) {
    console.error('❌ สร้าง Video ไม่สำเร็จ:', createData);
    return;
  }

  console.log(`✅ [1/2] สร้าง Video ID บน Bunny สำเร็จ: ${videoId}`);

  // 2. สั่ง Bunny ไปดูดไฟล์ MP4 ตัวอย่าง
  const sampleMp4 = 'https://vjs.zencdn.net/v/oceans.mp4';
  
  const fetchRes = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/fetch`,
    {
      method: 'POST',
      headers: {
        AccessKey: BUNNY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: sampleMp4 }),
    }
  );

  const fetchData = await fetchRes.json();
  if (fetchData.success) {
    console.log(`🎉 [2/2] สั่ง Bunny ดึงไฟล์เข้าเซิร์ฟเวอร์เรียบร้อย!`);
    console.log(`🔗 ลิงก์ Embed สำหรับไปเปิดบนเว็บ: https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`);
  } else {
    console.error('❌ ดึงไฟล์ไม่สำเร็จ:', fetchData);
  }
}

testFetch();