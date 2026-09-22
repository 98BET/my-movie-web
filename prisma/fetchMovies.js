const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔑 API Key TMDB ของคุณ
const TMDB_API_KEY = '6ecc8215449fe66713f654cdb1330712'; 

// 🎯 กำหนดจำนวนหน้าที่ต้องการดึง (1 หน้า = 20 เรื่อง, 5 หน้า = 100 เรื่อง)
const TOTAL_PAGES_TO_FETCH = 5; 

async function fetchAndSeedMovies() {
  console.log(`🚀 เริ่มต้นดึงข้อมูลหนังจำนวนประมาณ ${TOTAL_PAGES_TO_FETCH * 20} เรื่อง...`);

  const categoryMap = {
    28: { name: 'แอคชั่น / บู๊', slug: 'action' },
    35: { name: 'ตลก / คอมเมดี้', slug: 'comedy' },
    18: { name: 'ดราม่า', slug: 'drama' },
    27: { name: 'สยองขวัญ / ผี', slug: 'horror' },
    878: { name: 'ไซไฟ / แฟนตาซี', slug: 'sci-fi' },
    10749: { name: 'โรแมนติก', slug: 'romance' },
    16: { name: 'อนิเมะ / แอนิเมชัน', slug: 'animation' },
  };

  const createdCategories = {};
  for (const [id, cat] of Object.entries(categoryMap)) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });
    createdCategories[id] = created.id;
  }

  const defaultCategory = await prisma.category.upsert({
    where: { slug: 'general' },
    update: {},
    create: { name: 'ทั่วไป', slug: 'general' },
  });

  let totalAdded = 0;

  for (let page = 1; page <= TOTAL_PAGES_TO_FETCH; page++) {
    console.log(`📥 กำลังดึงข้อมูลหน้า ${page}/${TOTAL_PAGES_TO_FETCH}...`);

    try {
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=th-TH&page=${page}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) continue;

      for (const item of data.results) {
        if (!item.poster_path || !item.title) continue;

        const cleanTitle = item.title
          .toLowerCase()
          .replace(/[^a-z0-9ก-๙]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const slug = `${cleanTitle || 'movie'}-${item.id}`;

        const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        const embedUrl = `https://player.autoembed.cc/embed/movie/${item.id}`;

        const releaseYear = item.release_date
          ? parseInt(item.release_date.split('-')[0])
          : 2026;

        const firstGenreId = item.genre_ids && item.genre_ids[0];
        const categoryId = createdCategories[firstGenreId] || defaultCategory.id;

        await prisma.movie.upsert({
          where: { slug },
          update: {
            title: item.title,
            description: item.overview || 'ไม่มีข้อมูลเรื่องย่อภาษาไทย',
            posterUrl,
            embedUrl,
            rating: parseFloat(item.vote_average.toFixed(1)),
            year: releaseYear,
            categoryId,
          },
          create: {
            title: item.title,
            slug,
            description: item.overview || 'ไม่มีข้อมูลเรื่องย่อภาษาไทย',
            posterUrl,
            embedUrl,
            rating: parseFloat(item.vote_average.toFixed(1)),
            year: releaseYear,
            categoryId,
          },
        });

        totalAdded++;
      }
    } catch (error) {
      console.error(`❌ Error หน้า ${page}:`, error.message);
    }
  }

  console.log(`\n🎉 เสร็จสิ้น! อัปเดตและเพิ่มหนังเข้า Neon DB ทั้งหมด ${totalAdded} เรื่องเรียบร้อยแล้ว!`);
}

fetchAndSeedMovies()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });