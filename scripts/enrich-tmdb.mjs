import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// TMDB API Key
const TMDB_API_KEY = process.env.TMDB_API_KEY || '6ecc8215449fe66713f654cdb1330712';

async function fetchTMDBData(title) {
  const cleanTitle = title
    .replace(/\(\d{4}\)/g, '')
    .replace(/\b(202[0-9]|201[0-9])\b/g, '')
    .trim();

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=th-TH`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      return {
        posterUrl: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : null,
        bannerUrl: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : null,
        description: match.overview || null,
        rating: match.vote_average ? parseFloat(match.vote_average.toFixed(1)) : 0,
        year: match.release_date ? parseInt(match.release_date.split('-')[0]) : null,
      };
    }
  } catch (err) {
    console.error(`⚠️ ดึงข้อมูล TMDB ล้มเหลวสำหรับ: ${title}`);
  }
  return null;
}

async function enrichMovies() {
  console.log('🚀 เริ่มต้นอัปเดตข้อมูลและรูปภาพจาก TMDB...\n');

  const movies = await prisma.movie.findMany();
  console.log(`🎬 พบหนังในระบบทั้งหมด ${movies.length} เรื่อง\n`);

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    console.log(`[${i + 1}/${movies.length}] กำลังค้นหา TMDB: ${movie.title}`);

    const tmdbData = await fetchTMDBData(movie.title);

    if (tmdbData) {
      await prisma.movie.update({
        where: { id: movie.id },
        data: {
          ...(tmdbData.posterUrl && { posterUrl: tmdbData.posterUrl }),
          ...(tmdbData.bannerUrl && { bannerUrl: tmdbData.bannerUrl }),
          ...(tmdbData.description && { description: tmdbData.description }),
          ...(tmdbData.rating && { rating: tmdbData.rating }),
          ...(tmdbData.year && { year: tmdbData.year }),
        },
      });
      console.log(`  ✅ อัปเดตรูปภาพและข้อมูลเรียบร้อย`);
    } else {
      console.log(`  ❌ ไม่พบข้อมูลบน TMDB`);
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log('\n🎉 อัปเดตข้อมูลภาพโปสเตอร์ TMDB ครบทุกรายการเรียบร้อย!');
  await prisma.$disconnect();
  await pool.end();
}

enrichMovies();