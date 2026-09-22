import prisma from "../../lib/prisma";
import Link from "next/link";
import { 
  fetchTmdbMovie, 
  createMovie, 
  deleteMovie, 
  createAd, 
  toggleAd, 
  deleteAd 
} from "./actions";
import TmdbFetcher from "./TmdbFetcher";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: string; tmdbId?: string; error?: string; page?: string }>;
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params.tab || "movies";
  const page = Number(params.page) || 1;
  const pageSize = 20; 
  const skip = (page - 1) * pageSize;

  // ป้องกันเว็บพังด้วย try...catch แยกอิสระต่อกัน
  let categories: any[] = [];
  let movies: any[] = [];
  let totalMovies = 0;
  let ads: any[] = [];

  try {
    categories = await prisma.category.findMany();
  } catch (err) {
    console.warn("⚠️ ดึงหมวดหมู่ไม่สำเร็จ:", err);
  }

  try {
    movies = await prisma.movie.findMany({ 
      include: { category: true }, 
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });
  } catch (err) {
    console.warn("⚠️ ดึงรายการหนังไม่สำเร็จ:", err);
  }

  try {
    totalMovies = await prisma.movie.count();
  } catch (err) {
    console.warn("⚠️ นับจำนวนหนังไม่สำเร็จ:", err);
  }

  try {
    ads = await prisma.advertisement.findMany({ orderBy: { order: "asc" } });
  } catch (err) {
    console.warn("⚠️ ดึงข้อมูลโฆษณาไม่สำเร็จ:", err);
  }

  const totalPages = Math.ceil(totalMovies / pageSize) || 1;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                ← กลับหน้าเว็บ
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-wide">
              👑 Admin Dashboard (ระบบจัดการหลังบ้าน)
            </h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
            <a
              href="/admin?tab=movies"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "movies" 
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🎬 จัดการภาพยนตร์ ({totalMovies})
            </a>
            <a
              href="/admin?tab=ads"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "ads" 
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📢 จัดการโฆษณา ({ads.length})
            </a>
          </div>
        </div>

        {/* ----------------- TAB 1: จัดการภาพยนตร์ ----------------- */}
        {activeTab === "movies" && (
          <div className="space-y-10">
            
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-sm space-y-6">
              <div className="border-l-4 border-yellow-500 pl-3">
                <h2 className="text-lg md:text-xl font-bold text-white">เพิ่มภาพยนตร์ใหม่</h2>
                <p className="text-xs text-gray-400">กรอกข้อมูลภาพยนตร์หรือใช้ TMDB ID เพื่อเติมข้อมูลอัตโนมัติ</p>
              </div>

              <form action={createMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TmdbFetcher fetchAction={fetchTmdbMovie} />

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ชื่อภาพยนตร์ *</label>
                  <input required name="title" id="title" type="text" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">หมวดหมู่ *</label>
                  <select required name="categoryId" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500">
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ลิงก์เครื่องเล่นวิดีโอ (Embed/HLS URL) *</label>
                  <input required name="embedUrl" type="text" placeholder="https://..." className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ลิงก์รูปโปสเตอร์ (Poster URL) *</label>
                  <input required name="posterUrl" id="posterUrl" type="text" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ลิงก์ภาพพื้นหลังแบนเนอร์ (Banner URL)</label>
                  <input name="bannerUrl" id="bannerUrl" type="text" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">ปีที่ฉาย</label>
                    <input name="year" id="year" type="number" defaultValue={new Date().getFullYear()} className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">คะแนน (Rating)</label>
                    <input name="rating" id="rating" type="number" step="0.1" defaultValue="7.0" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">เรื่องย่อ / คำอธิบาย</label>
                  <textarea name="description" id="description" rows={3} className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500"></textarea>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/10 cursor-pointer">
                    + บันทึกภาพยนตร์ใหม่
                  </button>
                </div>
              </form>
            </div>

            {/* ตารางรายชื่อหนังทั้งหมด */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">รายชื่อภาพยนตร์ทั้งหมดในระบบ ({totalMovies})</h2>
                <span className="text-xs text-gray-400">แสดงผลหน้าละ {pageSize} เรื่อง</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-neutral-950 text-gray-400 text-xs uppercase border-b border-neutral-800">
                    <tr>
                      <th className="p-3">โปสเตอร์</th>
                      <th className="p-3">ชื่อเรื่อง</th>
                      <th className="p-3">หมวดหมู่</th>
                      <th className="p-3">ยอดวิว</th>
                      <th className="p-3">คะแนน</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {movies.map((movie: any) => (
                      <tr key={movie.id} className="hover:bg-neutral-950/50 transition-colors">
                        <td className="p-3">
                          <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-md border border-neutral-800" />
                        </td>
                        <td className="p-3 font-bold text-white">{movie.title}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-neutral-800 rounded-md text-xs text-gray-300 border border-neutral-700">
                            {movie.category?.name || "ไม่ระบุ"}
                          </span>
                        </td>
                        <td className="p-3 text-yellow-400 font-semibold">👁️ {(movie.views || 0).toLocaleString()}</td>
                        <td className="p-3">★ {movie.rating}</td>
                        <td className="p-3 text-center">
                          <form action={deleteMovie.bind(null, movie.id)}>
                            <button type="submit" className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                              ลบ
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ปุ่มเปลี่ยนหน้าแอดมิน */}
              <div className="flex justify-center items-center gap-4 pt-4">
                {page > 1 && (
                  <a href={`/admin?tab=movies&page=${page - 1}`} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold">
                    ← หน้าก่อนหน้า
                  </a>
                )}
                <span className="text-sm text-gray-400">
                  หน้าที่ {page} จาก {totalPages || 1}
                </span>
                {page < totalPages && (
                  <a href={`/admin?tab=movies&page=${page + 1}`} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold">
                    หน้าถัดไป →
                  </a>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB 2: จัดการโฆษณา ----------------- */}
        {activeTab === "ads" && (
          <div className="space-y-10">
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-sm space-y-6">
              <div className="border-l-4 border-yellow-500 pl-3">
                <h2 className="text-lg md:text-xl font-bold text-white">เพิ่มป้ายโฆษณา (Advertisement)</h2>
                <p className="text-xs text-gray-400">จัดการแบนเนอร์โฆษณาที่จะแสดงในจุดต่างๆ ของเว็บไซต์</p>
              </div>

              <form action={createAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ชื่อโฆษณา *</label>
                  <input required name="title" type="text" placeholder="เช่น แบนเนอร์โปรโมทเว็บ" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ตำแหน่งแสดงผล *</label>
                  <select required name="position" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500">
                    <option value="TOP_BANNER">TOP_BANNER (แบนเนอร์บนสุดหน้าแรก)</option>
                    <option value="SIDEBAR">SIDEBAR (แถบด้านข้าง)</option>
                    <option value="ABOVE_PLAYER">ABOVE_PLAYER (เหนือเครื่องเล่นวิดีโอ)</option>
                    <option value="BELOW_PLAYER">BELOW_PLAYER (ใต้เครื่องเล่นวิดีโอ)</option>
                    <option value="POPUP">POPUP (ป๊อปอัป)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ลิงก์รูปภาพโฆษณา (Image URL) *</label>
                  <input required name="imageUrl" type="text" placeholder="https://..." className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ลิงก์เป้าหมายเมื่อคลิก (Target URL) *</label>
                  <input required name="targetUrl" type="text" placeholder="https://..." className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">ลำดับการแสดงผล (Order)</label>
                  <input name="order" type="number" defaultValue="0" className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-yellow-500" />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/10 cursor-pointer">
                    + เพิ่มป้ายโฆษณา
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white">รายการโฆษณาในระบบ ({ads.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-neutral-950 text-gray-400 text-xs uppercase border-b border-neutral-800">
                    <tr>
                      <th className="p-3">รูปภาพ</th>
                      <th className="p-3">ชื่อโฆษณา</th>
                      <th className="p-3">ตำแหน่ง</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-center">เปิด/ปิด</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {ads.map((ad: any) => (
                      <tr key={ad.id} className="hover:bg-neutral-950/50 transition-colors">
                        <td className="p-3">
                          <img src={ad.imageUrl} alt={ad.title} className="w-16 h-10 object-cover rounded-md border border-neutral-800" />
                        </td>
                        <td className="p-3 font-bold text-white">{ad.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-md text-xs font-semibold">
                            {ad.position}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ad.isActive ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                            {ad.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <form action={toggleAd.bind(null, ad.id, ad.isActive)}>
                            <button type="submit" className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-gray-200 rounded-lg text-xs font-bold transition-colors border border-neutral-700 cursor-pointer">
                              สลับสถานะ
                            </button>
                          </form>
                        </td>
                        <td className="p-3 text-center">
                          <form action={deleteAd.bind(null, ad.id)}>
                            <button type="submit" className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                              ลบ
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}