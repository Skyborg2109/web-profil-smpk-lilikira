import { BookOpen, Calendar, Clock, FileText, GraduationCap, Loader2, Award, Star, CheckCircle, HelpCircle } from 'lucide-react';
import { useAcademic } from '../contexts/AcademicContext';
import { LoadingScreen } from '../components/LoadingScreen';

export function AkademikPage() {
  const { sections, loading } = useAcademic();

  const getSection = (type: string) => sections.find(s => s.type === type);

  const kurikulumSection = getSection('kurikulum');
  const mapelSection = getSection('mapel');
  const programSection = getSection('program');
  const kalenderSection = getSection('kalender');
  const penilaianSection = getSection('penilaian');

  const getStructuredData = (content: string | undefined) => {
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  };

  const getIcon = (name: string) => {
    const icons: any = {
      BookOpen, Calendar, Clock, FileText, GraduationCap, Award, Star, CheckCircle
    };
    return icons[name] || HelpCircle;
  };

  const defaultSubjects = [
    'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Indonesia',
    'Bahasa Inggris', 'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi',
    'Pendidikan Agama Katolik', 'Seni Budaya', 'Pendidikan Jasmani'
  ];

  const defaultPrograms = [
    {
      title: 'Kelas Akselerasi',
      description: 'Program khusus untuk siswa berprestasi dengan kurikulum dipercepat',
      icon: 'GraduationCap',
    },
    {
      title: 'Bimbingan UTBK',
      description: 'Persiapan intensif untuk menghadapi Ujian Tulis Berbasis Komputer',
      icon: 'FileText',
    },
    {
      title: 'English Club',
      description: 'Peningkatan kemampuan bahasa Inggris untuk persiapan internasional',
      icon: 'BookOpen',
    },
    {
      title: 'Olimpiade Sains',
      description: 'Pembinaan khusus untuk kompetisi olimpiade tingkat nasional',
      icon: 'GraduationCap',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Data Akademik..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header with Background Image */}
      <section className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/akademik bg.jpg')",
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-blue-900/70 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-6 border border-white/30 shadow-2xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
            Akademik
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-amber-400" />
            <p className="text-lg md:text-xl text-blue-100 font-bold tracking-widest uppercase">
              Program Pendidikan Berkualitas
            </p>
            <div className="h-px w-12 bg-amber-400" />
          </div>
        </div>
      </section>

      {/* Kurikulum */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl text-blue-900 mb-4">{kurikulumSection?.title || 'Kurikulum Deep Learning'}</h2>
              <div className="h-1 w-20 bg-amber-400 mx-auto mb-6"></div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-[2rem] shadow-lg border border-blue-100">
              {kurikulumSection ? (
                <div
                  className="prose prose-blue max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: kurikulumSection.content }}
                />
              ) : (
                <>
                  <p className="text-gray-700 mb-4 text-lg">
                    SMP Katolik Renya Rosari Lili'kira menerapkan <strong>Kurikulum Merdeka</strong> yang memberikan fleksibilitas
                    dan kebebasan kepada siswa untuk mengembangkan potensi mereka sesuai dengan minat dan bakat.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Kurikulum ini dirancang untuk mengembangkan kompetensi siswa secara holistik, meliputi aspek kognitif,
                    afektif, dan psikomotorik, dengan tetap menjunjung tinggi nilai-nilai Kristiani.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                      <div className="text-3xl font-black text-blue-900 mb-2">3</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tahun Pembelajaran</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                      <div className="text-3xl font-black text-blue-900 mb-2">6</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hari Belajar/Minggu</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                      <div className="text-3xl font-black text-blue-900 mb-2">40+</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Jam Pelajaran/Minggu</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mata Pelajaran */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-900 mb-4">{mapelSection?.title || 'Mata Pelajaran'}</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
          </div>

          {(() => {
            const data = getStructuredData(mapelSection?.content);
            if (Array.isArray(data)) {
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto px-4">
                  {data.map((subject: any, index: number) => {
                    const subjectName = typeof subject === 'string' ? subject : subject.name;
                    const subjectImage = typeof subject === 'object' ? subject.image_url : null;

                    return (
                      <div key={index} className="bg-white p-4 rounded-2xl shadow-md text-center hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group">
                        <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-900 overflow-hidden relative">
                          {subjectImage ? (
                            <img src={subjectImage} alt={subjectName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-900" />
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-gray-700 text-sm h-10 flex items-center justify-center line-clamp-2">{subjectName}</p>
                      </div>
                    );
                  })}
                </div>
              );
            }
            if (mapelSection?.content) {
              return (
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
                  <div className="prose prose-blue max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: mapelSection.content }} />
                </div>
              );
            }
            return (
              <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {defaultSubjects.map((subject, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-900">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-gray-700">{subject}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Kalender Akademik */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-10 h-10 text-amber-500" />
              <h2 className="text-3xl font-black text-blue-900">{kalenderSection?.title || 'Kalender Akademik 2025/2026'}</h2>
            </div>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-blue-900 text-white p-8">
              <h3 className="text-xl font-black uppercase tracking-widest">{kalenderSection?.title || 'Tahun Ajaran 2025/2026'}</h3>
            </div>
            <div className="p-10">
              {(() => {
                const data = getStructuredData(kalenderSection?.content);
                if (Array.isArray(data)) {
                  return (
                    <div className="space-y-6">
                      {data.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="w-28 flex-shrink-0">
                            <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-xl text-center text-xs font-black uppercase tracking-wider">
                              {item.month}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-blue-900 mb-1 leading-none">{item.event}</h4>
                            {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                if (kalenderSection?.content) {
                  return <div className="prose prose-blue" dangerouslySetInnerHTML={{ __html: kalenderSection.content }} />;
                }
                return (
                  <div className="space-y-6">
                    {[
                      { month: 'Juli 2025', event: 'Awal Tahun Ajaran', desc: 'Penerimaan siswa baru dan orientasi' },
                      { month: 'Sep 2025', event: 'Penilaian Tengah Semester 1', desc: 'Ujian tengah semester ganjil' },
                      { month: 'Des 2025', event: 'Penilaian Akhir Semester 1', desc: 'Ujian akhir semester ganjil & libur Natal' },
                      { month: 'Mar 2026', event: 'Penilaian Tengah Semester 2', desc: 'Ujian tengah semester genap' },
                      { month: 'Jun 2026', event: 'Penilaian Akhir Semester 2', desc: 'Ujian akhir semester genap & kenaikan kelas' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="w-28 flex-shrink-0">
                          <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-xl text-center text-xs font-black uppercase tracking-wider">
                            {item.month}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-black text-blue-900 mb-1 leading-none">{item.event}</h4>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Sistem Penilaian */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl text-blue-900 mb-4">{penilaianSection?.title || 'Sistem Penilaian'}</h2>
              <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-[2.5rem] shadow-xl border border-blue-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              {(() => {
                const data = getStructuredData(penilaianSection?.content);
                if (data && data.percentages) {
                  return (
                    <>
                      <p className="text-gray-700 mb-8 text-lg text-center font-medium">
                        {data.description || 'Penilaian di SMP Katolik Renya Rosari Lili\'kira menggunakan sistem penilaian autentik:'}
                      </p>

                      <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-50 shadow-sm transition-all hover:border-blue-200">
                          <div className="text-3xl font-black text-blue-900 mb-2">{data.percentages.harian}%</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Penilaian Harian</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-50 shadow-sm transition-all hover:border-blue-200">
                          <div className="text-3xl font-black text-blue-900 mb-2">{data.percentages.uts}%</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">UTS</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-50 shadow-sm transition-all hover:border-blue-200">
                          <div className="text-3xl font-black text-blue-900 mb-2">{data.percentages.uas}%</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">UAS</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {(data.aspects || []).map((item: any, idx: number) => {
                          const Icon = getIcon(item.icon);
                          return (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-white/50">
                              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-amber-600" />
                              </div>
                              <p className="text-gray-700">
                                <strong className="text-blue-900">{item.label}:</strong> {item.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                }
                if (penilaianSection?.content) {
                  return <div className="prose prose-blue" dangerouslySetInnerHTML={{ __html: penilaianSection.content }} />;
                }
                return (
                  <>
                    <p className="text-gray-700 mb-8 text-lg text-center font-medium">
                      Penilaian di SMP Katolik Renya Rosari Lili'kira menggunakan sistem penilaian autentik yang mencakup beberapa aspek utama:
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                      <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-50 shadow-sm transition-all hover:border-blue-200">
                        <div className="text-3xl font-black text-blue-900 mb-2">30%</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Penilaian Harian</div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-50 shadow-sm transition-all hover:border-blue-200">
                        <div className="text-3xl font-black text-blue-900 mb-2">35%</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">UTS</div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-50 shadow-sm transition-all hover:border-blue-200">
                        <div className="text-3xl font-black text-blue-900 mb-2">35%</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">UAS</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: Clock, label: 'Penilaian Sikap', desc: 'Observasi perilaku, kedisiplinan, dan partisipasi rohani' },
                        { icon: FileText, label: 'Penilaian Pengetahuan', desc: 'Tes tertulis, lisan, dan penugasan mandiri' },
                        { icon: GraduationCap, label: 'Penilaian Keterampilan', desc: 'Praktik, proyek kreatif, dan portofolio siswa' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-white/50">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                            <item.icon className="w-5 h-5 text-amber-600" />
                          </div>
                          <p className="text-gray-700">
                            <strong className="text-blue-900">{item.label}:</strong> {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
