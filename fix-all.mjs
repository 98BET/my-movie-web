import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixRatings() {
  console.log('🔄 กำลังอัปเดตเรตติ้งและปีให้หนังทั้งหมด...');
  
  const result = await prisma.movie.updateMany({
    where: { rating: 0 },
    data: { 
      rating: 7.8, 
    },
  });

  console.log(`✨ สำเร็จ! อัปเดตเรตติ้งให้หนังจำนวน ${result.count} เรื่องเรียบร้อยแล้ว`);
  await prisma.$disconnect();
  await pool.end();
}

fixRatings();