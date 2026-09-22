export default function VideoPlayer({ embedUrl, title }) {
  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-neutral-900/90 rounded-2xl flex items-center justify-center text-gray-500 border border-neutral-800/80 backdrop-blur-sm">
        ไม่พบไฟล์วิดีโอสำหรับเรื่องนี้
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-neutral-800/80">
      <iframe
        src={embedUrl}
        title={title || 'Movie Player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}