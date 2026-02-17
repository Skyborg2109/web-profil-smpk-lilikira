import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { GraduationCap, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { useNews } from '../contexts/NewsContext';
import { useContent } from '../contexts/ContentContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Sub-component for News Card with auto-rotating images
function NewsCard({ item }: { item: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4000 + Math.random() * 2000); // Varied timing for more natural feel
    return () => clearInterval(interval);
  }, [images]);

  return (
    <Link to={`/berita/${item.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-slate-100 overflow-hidden transform hover:-translate-y-1">
        <div className="relative h-56 overflow-hidden">
          {images.map((img: string, idx: number) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIdx ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo yayasan.png';
                }}
              />
            </div>
          ))}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-blue-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
              {item.category}
            </span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-10">
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
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            <Calendar className="w-3 h-3 text-amber-500" />
            {item.date}
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
            {item.title}
          </h3>
          <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
            {item.excerpt}
          </p>
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-amber-600 text-xs font-black uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
              Baca Selengkapnya
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const { articles, loading: newsLoading } = useNews();
  const { contentSections, loading: contentLoading } = useContent();
  const loading = newsLoading || contentLoading;

  const news = articles
    .filter((a) => a.published)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-[80vh] relative">
        <LoadingScreen message="Menyiapkan Beranda..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[700px] flex items-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Video/Video Beranda.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-900/60 to-blue-800/50"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-white w-full">

            {/* Mobile-First Layout */}
            <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4 md:gap-8">

              {/* Logo Section */}
              <div className="hidden sm:block flex-shrink-0">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <img
                    src="/LogoSekolah.png"
                    alt="Logo SMP Katolik Renya Rosari"
                    className="relative w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 max-w-3xl">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 hover:bg-white/15 transition-all shadow-2xl">
                    <img src="/logo yayasan.png" alt="Logo Yayasan" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-[0.2em] font-black leading-none mb-1.5">Yayasan</p>
                      <p className="text-sm sm:text-lg text-white font-black leading-none tracking-tight">Joseph Yeemye Makassar</p>
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 md:mb-4 leading-none tracking-tight">
                  SMP Katolik
                  <br className="hidden sm:block" />
                  <span className="text-amber-400 drop-shadow-sm">Renya Rosari Lili'kira</span>
                </h1>

                <div className="h-1.5 w-24 bg-gradient-to-r from-amber-400 to-amber-500 mb-6 mx-auto md:mx-0 rounded-full shadow-lg shadow-amber-500/20"></div>

                <p className="text-lg sm:text-2xl font-bold mb-4 text-white/95 leading-snug">
                  Mendidik dalam Iman, Berkembang dalam Prestasi
                </p>

                <p className="text-sm sm:text-lg text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto md:mx-0 px-2 sm:px-0 font-medium">
                  Membentuk generasi yang beriman teguh, berkarakter mulia, dan berprestasi gemilang melalui pendidikan holistik berbasis nilai-nilai Kristiani.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link
                    to="/spmb"
                    className="group bg-gradient-to-br from-amber-400 to-amber-600 text-blue-950 px-8 py-4 rounded-2xl hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-3 font-black shadow-xl hover:shadow-amber-500/20 hover:scale-105 transform uppercase tracking-wider text-sm"
                  >
                    <GraduationCap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Daftar SPMB 2026
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/profil"
                    className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50 font-black uppercase tracking-wider text-sm text-center"
                  >
                    Tentang Kami
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principal's Welcome */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -ml-48 -mb-48 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group max-w-md mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <ImageWithFallback
                  src="/Kepsek.png"
                  alt="Kepala Sekolah"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-amber-100">
                <Sparkles className="w-3 h-3" />
                Sambutan Kepala Sekolah
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-blue-900 mb-6 leading-tight">Remigius Dele S.Pd</h2>
              <div className="h-1.5 w-24 bg-amber-400 mb-10 rounded-full"></div>

              <div className="space-y-6 text-slate-600 leading-relaxed text-lg font-medium">
                {(() => {
                  const sambutanContent = contentSections.find(s => s.id === 'sambutan')?.content;
                  if (sambutanContent && sambutanContent.trim()) {
                    return (
                      <div className="whitespace-pre-wrap">
                        {sambutanContent}
                      </div>
                    );
                  }
                  return (
                    <>
                      <p className="italic font-bold text-blue-900 text-xl border-l-4 border-amber-400 pl-6 mb-8">
                        "Shalom, Salam Sejahtera dalam Kasih Kristus."
                      </p>
                      <p>
                        Selamat datang di situs resmi SMP Katolik Renya Rosari Lili'kira. Kami merasa terhormat atas kunjungan Anda untuk mengenal sekolah kami lebih jauh.
                      </p>
                      <p>
                        Di lembaga pendidikan ini, kami tidak hanya fokus pada pencapaian akademik, tetapi juga berkomitmen penuh dalam pembentukan karakter Kristiani dan penanaman nilai-nilai kemanusiaan.
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPMB Alert Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-600">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-110"
            style={{ backgroundImage: "url('/bg berita.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-600/90 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-white/5 backdrop-blur-md border border-white/10 p-8 lg:p-12 rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-24 h-24 rounded-3xl bg-blue-900 flex items-center justify-center shadow-2xl shadow-blue-900/20 shrink-0 transform -rotate-6">
                <Calendar className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <span className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-3 block opacity-90">Penerimaan Siswa Baru</span>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Tahun Ajaran 2026/2027</h3>
                <p className="text-white/90 font-bold text-lg">Gelombang pendaftaran dibuka mulai 1 Maret 2026</p>
              </div>
            </div>
            <Link
              to="/spmb"
              className="bg-white text-blue-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 hover:text-blue-950 transition-all shadow-2xl hover:scale-105 active:scale-95 shrink-0"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Modern News Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                <Sparkles className="w-3 h-3" />
                Informasi Terkini
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tight leading-none">Berita & Kegiatan</h2>
            </div>
            <Link
              to="/berita"
              className="hidden md:flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-800 transition-colors group"
            >
              Lihat Semua Berita
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-16 text-center md:hidden">
            <Link
              to="/berita"
              className="inline-flex items-center gap-3 bg-blue-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
            >
              Semua Berita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
