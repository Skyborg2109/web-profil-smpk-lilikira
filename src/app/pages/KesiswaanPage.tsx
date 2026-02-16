import { Users, Heart, Cross, Music, Trophy, Camera, Loader2, Sparkles, Image as ImageIcon, Star, Calendar } from 'lucide-react';
import { useAcademic } from '../contexts/AcademicContext';
import { LoadingScreen } from '../components/LoadingScreen';

export function KesiswaanPage() {
  const { sections, loading } = useAcademic();
  const osisSection = sections.find(s => s.type === 'osis');

  // Default data for fallback
  const defaultOsis = {
    description: "OSIS SMP Katolik Renya Rosari Lili'kira adalah wadah bagi siswa untuk mengembangkan kemampuan kepemimpinan, berorganisasi, dan melayani sesama. Melalui berbagai program kerja, OSIS aktif dalam menyelenggarakan kegiatan yang bermanfaat bagi seluruh siswa.",
    vision: "Menjadi organisasi siswa yang inovatif, berintegritas, dan berorientasi pada pelayanan dengan semangat Kristiani.",
    members: [
      { role: 'Ketua OSIS', name: 'Yohanes Michael', class: 'Kelas XI IPA 1' },
      { role: 'Wakil Ketua OSIS', name: 'Maria Christina', class: 'Kelas XI IPS 1' },
      { role: 'Sekretaris', name: 'Theresia Angela', class: 'Kelas X IPA 2' }
    ]
  };

  const getOsisData = () => {
    if (!osisSection?.content) return defaultOsis;
    try {
      return JSON.parse(osisSection.content);
    } catch (e) {
      return defaultOsis;
    }
  };

  const osisData = getOsisData();

  const extraSection = sections.find(s => s.type === 'extracurricular');

  const iconMap: Record<string, any> = {
    Users, Trophy, Music, Heart, Star
  };

  const getExtraData = () => {
    if (!extraSection?.content) return {
      items: [
        { name: 'Pramuka', icon: 'Users', category: 'Wajib', description: 'Pembinaan karakter dan kemandirian siswa.' },
        { name: 'Paduan Suara', icon: 'Music', category: 'Seni', description: 'Asah bakat vokal dan seni musik.' },
        { name: 'Voli', icon: 'Trophy', category: 'Olahraga', description: 'Pengembangan atletik dan kerjasama tim.' },
      ]
    };
    try {
      return JSON.parse(extraSection.content);
    } catch (e) {
      return { items: [] };
    }
  };

  const extraDataItems = getExtraData().items;

  const rohaniSection = sections.find(s => s.type === 'spiritual');
  const rulesSection = sections.find(s => s.type === 'rules');

  const getRohaniData = () => {
    if (!rohaniSection?.content) return [
      {
        title: 'Misa Sekolah',
        description: 'Perayaan Ekaristi setiap Bulan untuk seluruh siswa dan guru',
        schedule: 'Setiap Jumat Pertama pukul 08.00 WITA',
      },
      {
        title: 'Rekoleksi Kelas',
        description: 'Kegiatan penarikan diri untuk refleksi dan pendalaman iman',
        schedule: 'Setiap Kelas 1x per Semester',
      },
      {
        title: 'Ibadah Pagi',
        description: 'Ibadah bersama sebelum memulai kegiatan pembelajaran',
        schedule: 'Setiap hari sebelum jam pertama',
      },
      {
        title: 'Perayaan Hari Besar Katolik',
        description: 'Perayaan Natal, Paskah, dan hari raya Katolik lainnya',
        schedule: 'Sesuai kalender liturgi',
      },
    ];
    try {
      return JSON.parse(rohaniSection.content).activities;
    } catch (e) {
      return [];
    }
  };

  const rohaniDataItems = getRohaniData();

  const getRulesData = () => {
    const defaultData = {
      rules: [
        'Hadir tepat waktu dan mengikuti seluruh kegiatan pembelajaran',
        'Berpakaian seragam lengkap dan rapi sesuai ketentuan',
        'Menjaga kesopanan dan tidak menggunakan kata-kata kasar',
        'Dilarang membawa dan menggunakan barang terlarang',
        'Menghormati guru, karyawan, dan sesama siswa',
        'Menjaga kebersihan dan ketertiban lingkungan sekolah',
        'Tidak meninggalkan kelas tanpa izin guru',
        'Mengikuti kegiatan ekstrakurikuler minimal 1 kegiatan',
        'Aktif dalam kegiatan rohani sekolah',
        'Menjaga nama baik sekolah di dalam dan luar lingkungan sekolah',
      ],
      sanctions: [
        'Pelanggaran tata tertib akan dikenakan sanksi sesuai dengan tingkat pelanggaran, mulai dari teguran lisan, peringatan tertulis, hingga skorsing.',
        'Pembinaan dilakukan dengan pendekatan kasih Kristiani untuk membimbing siswa menjadi pribadi yang lebih baik.'
      ]
    };

    if (!rulesSection?.content) return defaultData;
    try {
      const parsed = JSON.parse(rulesSection.content);
      return {
        rules: parsed.rules || defaultData.rules,
        sanctions: parsed.sanctions || defaultData.sanctions
      };
    } catch (e) {
      return defaultData;
    }
  };

  const { rules: rulesDataItems, sanctions: sanctionsDataItems } = getRulesData();

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Menyiapkan Halaman Kesiswaan..." fullScreen={false} />
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
            backgroundImage: "url('/kesiswaan bg.jpg')",
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-blue-900/70 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-6 border border-white/30 shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
            Kesiswaan
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-amber-400" />
            <p className="text-lg md:text-xl text-blue-100 font-bold tracking-widest uppercase">
              Pembinaan Karakter & Minat Bakat
            </p>
            <div className="h-px w-12 bg-amber-400" />
          </div>
        </div>
      </section>

      {/* OSIS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-900 mb-4">{osisSection?.title || 'OSIS (Organisasi Siswa Intra Sekolah)'}</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto mb-6"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Description & Vision */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="space-y-8 order-2 lg:order-1">
                <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-blue-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                  <p className="text-gray-700 text-lg leading-relaxed font-medium relative z-10">
                    {osisData.description}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-blue-50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                  <h3 className="text-blue-900 font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Visi OSIS
                  </h3>
                  <p className="text-gray-600 italic text-xl leading-relaxed">
                    "{osisData.vision}"
                  </p>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-[3rem] blur-2xl group-hover:bg-blue-600/30 transition-all duration-500" />
                  <div className="relative aspect-[4/3] bg-slate-200 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                    {osisData.groupImage ? (
                      <img src={osisData.groupImage} alt="OSIS Group" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Photo OSIS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Member Structure */}
            <div className="bg-blue-900 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-blue-200 border-4 border-blue-800">
              <div className="p-8 bg-blue-800/40 border-b border-white/5 text-center">
                <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-1">Struktur Pengurus OSIS</h3>
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">SMP Katolik Renya Rosari Lili'kira</p>
              </div>
              <div className="p-10 lg:p-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {osisData.members.map((member: any, idx: number) => (
                    <div key={idx} className="group text-center">
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 bg-amber-400 rotate-6 rounded-[2.5rem] group-hover:rotate-12 transition-all duration-300" />
                        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                          ) : (
                            <Users className="w-12 h-12 text-slate-200" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-amber-400 font-black uppercase tracking-[0.15em] text-[10px] whitespace-nowrap">{member.role}</h4>
                        <p className="text-white font-black text-xl tracking-tight leading-tight">{member.name}</p>
                        <p className="text-blue-300/80 text-xs font-bold uppercase tracking-tighter">{member.class}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-900 mb-4">Ekstrakurikuler</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto mb-2"></div>
            <p className="text-gray-600 mt-4">Wadah Pengembangan Minat dan Bakat Siswa</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {extraDataItems.map((item: any, index: number) => {
              const IconComponent = iconMap[item.icon] || Star;
              const categoryColor =
                item.category === 'Wajib' ? 'red' :
                  item.category === 'Olahraga' ? 'blue' :
                    item.category === 'Seni' ? 'amber' :
                      item.category === 'Rohani' ? 'emerald' :
                        item.category === 'Akademik' ? 'indigo' : 'purple';

              const colorClasses: Record<string, string> = {
                red: 'bg-red-50 text-red-600 border-red-100',
                blue: 'bg-blue-50 text-blue-600 border-blue-100',
                amber: 'bg-amber-50 text-amber-600 border-amber-100',
                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                purple: 'bg-purple-50 text-purple-600 border-purple-100'
              };

              const badgeClasses: Record<string, string> = {
                red: 'bg-red-100 text-red-700',
                blue: 'bg-blue-100 text-blue-700',
                amber: 'bg-amber-100 text-amber-700',
                emerald: 'bg-emerald-100 text-emerald-700',
                indigo: 'bg-indigo-100 text-indigo-700',
                purple: 'bg-purple-100 text-purple-700'
              };

              return (
                <div key={item.id || index} className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 duration-300 border-2 ${colorClasses[categoryColor]}`}>
                    <IconComponent className="w-10 h-10" />
                  </div>

                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 ${badgeClasses[categoryColor]}`}>
                    {item.category}
                  </div>

                  <h3 className="text-xl font-black text-blue-900 mb-3 tracking-tight">{item.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    {item.description || 'Kegiatan pengembangan diri dan bakat siswa.'}
                  </p>

                  {item.image && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mt-2">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 max-w-4xl mx-auto bg-blue-50 p-6 rounded-lg border-l-4 border-blue-900">
            <p className="text-gray-700">
              <strong>Ketentuan:</strong> Setiap siswa wajib mengikuti minimal 1 ekstrakurikuler pilihan
              (selain Pramuka yang bersifat wajib). Kegiatan ekstrakurikuler dilaksanakan setiap hari Rabu dan Jumat
              setelah jam pelajaran selesai.
            </p>
          </div>
        </div>
      </section>

      {/* Kegiatan Rohani */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cross className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl text-blue-900">Kegiatan Rohani</h2>
            </div>
            <div className="h-1 w-20 bg-amber-400 mx-auto mb-2"></div>
            <p className="text-gray-600 mt-4">Pembinaan Iman dan Spiritualitas Katolik</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {rohaniDataItems.map((activity: any, index: number) => (
              <div
                key={index}
                className="group relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-blue-50 overflow-hidden"
              >
                {/* Background Image (Optional) */}
                {activity.image && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent" />
                  </div>
                )}
                <div className={`relative z-10 p-8 h-full flex flex-col ${activity.image ? 'justify-end' : ''}`}>
                  {!activity.image && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                  )}

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${activity.image ? 'bg-amber-400 text-blue-900 shadow-lg' : 'bg-blue-900 text-white'
                    }`}>
                    <Cross className="w-6 h-6" />
                  </div>

                  <h3 className={`text-xl font-black mb-2 tracking-tight ${activity.image ? 'text-white' : 'text-blue-900'}`}>{activity.title}</h3>
                  <div className={`flex items-center gap-2 mb-4 ${activity.image ? 'text-amber-400' : 'text-blue-600'}`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{activity.schedule}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${activity.image ? 'text-blue-50' : 'text-gray-500'}`}>
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8 rounded-lg text-center">
            <Cross className="w-12 h-12 mx-auto mb-4" />
            <blockquote className="text-lg italic mb-2">
              "Kasihilah Tuhan, Allahmu, dengan segenap hatimu dan dengan segenap jiwamu dan dengan segenap akal budimu"
            </blockquote>
            <p className="text-blue-100">- Matius 22:37</p>
          </div>
        </div>
      </section>

      {/* Tata Tertib */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl text-blue-900 mb-4">Tata Tertib Sekolah</h2>
              <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-900 text-white p-6">
                <h3 className="text-xl">Peraturan yang Harus Dipatuhi Siswa</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {rulesDataItems.map((rule: string, index: number) => (
                    <li key={index} className="flex gap-6 group">
                      <div className="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-200 group-hover:rotate-12 transition-all">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 font-medium text-lg pt-1.5 leading-relaxed">
                        {rule}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 p-8 border-t-2 border-amber-200">
                <h4 className="text-amber-700 font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Ketentuan Sanksi
                </h4>
                <div className="space-y-3">
                  {sanctionsDataItems.map((sanksi: string, index: number) => (
                    <p key={index} className="text-gray-700 text-sm leading-relaxed flex gap-3">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-1.5" />
                      {sanksi}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
}
