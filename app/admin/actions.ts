"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

// ฟังก์ชันดึงข้อมูลหนังจาก TMDB API
export async function fetchTmdbMovie(tmdbId: string) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("ไม่พบ TMDB_API_KEY ในไฟล์ .env");

  // ลองดึงภาษาไทยก่อน
  const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=th-TH&api_key=${apiKey}`);
  
  let data;
  if (!res.ok) {
    // ถ้าไม่มีภาษาไทย ให้ดึงภาษาอังกฤษแทน
    const resEn = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=en-US&api_key=${apiKey}`);
    if (!resEn.ok) throw new Error("ไม่พบข้อมูลภาพยนตร์จาก TMDB ID นี้");
    data = await resEn.json();
  } else {
    data = await res.json();
  }

  return {
    title: data.title || data.original_title || "",
    description: data.overview || "",
    posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
    bannerUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "",
    year: data.release_date ? new Date(data.release_date).getFullYear() : new Date().getFullYear(),
    rating: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
  };
}

// เพิ่มหนังใหม่เข้าฐานข้อมูล
export async function createMovie(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const posterUrl = formData.get("posterUrl") as string;
  const bannerUrl = formData.get("bannerUrl") as string;
  const embedUrl = formData.get("embedUrl") as string;
  const rating = parseFloat(formData.get("rating") as string) || 0;
  const year = parseInt(formData.get("year") as string) || new Date().getFullYear();
  const categoryId = formData.get("categoryId") as string;

  // สร้าง Slug ที่ไม่ซ้ำกัน
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, "-").replace(/-+/g, "-") || "movie";
  const slug = `${cleanTitle}-${Date.now().toString().slice(-6)}`;

  await prisma.movie.create({
    data: {
      title,
      slug,
      description,
      posterUrl,
      bannerUrl,
      embedUrl,
      rating,
      year,
      categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

// ลบหนัง
export async function deleteMovie(id: string) {
  await prisma.movie.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}

// เพิ่มโฆษณา Ads
export async function createAd(formData: FormData) {
  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const targetUrl = formData.get("targetUrl") as string;
  const position = formData.get("position") as any;
  const order = parseInt(formData.get("order") as string) || 0;

  await prisma.advertisement.create({
    data: { title, imageUrl, targetUrl, position, order },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

// สลับสถานะเปิด/ปิด Ads
export async function toggleAd(id: string, currentStatus: boolean) {
  await prisma.advertisement.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

// ลบโฆษณา Ads
export async function deleteAd(id: string) {
  await prisma.advertisement.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}