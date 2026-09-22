import axios from 'axios';
import * as cheerio from 'cheerio';

async function testLocalScrape() {
  const targetUrl = 'http://192.168.1.131:3000/';
  
  console.log(`🔍 กำลังทดสอบเชื่อมต่อเว็บตัวเองที่: ${targetUrl}`);

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);

    const pageTitle = $('title').text().trim();
    
    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });

    const uniqueLinks = [...new Set(links)];

    console.log('\n--- ผลการทดสอบเชื่อมต่อเว็บตัวเอง ---');
    console.log(`🌐 สถานะการเชื่อมต่อ: ✅ สำเร็จ (Status: ${response.status})`);
    console.log(`📄 Title ของเว็บ: ${pageTitle || '❌ ไม่พบแท็ก title'}`);
    console.log(`🔗 จำนวนลิงก์ทั้งหมดที่เจอในหน้าแรก: ${uniqueLinks.length} ลิงก์`);
    console.log('ตัวอย่างลิงก์ 5 รายการแรก:', uniqueLinks.slice(0, 5));

  } catch (err) {
    console.error(`❌ เชื่อมต่อไม่สำเร็จ: ${err.message}`);
  }
}

testLocalScrape();