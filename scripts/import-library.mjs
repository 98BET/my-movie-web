import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("ตั้ง DATABASE_URL ใน .env ก่อนรันสคริปต์");
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return url;
  }
}

const adapter = new PrismaPg({ connectionString: connectionString() });
const prisma = new PrismaClient({ adapter });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  throw new Error("ตั้ง TMDB_API_KEY ใน .env ก่อนรันสคริปต์");
}

function toSlug(title, tmdbId) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9ก-ฮ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "movie";
  return `${base}-tmdb-${tmdbId}`;
}

function toGenreSlug(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^\w\u0E00-\u0E7F]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

async function fetchTmdbMovie(tmdbId) {
  const thai = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?language=th-TH&api_key=${TMDB_API_KEY}`
  );

  let data;
  if (thai.ok) {
    data = await thai.json();
  } else {
    const english = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?language=en-US&api_key=${TMDB_API_KEY}`
    );
    if (!english.ok) {
      throw new Error(`ไม่พบหนัง TMDB ID ${tmdbId}`);
    }
    data = await english.json();
  }

  const genre = data.genres?.[0] || { name: "ทั่วไป" };

  return {
    title: data.title || data.original_title || `TMDB ${tmdbId}`,
    description: data.overview || "",
    posterUrl: data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : "https://via.placeholder.com/300x450",
    bannerUrl: data.backdrop_path
      ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
      : null,
    year: data.release_date
      ? new Date(data.release_date).getFullYear()
      : new Date().getFullYear(),
    rating: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
    genreName: genre.name,
  };
}

async function upsertCategory(genreName) {
  const slug = toGenreSlug(genreName);
  return prisma.category.upsert({
    where: { slug },
    update: { name: genreName },
    create: { name: genreName, slug },
  });
}

async function main() {
  const fileArg = process.argv[2] || "scripts/import-library.json";
  const filePath = path.resolve(fileArg);
  const raw = await readFile(filePath, "utf8");
  const entries = JSON.parse(raw);

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("ไฟล์รายการต้องเป็น JSON array ของ { tmdbId, embedUrl }");
  }

  for (const entry of entries) {
    const tmdbId = String(entry.tmdbId || "").trim();
    const embedUrl = String(entry.embedUrl || "").trim();

    if (!tmdbId || !embedUrl) {
      console.warn("ข้ามรายการที่ไม่มี tmdbId หรือ embedUrl:", entry);
      continue;
    }

    const meta = await fetchTmdbMovie(tmdbId);
    const category = await upsertCategory(meta.genreName);
    const slug = toSlug(meta.title, tmdbId);

    await prisma.movie.upsert({
      where: { slug },
      update: {
        title: meta.title,
        description: meta.description,
        posterUrl: meta.posterUrl,
        bannerUrl: meta.bannerUrl,
        embedUrl,
        rating: meta.rating,
        year: meta.year,
        categoryId: category.id,
      },
      create: {
        title: meta.title,
        slug,
        description: meta.description,
        posterUrl: meta.posterUrl,
        bannerUrl: meta.bannerUrl,
        embedUrl,
        rating: meta.rating,
        year: meta.year,
        categoryId: category.id,
      },
    });

    console.log(`บันทึกแล้ว: ${meta.title} (TMDB ${tmdbId})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
