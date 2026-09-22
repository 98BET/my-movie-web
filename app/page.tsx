import prisma from "../lib/prisma";
import MovieCard from "../components/MovieCard";
import Link from "next/link";

export const revalidate = 60; // ISR แคช 60 วินาที

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

interface Category {
  id: string;
  name: string;
}

interface Movie {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  rating?: number | null;
  year?: number | null;
  views?: number;
  category?: { name: string } | null;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const selectedCategory = resolvedParams.category || "";
  const page = Number(resolvedParams.page) || 1;
  const pageSize = 20;

  // สร้างเงื่อนไขการค้นหาและกรองหมวดหมู่
  const whereClause: any = {};
  if (query) {
    whereClause.title = { contains: query, mode: "insensitive" };
  }
  if (selectedCategory) {
    whereClause.categoryId = selectedCategory;
  }

  // ดึงข้อมูลหมวดหมู่ทั้งหมด, หนังตามเงื่อนไข, จำนวนหนัง, และข้อมูล Hero/Popular
  const [categories, movies, totalMovies, heroMovie, popularMovies] = await Promise.all([
    prisma.category.findMany(),
    prisma.movie.findMany({
      where: whereClause,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.movie.count({ where: whereClause }),
    page === 1 && !query && !selectedCategory 
      ? prisma.movie.findFirst({ orderBy: { createdAt: "desc" } }) 
      : null,
    page === 1 && !query && !selectedCategory
      ? prisma.movie.findMany({
          orderBy: { views: "desc" },
          take: 5,
          include: { category: true },
        })
      : Promise.resolve([]),
  ]);

  const totalPages = Math.ceil(totalMovies / pageSize);

  return (
    <div className="pb-16 bg-[#0b0b0d] min-h-screen text-gray-100">
      {/* ส่วน Hero Banner (แสดงเฉพาะหน้าแรกสุด) */}
      {heroMovie && (
        <div className="relative w-full h-[50vh] md:h-[65vh] max-h-[650px] bg-[#0b0b0d] border-b border-yellow-500/10 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroMovie.bannerUrl || heroMovie.posterUrl || 'https://via.placeholder.com/1280x720'} 
              alt={heroMovie.title}
              className="w-full h-full object-cover opacity-35 blur-[0.5px] scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0d]/90 via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="max-w-6xl mx-auto flex flex-col items-start gap-3 md:gap-4">
              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                ★ แนะนำล่าสุด
              </span>
              <h1 className="text-2xl md:text-5xl font-extrabold text-white drop-shadow-lg line-clamp-1">
                {heroMovie.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-300 max-w-2xl line-clamp-2 leading-relaxed">
                {heroMovie.description || 'ไม่มีคำอธิบายเกี่ยวกับหนังเรื่องนี้'}
              </p>
              <Link 
                href={`/movie/${heroMovie.slug}`}
                className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_25px_rgba(234,179,8,0.35)] hover:scale-105 active:scale-95"
              >
                ▶ รับชมภาพยนตร์
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ส่วนหลักของหน้าเว็บ */}
      <main className="max-w-6xl mx-auto px-4 mt-8 md:mt-12 space-y-12">
        
        {/* แถบเลือกหมวดหมู่ (Genre Filter Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all border ${
              !selectedCategory 
                ? "bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20 font-bold" 
                : "bg-neutral-900 text-gray-300 border-neutral-800 hover:border-neutral-700 hover:text-white"
            }`}
          >
            🔥 ทั้งหมด
          </Link>
          {categories.map((cat: Category) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id 
                  ? "bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20 font-bold" 
                  : "bg-neutral-900 text-gray-300 border-neutral-800 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* โซนภาพยนตร์ยอดนิยม (แสดงเฉพาะหน้าแรกเมื่อไม่ได่ค้นหาหรือเลือกหมวดหมู่) */}
        {!query && !selectedCategory && popularMovies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-l-4 border-yellow-500 pl-3">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                🔥 ภาพยนตร์ยอดนิยม (Viewed Most)
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {popularMovies.map((movie: Movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* โซนรายการหนังทั้งหมด / ผลการค้นหาและกรองหมวดหมู่ */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-yellow-500 pl-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                {query ? `ผลการค้นหา: "${query}"` : selectedCategory ? "ภาพยนตร์ตามหมวดหมู่" : "ภาพยนตร์มาใหม่"}
              </h2>
              <span className="text-xs md:text-sm text-gray-400">
                พบทั้งหมด {totalMovies} เรื่อง
              </span>
            </div>

            {/* ช่องค้นหาพรีเมียม */}
            <form method="GET" className="w-full md:w-80">
              {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="ค้นหาชื่อภาพยนตร์..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm focus:outline-none focus:border-yellow-500/80 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500 transition-all shadow-inner"
                />
              </div>
            </form>
          </div>

          {movies.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/40 rounded-2xl border border-neutral-800/80 text-gray-400 backdrop-blur-sm">
              ไม่พบข้อมูลภาพยนตร์ในหมวดหมู่นี้
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {movies.map((movie: Movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}

          {/* ปุ่มเปลี่ยนหน้า Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              {page > 1 && (
                <a
                  href={`/?${selectedCategory ? `category=${selectedCategory}&` : ''}q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-yellow-500/50 hover:text-yellow-400 text-sm font-medium transition-all"
                >
                  ก่อนหน้า
                </a>
              )}
              <span className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-sm font-bold shadow-lg shadow-yellow-500/10">
                หน้า {page} จาก {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/?${selectedCategory ? `category=${selectedCategory}&` : ''}q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-yellow-500/50 hover:text-yellow-400 text-sm font-medium transition-all"
                >
                  ถัดไป
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}