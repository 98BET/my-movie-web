import Link from 'next/link';

export default function Sidebar() {
  const categories = [
    { name: 'ดูหนังดราม่า Drama', count: '4,710', slug: 'drama' },
    { name: 'ดูหนังฝรั่ง ฮอลลีวูด', count: '3,800', slug: 'inter' },
    { name: 'ดูหนังบู๊เลือดสาด Action', count: '3,201', slug: 'action' },
    { name: 'ดูหนังตลก Comedy', count: '3,126', slug: 'comedy' },
    { name: 'ดูหนังผจญภัย Adventure', count: '1,896', slug: 'adventure' },
    { name: 'ดูหนังตื่นเต้นเร้าใจ Thriller', count: '1,821', slug: 'thriller' },
    { name: 'ดูหนังสยองขวัญ Horror', count: '1,426', slug: 'horror' },
    { name: 'ดูหนังไซไฟ Sci-Fi', count: '669', slug: 'sci-fi' },
    { name: 'ดูหนังไทย Thailand', count: '588', slug: 'thailand' },
  ];

  return (
    <aside className="w-full lg:w-80 space-y-6">
      <div className="bg-neutral-900/90 rounded-2xl p-5 border border-neutral-800/80 shadow-xl backdrop-blur-sm">
        <h2 className="text-xs font-bold text-yellow-400 border-b border-yellow-500/25 pb-2.5 mb-3.5 uppercase tracking-wider">
          หมวดหมู่ภาพยนตร์
        </h2>
        <ul className="space-y-1 text-xs text-gray-300">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/genre/${cat.slug}`}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-neutral-800/60 hover:text-yellow-400 transition-all duration-200"
              >
                <span>{cat.name}</span>
                <span className="text-gray-500 text-[11px] font-medium">({cat.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}