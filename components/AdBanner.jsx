export default function AdBanner({ ads }) {
  if (!ads || ads.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto my-4 space-y-2 px-2">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full overflow-hidden rounded border border-yellow-500/20 hover:border-yellow-500 transition-all shadow-lg"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-auto max-h-[120px] object-cover block"
          />
        </a>
      ))}
    </div>
  );
}