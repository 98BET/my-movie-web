const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ล้างข้อมูลเก่า
  await prisma.advertisement.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.category.deleteMany();

  // สร้างหมวดหมู่
  const actionCat = await prisma.category.create({
    data: { name: 'หนังแอคชั่น Action', slug: 'action' }
  });

  // สร้างโฆษณา Banner ตัวอย่าง
  await prisma.advertisement.createMany({
    data: [
      {
        title: 'SEXY365BET',
        imageUrl: 'https://placehold.co/1200x150/8b5cf6/ffffff?text=SEXY365BET+REGISTER+GET+BONUS+100%',
        targetUrl: 'https://google.com',
        position: 'TOP_BANNER',
        order: 1
      },
      {
        title: 'MAHAGAME66',
        imageUrl: 'https://placehold.co/1200x150/1e40af/ffffff?text=MAHAGAME66+SLOT+ONLINE+BEST+CASINO',
        targetUrl: 'https://google.com',
        position: 'TOP_BANNER',
        order: 2
      }
    ]
  });

  // สร้างหนังตัวอย่าง
  await prisma.movie.create({
    data: {
      title: 'Spider-Man Brand New Day (2026)',
      slug: 'spider-man-brand-new-day-2026',
      description: 'เรื่องราวของสไปเดอร์แมนฉบับพากย์ไทย',
      posterUrl: 'https://placehold.co/300x450/000000/ffffff?text=Spider-Man+2026',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      rating: 8.3,
      year: 2026,
      isRecommended: true,
      categoryId: actionCat.id
    }
  });

  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });