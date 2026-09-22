import prisma from "../../lib/prisma";
import MovieCard from "../../components/MovieCard";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

interface Movie {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  rating?: number | null;
  year?: number | null;
  category?: { name: string } | null;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const page = Number(resolvedParams.page) || 1;
  const pageSize = 20;

  const whereClause = query
    ? { title: { contains: query } }
    : {};

  const [movies, totalMovies] = await Promise.all([
    prisma.movie.findMany({
      where: whereClause,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.movie.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalMovies / pageSize);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen text-gray-100 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-yellow-500 pl-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            ผลการค้นหา: "{query}"
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            พบภาพยนตร์ทั้งหมด {totalMovies} เรื่อง
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-yellow-400 hover:underline"
        >
          ← กลับไปหน้าแรก
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/40 rounded-2xl border border-neutral-800/80 text-gray-400 backdrop-blur-sm space-y-3">
          <p className="text-base">ไม่พบภาพยนตร์ที่คุณค้นหาด้วยคำว่า "{query}"</p>
          <p className="text-xs text-gray-500">ลองตรวจสอบสะกดคำใหม่อีกครั้ง หรือค้นหาด้วยชื่ออื่น</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {movies.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          {page > 1 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-yellow-500/50 hover:text-yellow-400 text-sm font-medium transition-all"
            >
              ก่อนหน้า
            </Link>
          )}
          <span className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-sm font-bold shadow-lg shadow-yellow-500/10">
            หน้า {page} จาก {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-yellow-500/50 hover:text-yellow-400 text-sm font-medium transition-all"
            >
              ถัดไป
            </Link>
          )}
        </div>
      )}
    </main>
  );
}