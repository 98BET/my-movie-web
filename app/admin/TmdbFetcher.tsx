"use client";
import { useState } from "react";

interface TmdbFetcherProps {
  fetchAction: (id: string) => Promise<any>;
}

export default function TmdbFetcher({ fetchAction }: TmdbFetcherProps) {
  const [tmdbId, setTmdbId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!tmdbId) return alert("กรุณากรอก TMDB ID ก่อน");
    try {
      setLoading(true);
      const data = await fetchAction(tmdbId);
      
      // เติมข้อมูลลงในฟอร์มหลัก
      (document.getElementById("title") as HTMLInputElement).value = data.title;
      (document.getElementById("description") as HTMLTextAreaElement).value = data.description;
      (document.getElementById("posterUrl") as HTMLInputElement).value = data.posterUrl;
      (document.getElementById("bannerUrl") as HTMLInputElement).value = data.bannerUrl;
      (document.getElementById("year") as HTMLInputElement).value = data.year.toString();
      (document.getElementById("rating") as HTMLInputElement).value = data.rating.toString();
      
      alert("ดึงข้อมูลจาก TMDB สำเร็จ!");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:col-span-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center gap-3">
      <div className="w-full">
        <label className="block text-xs font-semibold text-yellow-400 mb-1">ดึงข้อมูลอัตโนมัติจาก TMDB ID</label>
        <input 
          type="text" 
          value={tmdbId}
          onChange={(e) => setTmdbId(e.target.value)}
          placeholder="เช่น 550 (Fight Club)" 
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-yellow-500"
        />
      </div>
      <button
        type="button"
        onClick={handleFetch}
        disabled={loading}
        className="w-full sm:w-auto mt-5 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-lg transition-colors whitespace-nowrap shadow-md cursor-pointer disabled:opacity-50"
      >
        {loading ? "กำลังดึง..." : "⚡ ดึงข้อมูล TMDB"}
      </button>
    </div>
  );
}