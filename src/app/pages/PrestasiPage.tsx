import { Trophy, Award, Star, Medal, Cross, Calendar, Image as ImageIcon } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAchievements } from '../contexts/AchievementContext';
import { useGallery } from '../contexts/GalleryContext';
import { LoadingScreen } from '../components/LoadingScreen';

export function PrestasiPage() {
  const { achievements, loading: achievementsLoading } = useAchievements();
  const { galleryItems, loading: galleryLoading } = useGallery();

  const loading = achievementsLoading || galleryLoading;

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Data Prestasi..." fullScreen={false} />
      </div>
    );
  }

  const studentAchievements = achievements.filter(a => a.type === 'student');
  const trophyItems = galleryItems.filter(item => item.category === 'piala' || item.category === 'sertifikat');

  const categories = [
    {
      category: 'Akademik',
      icon: Trophy,
      color: 'blue',
      items: studentAchievements.filter(a => a.category === 'akademik'),
    },
    {
      category: 'Non-Akademik',
      icon: Medal,
      color: 'amber',
      items: studentAchievements.filter(a => a.category === 'non-akademik'),
    },
  ];

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'internasional':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'nasional':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'provinsi':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'kota':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header with Background */}
      <section className="relative bg-blue-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: "url('/prestasi.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Prestasi</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">Pencapaian Membanggakan Siswa SMP Katolik Renya Rosari Lili'kira</p>
        </div>
      </section>

      {/* Achievement Categories */}
      {categories.map((category: any, idx) => (
        <section key={idx} className={`py-16 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <category.icon className={`w-10 h-10 ${category.color === 'blue' ? 'text-blue-500' : 'text-amber-500'}`} />
                <h2 className="text-3xl text-blue-900">Prestasi {category.category}</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {category.items.map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                  <div className={`h-2 bg-gradient-to-r ${category.color === 'blue'
                    ? 'from-blue-600 to-blue-400'
                    : 'from-amber-600 to-amber-400'
                    }`}></div>

                  {item.image && (
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                    </div>
                  )}

                  <div className="p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-blue-900 mb-1 tracking-tight leading-tight">{item.name}</h3>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Kelas {item.class_name}
                        </p>
                      </div>
                      <div className={`shrink-0 self-start md:self-center px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getLevelBadgeColor(item.level)}`}>
                        {item.level}
                      </div>
                    </div>

                    <div className="relative group/text mb-8">
                      <div className={`absolute -left-4 top-0 bottom-0 w-1 rounded-full ${category.color === 'blue' ? 'bg-blue-600' : 'bg-amber-500'
                        } opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                      <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${category.color === 'blue' ? 'bg-blue-600 shadow-blue-200' : 'bg-amber-500 shadow-amber-200'
                          } shadow-xl text-white transform group-hover:rotate-6 transition-transform duration-500`}>
                          <Trophy className="w-7 h-7" />
                        </div>
                        <p className="text-slate-700 text-lg font-bold leading-snug pt-1">{item.achievement}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>Tahun {item.year}</span>
                      </div>
                      <div className={`${category.color === 'blue' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'} flex items-center gap-2 px-4 py-2 rounded-xl`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Prestasi Unggulan</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}


      {/* Trophy Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-blue-900 mb-4 tracking-tight uppercase">Galeri <span className="text-amber-400">Piala</span> & Sertifikat</h2>
            <div className="h-1.5 w-32 bg-amber-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {trophyItems.length > 0 ? (
              trophyItems.map((item) => (
                <div key={item.id} className="relative group perspective-1000">
                  <div className="relative h-[30rem] rounded-[2rem] overflow-hidden transform-gpu group-hover:rotate-y-12 transition-all duration-700 shadow-2xl">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="p-2 bg-amber-500 w-fit rounded-xl mb-4 shadow-lg shadow-amber-500/20">
                        {item.category === 'piala' ? (
                          <Trophy className="w-5 h-5 text-white" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">{item.title}</h3>
                      <div className="h-1 w-0 group-hover:w-full bg-amber-400 transition-all duration-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada foto piala diunggah</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action with Background */}
      <section className="relative py-24 bg-amber-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/spmb.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/90 via-amber-600/70 to-amber-600/90" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-4xl font-black mb-4 tracking-tight">Raih Prestasi Bersama Kami!</h2>
          <p className="text-xl text-amber-50 mb-10 leading-relaxed">
            Bergabunglah dengan SMP Katolik Renya Rosari Lili'kira dan kembangkan potensimu untuk meraih prestasi gemilang.
          </p>
          <a
            href="/spmb"
            className="inline-flex items-center gap-2 bg-white text-amber-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-50 transition-all shadow-xl shadow-amber-900/20"
          >
            Daftar SPMB Sekarang
          </a>
        </div>
      </section>
    </div>
  );
}
