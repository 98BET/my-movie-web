import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TMDB_API_KEY = process.env.TMDB_API_KEY || '6ecc8215449fe66713f654cdb1330712';

const axiosClient = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
  },
  timeout: 30000
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomDelay = () => Math.floor(Math.random() * 2000) + 1500;

async function getMovieLinksFromCatalog(catalogUrl) {
  console.log(`🌐 กำลังกวาดลิงก์หนังจากหน้า: ${catalogUrl}`);
  try {
    const response = await axiosClient.get(catalogUrl);
    const $ = cheerio.load(response.data);
    
    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });

    const ignorePatterns = [
      '/category/', '/page/', '/tag/', '/genre/', '/year/', '/country/', 
      'wp-login', 'wp-admin', 'facebook.com', 'line.me', 't.me', 'twitter.com', 
      'instagram.com', 'tiktok.com', 'youtube.com', 'embed', '#'
    ];

    const filtered = links.filter((href) => {
      if (!href.includes('hd432.com')) return false;
      if (ignorePatterns.some(pattern => href.includes(pattern))) return false;
      
      try {
        const url = new URL(href);
        if (url.pathname === '/' || url.pathname === '') return false;
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length === 1) return true;
      } catch (e) {}
      
      return false;
    });

    const uniqueLinks = [...new Set(filtered)];
    console.log(`✅ คัดกรองเจอลิงก์หนังจริง: ${uniqueLinks.length} ลิงก์\n`);
    return uniqueLinks;
  } catch (err) {
    console.error(`⚠️ หน้านี้ติด Cloudflare หรือเข้าไม่ได้ (${err.message}) - ข้าม`);
    return [];
  }
}

// 🔍 ฟังก์ชันดึงรายละเอียดและหมวดหมู่จริงจาก TMDB API
async function fetchTMDBData(title) {
  const cleanTitle = title
    .replace(/\(\d{4}\)/g, '')
    .replace(/\b(202[0-9]|201[0-9])\b/g, '')
    .trim();

  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=th-TH`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      const movieId = match.id;

      // ดึงข้อมูลประเภทหนัง (Genres) แบบละเอียดเป็นภาษาไทย
      const detailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=th-TH`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();

      const primaryGenre = detailData.genres && detailData.genres.length > 0 
        ? detailData.genres[0] 
        : { name: 'หนังทั่วไป', id: 0 };

      return {
        posterUrl: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : null,
        bannerUrl: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : null,
        description: match.overview || null,
        rating: match.vote_average ? parseFloat(match.vote_average.toFixed(1)) : 0,
        year: match.release_date ? parseInt(match.release_date.split('-')[0]) : null,
        genre: primaryGenre,
      };
    }
  } catch (err) {
    console.error(`⚠️ ดึงข้อมูล TMDB ล้มเหลวสำหรับ: ${title}`);
  }
  return null;
}

async function scrapeMovieData(pageUrl) {
  console.log(`🔍 [Axios Direct] สแกนหน้าหนัง: ${pageUrl}`);
  try {
    const response = await axiosClient.get(pageUrl);
    const $ = cheerio.load(response.data);

    let title = $('h1').text().trim();
    if (!title) {
      const pageTitle = $('title').text();
      title = pageTitle.split('-')[0].trim();
    }

    let posterUrl = null;
    const imgSelectors = ['article img', '.poster img', '.entry-content img', '.post-thumbnail img', '.movie-poster img', '.thumb img'];
    for (const sel of imgSelectors) {
      const src = $(sel).first().attr('src');
      if (src) {
        posterUrl = src;
        break;
      }
    }

    let embedUrl = null;
    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        const lowerSrc = src.toLowerCase();
        if (!lowerSrc.includes('youtube.com') && !lowerSrc.includes('vimeo.com')) {
          if (lowerSrc.includes('embed') || lowerSrc.includes('fastplayer') || lowerSrc.includes('cdnbm') || lowerSrc.includes('ssplayer') || lowerSrc.includes('player')) {
            let realUrl = src;
            if (src.includes('?link=')) {
              try {
                const parsedUrl = new URL(src);
                const linkParam = parsedUrl.searchParams.get('link');
                if (linkParam) realUrl = linkParam;
              } catch (e) {}
            }
            embedUrl = realUrl;
            return false;
          }
        }
      }
    });

    return { title, embedUrl, posterUrl };
  } catch (err) {
    console.error(`⚠️ หนังเรื่องนี้ถูกบล็อกหรือดึงข้อมูลไม่ได้ (${err.message}) - ข้ามไปเรื่องถัดไป`);
    return { title: '', embedUrl: null, posterUrl: null };
  }
}

async function runBulkPipeline() {
  console.log(`🏁 เริ่มต้นระบบ Auto Pipeline แยกหมวดหมู่อัตโนมัติจาก TMDB...\n`);

  let allMovieUrls = [];
  const maxPages = 100; // ตั้งเพดานสูงสุดไว้เผื่ออนาคต

  for (let i = 1; i <= maxPages; i++) {
    const catalogUrl = i === 1 ? 'https://hd432.com/' : `https://hd432.com/page/${i}/`;
    const links = await getMovieLinksFromCatalog(catalogUrl);
    
    // ถ้าหน้านั้นไม่มีลิงก์ (หรือติด Error 500 / หน้าหมด) ให้ตัดจบการกวาดทันที
    if (links.length === 0) {
      console.log(`🛑 สิ้นสุดหน้าแคตตาล็อกที่หน้า ${i} (หรือหน้าเว็บหมด/เข้าไม่ได้) - หยุดการกวาดลิงก์อัตโนมัติ\n`);
      break;
    }

    allMovieUrls.push(...links);
    await sleep(getRandomDelay());
  }

  allMovieUrls = [...new Set(allMovieUrls)];
  console.log(`\n🎯 รวบรวมลิงก์หนังทั้งหมดที่ไม่ซ้ำกันได้ ${allMovieUrls.length} เรื่อง เริ่มกระบวนการบันทึก...\n`);

  for (let i = 0; i < allMovieUrls.length; i++) {
    const watchUrl = allMovieUrls[i];
    console.log(`--------------------------------------------------`);
    console.log(`[${i + 1}/${allMovieUrls.length}] กำลังประมวลผล: ${watchUrl}`);

    try {
      const { title, embedUrl, posterUrl } = await scrapeMovieData(watchUrl);

      if (!title || !embedUrl) {
        console.log(`❌ ข้ามเรื่องนี้เนื่องจากไม่พบชื่อหรือเครื่องเล่น`);
        continue;
      }

      console.log(`🎬 ชื่อเรื่อง: ${title}`);

      // ดึงข้อมูลหมวดหมู่และรายละเอียดจาก TMDB
      const tmdbData = await fetchTMDBData(title);
      
      let categoryId;
      if (tmdbData && tmdbData.genre) {
        const genreName = tmdbData.genre.name;
        const genreSlug = genreName.toLowerCase().replace(/[^\w\u0E00-\u0E7F]+/g, '-');

        // ค้นหาหรือสร้างหมวดหมู่ในฐานข้อมูลตามชื่อหมวดหมู่จริงจาก TMDB
        const category = await prisma.category.upsert({
          where: { slug: genreSlug },
          update: {},
          create: { name: genreName, slug: genreSlug },
        });
        categoryId = category.id;
        console.log(`🏷️ หมวดหมู่: ${genreName}`);
      } else {
        // Fallback ถ้าหาหมวดหมู่ไม่เจอ ให้ใส่ general
        const defaultCategory = await prisma.category.upsert({
          where: { slug: 'general' },
          update: {},
          create: { name: 'หนังทั่วไป', slug: 'general' },
        });
        categoryId = defaultCategory.id;
        console.log(`🏷️ หมวดหมู่: หนังทั่วไป (ไม่พบข้อมูลใน TMDB)`);
      }

      const slug = title
        .toLowerCase()
        .replace(/[^\w\u0E00-\u0E7F]+/g, '-')
        .replace(/^-+|-+$/g, '') || `movie-${Date.now()}`;

      console.log(`💾 บันทึกลง Neon DB...`);
      await prisma.movie.upsert({
        where: { slug },
        update: { 
          embedUrl,
          categoryId,
          ...(tmdbData?.posterUrl && { posterUrl: tmdbData.posterUrl }),
          ...(tmdbData?.description && { description: tmdbData.description }),
          ...(tmdbData?.rating && { rating: tmdbData.rating }),
          ...(tmdbData?.year && { year: tmdbData.year }),
        },
        create: {
          title,
          slug,
          embedUrl,
          posterUrl: tmdbData?.posterUrl || posterUrl || 'https://via.placeholder.com/300x450',
          bannerUrl: tmdbData?.bannerUrl || null,
          description: tmdbData?.description || 'อัปเดตอัตโนมัติผ่าน Auto Pipeline',
          rating: tmdbData?.rating || 0,
          year: tmdbData?.year || 2026,
          categoryId,
        },
      });

      console.log(`✅ สำเร็จ! ${title} บันทึกลงฐานข้อมูลเรียบร้อย\n`);
    } catch (err) {
      console.error(`⚠️ เกิดข้อผิดพลาดกับเรื่องนี้: ${err.message}`);
    }

    await sleep(getRandomDelay());
  }

  console.log('🎉 ประมวลผลและจัดหมวดหมู่หนังทั้งหมดเสร็จสิ้น!');
  await prisma.$disconnect();
  await pool.end();
}

runBulkPipeline();