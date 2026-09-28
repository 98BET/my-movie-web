import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedCategories() {
  const categories = [
    { name: 'แอคชั่น', slug: 'action' },
    { name: 'ดราม่า', slug: 'drama' },
    { name: 'สยองขวัญ', slug: 'horror' },
    { name: 'ไซไฟ', slug: 'sci-fi' },
    { name: 'ตลก', slug: 'comedy' },
    { name: 'โรแมนติก', slug: 'romance' },
    { name: 'ผจญภัย', slug: 'adventure' },
    { name: 'อนิเมะ / การ์ตูน', slug: 'cartoon' },
    { name: 'หนังทั่วไป', slug: 'general' }
  ];

  console.log('📦 กำลังเพิ่มหมวดหมู่ลงฐานข้อมูล...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`✅ เพิ่มหมวดหมู่: ${cat.name}`);
  }
  console.log('🎉 เสร็จสิ้น!');
  await prisma.$disconnect();
  await pool.end();
}

seedCategories();
