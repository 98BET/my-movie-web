"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-xs" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อภาพยนตร์..."
          className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl py-2 px-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500/80 focus:ring-2 focus:ring-yellow-500/20 transition-all shadow-inner"
        />
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-md">
          {results.map((movie) => (
            <Link
              key={movie.slug}
              href={`/movie/${movie.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 hover:bg-neutral-900 border-b border-neutral-900/50 transition-colors"
            >
              <div className="w-10 h-14 bg-neutral-900 rounded overflow-hidden shrink-0">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-200 truncate hover:text-yellow-400">{movie.title}</p>
                <p className="text-[10px] text-gray-500">{movie.year || "-"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}