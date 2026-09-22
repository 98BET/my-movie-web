import prisma from "../../../lib/prisma";
import VideoPlayer from "../../../components/VideoPlayer";
import AdBanner from "../../../components/AdBanner";
import MovieCard from "../../../components/MovieCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Category {
  name: string;
}

interface Movie {
  id: string;
  title: string;
  slug: string;
  embedUrl: string;
  posterUrl?: string | null;
  year?: number | null;
  description?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  views?: number;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const slug = decodeURIComponent(rawSlug);

  const movie =
    (await prisma.movie.findUnique({ where: { slug } })) ||
    (await prisma.movie.findUnique({ where: { slug: rawSlug } }));

  if (!movie) return { title: "ไม่พบหนัง" };

  const domain = 'https://14kmovie.com'; // เปลี่ยนเป็นโดเมนจริงของคุณเมื่อขึ้น Production

  return {
    title: `${movie.title} - ดูหนังออนไลน์`,
    description: movie.description || 'ดูหนังออนไลน์ คมชัดระดับ HD อัปเดตใหม่ล่าสุด',
    openGraph: {
      title: movie.title,
      description: movie.description || 'ดูหนังออนไลน์ คมชัดระดับ HD',
      url: `${domain}/movie/${movie.slug}`,
      siteName: 'Movie Streaming',
      images: [
        {
          url: movie.posterUrl || `${domain}/default-banner.jpg`,
          width: 1200,
          height: 630,
          alt: movie.title,
        },
      ],
      locale: 'th_TH',
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.description || 'ดูหนังออนไลน์ คมชัดระดับ HD',
      images: [movie.posterUrl || ''],
    },
  };
}

export default async function MovieWatchPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const slug = decodeURIComponent(rawSlug);

  // 1. ค้นหาข้อมูลหนัง (รองรับทั้งแบบ decode และ raw)
  const existingMovie =
    (await prisma.movie.findUnique({
      where: { slug },
      include: { category: true },
    })) ||
    (await prisma.movie.findUnique({
      where: { slug: rawSlug },
      include: { category: true },
    }));

  if (!existingMovie) {
    notFound();
  }

  // 2. อัปเดตยอดวิวเพิ่มขึ้นทีละ 1 แบบอัตโนมัติด้วย ID ที่พบ
  const movie = await prisma.movie.update({
    where: { id: existingMovie.id },
    data: { views: { increment: 1 } },
    include: { category: true },
  });

  // 3. ดึงข้อมูลโฆษณาแบนเนอร์
  let ads = [];
  try {
    ads = await prisma.advertisement.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (err) {
    console.warn("⚠️ ยังไม่ได้สร้างตาราง Advertisement หรือไม่มีข้อมูลโฆษณา");
  }

  // 4. ดึงหนังที่เกี่ยวข้อง (หมวดหมู่เดียวกัน ยกเว้นเรื่องปัจจุบัน จำนวน 5 เรื่อง)
  let relatedMovies: Movie[] = [];
  try {
    relatedMovies = await prisma.movie.findMany({
      where: {
        categoryId: movie.categoryId || undefined,
        NOT: { id: movie.id },
      },
      take: 5,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("⚠️ ไม่สามารถดึงหนังที่เกี่ยวข้องได้");
  }

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ปุ่มย้อนกลับ */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-yellow-400 transition-colors"
        >
          ← กลับหน้าหลัก
        </Link>

        {/* ป้ายโฆษณาหน้าดูหนัง (แสดงเหนือวิดีโอ) */}
        {ads.length > 0 && <AdBanner ads={ads} />}

        {/* ตัวเล่นวิดีโอ */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 bg-neutral-900">
          <VideoPlayer embedUrl={movie.embedUrl} title={movie.title} />
        </div>

        {/* รายละเอียดหนัง */}
        <div className="bg-neutral-900/90 p-6 md:p-8 rounded-2xl border border-neutral-800/80 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">{movie.title}</h1>
              {movie.year && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
                  {movie.year}
                </span>
              )}
              {movie.category?.name && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-neutral-800 text-gray-300 border border-neutral-700">
                  {movie.category.name}
                </span>
              )}
            </div>
            {/* แสดงยอดวิว */}
            <div className="text-xs font-medium text-gray-400 bg-neutral-800/60 px-3 py-1.5 rounded-xl border border-neutral-700/50">
              👁️ เข้าชม {movie.views?.toLocaleString() || 0} ครั้ง
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
            {movie.description || "ไม่มีคำอธิบายเกี่ยวกับหนังเรื่องนี้"}
          </p>
        </div>

        {/* หนังที่เกี่ยวข้อง */}
        {relatedMovies.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-neutral-800/80">
            <div className="border-l-4 border-yellow-500 pl-3">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                เรื่องที่คุณอาจจะชอบ
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {relatedMovies.map((item: Movie) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}