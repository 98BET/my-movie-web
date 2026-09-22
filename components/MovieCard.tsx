"use client";
import { useState } from "react";
import Link from "next/link";

interface Movie {
  slug: string;
  posterUrl?: string | null;
  title: string;
  rating?: number | null;
  year?: number | null;
  views?: number; // เพิ่มฟิลด์รองรับยอดวิว
  category?: {
    name: string;
  } | null;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [hasError, setHasError] = useState(false);

  // เช็กว่าเป็นรูปที่ไม่สมบูรณ์ เช่น เป็น placeholder, โหลดไม่ขึ้น หรือพัง
  const isInvalidPoster =
    !movie.posterUrl ||
    movie.posterUrl.includes("placeholder") ||
    hasError;

  return (
    <Link
      href={`/movie/${movie.slug}`}
      className="group relative bg-neutral-900/90 rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-yellow-500/50 hover:shadow-[0_4px_25px_rgba(234,179,8,0.15)] transition-all duration-300 block backdrop-blur-sm"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-950 flex items-center justify-center">
        {!isInvalidPoster ? (
          <img
            src={movie.posterUrl!}
            alt={movie.title}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          /* การ์ดสำรองกรณีไม่มีรูปภาพหรือรูปเสีย */
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-neutral-900 to-neutral-950 text-center">
            <span className="text-3xl mb-2">🎬</span>
            <span className="text-xs text-yellow-400 font-bold line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* 🔥 ป้ายกำกับยอดวิว (มุมซ้ายบน) */}
        {typeof movie.views === "number" && movie.views > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-500/30 shadow-lg flex items-center gap-1 z-10">
            👁️ {movie.views.toLocaleString()}
          </div>
        )}

        {/* ป้ายเรตติ้ง (มุมขวาบน) */}
        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-500/30 shadow-lg z-10">
          ★ {movie.rating || 0}
        </div>
      </div>

      <div className="p-3.5 space-y-1.5">
        <h3 className="text-sm font-semibold text-gray-200 truncate group-hover:text-yellow-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span className="font-medium">{movie.year || "-"}</span>
          <span className="bg-neutral-800/80 px-2 py-0.5 rounded-md text-[10px] text-gray-300 border border-neutral-700/60">
            {movie.category?.name || "ทั่วไป"}
          </span>
        </div>
      </div>
    </Link>
  );
}