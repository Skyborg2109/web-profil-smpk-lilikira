import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useNews } from '../contexts/NewsContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Sub-component for News Card with auto-rotating images
function NewsCard({ article, featured = false }: { article: any, featured?: boolean }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = article.images && article.images.length > 0 ? article.images : [article.image];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [images]);

  if (featured) {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/bg%20berita.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/90 to-blue-800/80" />

        <div className="relative grid md:grid-cols-2">
          <div className="relative h-96 md:h-auto overflow-hidden">
            {images.map((img: string, idx: number) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIdx ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={img}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo yayasan.png';
                  }}
                />
              </div>
            ))}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-amber-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                Terbaru
              </span>
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
                {images.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center text-white relative z-10">
            <div className="flex items-center gap-4 mb-4 text-blue-100">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">{article.title}</h2>
            <p className="text-blue-100 mb-8 leading-relaxed line-clamp-3">{article.excerpt}</p>
            <Link
              to={`/berita/${article.id}`}
              className="inline-flex items-center gap-2 bg-amber-400 text-blue-900 px-8 py-4 rounded-2xl hover:bg-amber-500 transition-all w-fit font-bold shadow-xl shadow-amber-400/20 active:scale-95"
            >
              Baca Selengkapnya
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/berita/${article.id}`} className="group">
      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-slate-100 overflow-hidden transform hover:-translate-y-2">
        <div className="relative h-56 overflow-hidden">
          {images.map((img: string, idx: number) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIdx ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={img}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo yayasan.png';
                }}
              />
            </div>
          ))}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-blue-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
              {article.category}
            </span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 z-10">
              {images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-4 bg-amber-400' : 'w-1 bg-white/50'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Calendar className="w-3 h-3 text-amber-500" />
            {article.date}
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-4 group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h3>
          <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="mt-auto pt-6 border-t border-slate-50">
            <span className="text-amber-600 text-xs font-black uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
              Baca Selengkapnya
              <ArrowRight className="w-5 h-5 shadow-lg" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BeritaPage() {
  const { articles, loading } = useNews();
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Berita..." fullScreen={false} />
      </div>
    );
  }

  const categories = ['Semua', 'Kegiatan Rohani', 'Prestasi', 'Perayaan', 'Kegiatan Sosial', 'Akademik'];
  const publishedArticles = articles.filter((a) => a.published);
  const filteredArticles = selectedCategory === 'Semua'
    ? publishedArticles
    : publishedArticles.filter((a) => a.category === selectedCategory);

  return (
    <div className="bg-gray-50 pb-24">
      {/* Header */}
      <section className="relative bg-blue-900 text-white py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay scale-110"
          style={{ backgroundImage: "url('/bg berita.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 mb-8 shadow-2xl transform hover:rotate-6 transition-transform">
            <Calendar className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl">Berita & Kegiatan</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-medium opacity-90">Update Terkini dari SMP Katolik Renya Rosari Lili'kira</p>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="py-8 bg-white/80 backdrop-blur-md shadow-sm sticky top-[72px] z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide ${cat === selectedCategory
                  ? 'bg-blue-900 text-white shadow-xl shadow-blue-900/20 scale-105'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {filteredArticles.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <NewsCard article={filteredArticles[0]} featured={true} />
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl font-black text-blue-900 tracking-tight shrink-0">Berita Lainnya</h2>
            <div className="h-1 flex-1 bg-slate-200 rounded-full opacity-50"></div>
          </div>

          {filteredArticles.length <= 1 && selectedCategory !== 'Semua' && filteredArticles.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 text-xl font-bold tracking-tight">Tidak ada berita untuk kategori ini.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredArticles.slice(1).map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredArticles.length > 6 && (
            <div className="flex justify-center mt-24 gap-3">
              <button className="w-14 h-14 bg-blue-900 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform">1</button>
              <button className="w-14 h-14 bg-white text-slate-600 rounded-2xl font-black border border-slate-200 hover:bg-slate-50 transition-colors">2</button>
              <button className="w-14 h-14 bg-white text-slate-600 rounded-2xl font-black border border-slate-200 hover:bg-slate-50 transition-colors">3</button>
              <button className="w-14 h-14 bg-white text-slate-600 rounded-2xl font-black border border-slate-200 hover:bg-slate-50 transition-colors">→</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
