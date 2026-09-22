import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 min-h-screen text-gray-100 space-y-8">
      <div className="border-l-4 border-yellow-500 pl-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          ติดต่อลงโฆษณา / Contact & ADS
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          สนใจลงแบนเนอร์โฆษณาหรือโปรโมทเว็บไซต์บน 14kmovie ติดต่อเราได้ผ่านช่องทางด้านล่างนี้
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ช่องทางติดต่อหลัก */}
        <div className="bg-neutral-900/90 rounded-2xl p-6 border border-neutral-800/80 shadow-xl backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <span>💬</span> ช่องทางติดต่อด่วน
          </h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <span className="text-gray-400">Telegram / Direct:</span>
              <span className="font-semibold text-white">@14kmovie_ads</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <span className="text-gray-400">Email สนับสนุน:</span>
              <span className="font-semibold text-white">ads@14kmovie.com</span>
            </div>
          </div>
        </div>

        {/* รายละเอียดตำแหน่งโฆษณา */}
        <div className="bg-neutral-900/90 rounded-2xl p-6 border border-neutral-800/80 shadow-xl backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <span>📊</span> รูปแบบโฆษณาที่มีบริการ
          </h2>
          <ul className="space-y-2 text-xs md:text-sm text-gray-300 list-disc list-inside">
            <li><strong className="text-white">Top Banner:</strong> แบนเนอร์แสดงผลด้านบนสุดทุกหน้าเว็บไซต์</li>
            <li><strong className="text-white">Watch Page Ad:</strong> แบนเนอร์ขนาดพอดีเหนือตัวเล่นวิดีโอ</li>
            <li><strong className="text-white">Popup / Popunder:</strong> โฆษณาหน้าต่างเสริมตามตกลง</li>
          </ul>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105"
        >
          ← กลับสู่หน้าหลักภาพยนตร์
        </Link>
      </div>
    </main>
  );
}