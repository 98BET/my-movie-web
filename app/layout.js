import { Geist, Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SearchBox from "../components/SearchBox";
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
 
// ฟอนต์ Prompt รองรับภาษาไทยได้สวยงามกว่า Geist สำหรับข้อความไทย
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});
 
export const metadata = {
  title: "14kmovie - ดูหนังออนไลน์ฟรี",
  description: "เว็บดูหนังออนไลน์ฟรี 14kmovie ภาพชัด HD ไม่มีสะดุด",
};
 
export default function RootLayout({ children }) {
  const year = new Date().getFullYear();
 
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${prompt.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0b0d] text-gray-200 font-[family-name:var(--font-prompt)] selection:bg-yellow-500 selection:text-black">
        {/* พื้นหลังไล่เฉดแบบละมุน ให้ความรู้สึกเหมือนโรงหนัง */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(234,179,8,0.12),transparent)]" />
 
        {/* Navbar แสดงผลทุกหน้า */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/10 shadow-[0_1px_0_0_rgba(234,179,8,0.15)]">
          {/* เส้นไล่สีบางๆ ด้านบนสุดให้ความรู้สึกพรีเมียม */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-70" />
 
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="group flex items-center gap-3 shrink-0"
            >
              <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-black px-3 py-1.5 rounded-lg text-xl tracking-tighter shadow-[0_0_18px_rgba(234,179,8,0.45)] transition-transform duration-200 group-hover:scale-105">
                14k <span className="text-black/80">movie</span>
              </div>
              <span className="text-xs text-yellow-500/80 hidden sm:flex flex-col leading-tight font-medium">
                <span>ดูหนังออนไลน์ฟรี</span>
                <span className="text-gray-500">24 ชั่วโมง • ภาพชัด HD</span>
              </span>
            </Link>
 
            {/* ช่องค้นหาหนัง */}
            <div className="flex-1 max-w-md">
              <SearchBox />
            </div>
          </div>
        </header>
 
        {/* ส่วนเนื้อหาหลัก */}
        <main className="flex-1">{children}</main>
 
        {/* Footer แสดงผลทุกหน้า */}
        <footer className="mt-12 border-t border-yellow-500/10 bg-black/60">
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-black px-2 py-1 rounded text-sm tracking-tighter">
                14k <span className="text-black/80">movie</span>
              </div>
              <p className="text-xs text-gray-500">
                © {year} 14kmovie — ดูหนังออนไลน์ฟรี
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}