"use client";
import { useState } from "react";
import Link from "next/link";
import SearchBox from "./SearchBox";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const genres = [
    { name: 'หนังฝรั่ง', slug: 'inter' },
    { name: 'หนังไทย', slug: 'thailand' },
    { name: 'หนังจีน', slug: 'china' },
    { name: 'หนังเกาหลี', slug: 'south-korea' },
    { name: 'หนังญี่ปุ่น', slug: 'japan' },
    { name: 'หนังอินเดีย', slug: 'india' },
    { name: 'หนังอีโรติก', slug: 'erotic' },
    { name: 'ซีรีส์ดัง', slug: 'tvshows' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b0d]/90 backdrop-blur-md border-b border-yellow-500/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo 14kmovie */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-black px-3 py-1.5 rounded-xl text-xl tracking-tighter shadow-[0_0_18px_rgba(234,179,8,0.35)] transition-transform duration-200 group-hover:scale-105">
            14k <span className="text-black/80">movie</span>
          </div>
        </Link>

        {/* Categories Menu (Desktop) */}
        <nav className="hidden xl:flex items-center gap-3 text-xs font-medium text-gray-300">
          {genres.map((g) => (
            <Link
              key={g.slug}
              href={`/genre/${g.slug}`}
              className="hover:text-yellow-400 transition-colors"
            >
              {g.name}
            </Link>
          ))}
        </nav>

        {/* Search Box & ADS Button */}
        <div className="flex items-center gap-3">
          <div className="w-36 sm:w-60">
            <SearchBox />
          </div>

          <Link
            href="/contact"
            className="hidden sm:inline-flex px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-xs rounded-xl hover:bg-yellow-500 hover:text-black transition-all shadow-md shrink-0"
          >
            ADS ติดต่อโฆษณา
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-yellow-400 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-neutral-950/95 border-b border-neutral-800 px-4 py-4 backdrop-blur-md space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {genres.map((g) => (
              <Link
                key={g.slug}
                href={`/genre/${g.slug}`}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs text-gray-300 hover:bg-neutral-900 hover:text-yellow-400 transition-colors bg-neutral-900/50 border border-neutral-800/60"
              >
                {g.name}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-xl text-xs text-yellow-400 font-bold hover:bg-neutral-900 transition-colors col-span-2 text-center bg-yellow-500/10 border border-yellow-500/30 shadow-md"
            >
              ติดต่อโฆษณา (ADS)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}