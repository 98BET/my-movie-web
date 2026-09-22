"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCat = searchParams.get("cat");
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (currentCat) params.set("cat", currentCat);

    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs md:max-w-sm">
      <input
        type="text"
        placeholder="ค้นหาชื่อภาพยนตร์..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl py-2 pl-4 pr-10 text-xs md:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500/80 focus:ring-2 focus:ring-yellow-500/20 transition-all shadow-inner"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 text-sm transition-colors"
      >
        🔍
      </button>
    </form>
  );
}