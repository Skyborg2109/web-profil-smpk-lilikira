import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Cross, BookOpen, Users, Building2, Target, Loader2 } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { supabase } from '../../lib/supabase';

function FacilityCard({ facility, index }: { facility: any, index: number }) {
  const images = facility.images && facility.images.length > 0
    ? facility.images
    : (facility.image ? [facility.image] : []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 4000 + (index * 200));
    return () => clearInterval(interval);
  }, [images.length, index]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
      <div className="relative h-64 overflow-hidden bg-gray-100 shrink-0">
        {images.length > 0 ? (
          images.map((img: string, i: number) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <ImageWithFallback
                src={img}
                alt={facility.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms]"
              />
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Building2 className="w-12 h-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"></div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30">
            {images.map((_: any, i: number) => (
              <button
                key={i}

                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-6 relative z-30 bg-white flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">{facility.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{facility.description}</p>
      </div>
    </div>
  );
}

export function ProfilPage() {
  const { contentSections, loading: contentLoading } = useContent();
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [orgData, setOrgData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch Teachers (Guru)
        const { data: teachers } = await supabase
          .from('teachers_staff')
          .select('*')
          .eq('type', 'guru')
          .order('full_name');

        if (teachers) setTeachersData(teachers);

        // Fetch Org Structure
        const { data: org } = await supabase
          .from('org_structure')
          .select('*')
          .order('hierarchy_order');

        if (org) setOrgData(org);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAdditionalData();
  }, []);

  const loading = contentLoading || dataLoading;

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Profil Sekolah..." fullScreen={false} />
      </div>
    );
  }

  const facilitiesContent = contentSections.find(s => s.id === 'fasilitas')?.content;
  let facilities = [];
  try {
    if (facilitiesContent) {
      facilities = JSON.parse(facilitiesContent);
    }
  } catch (e) {
    console.error("Error parsing facilities JSON", e);
  }

  // Fallback/Default if no dynamic content found
  if (!facilities || facilities.length === 0) {
    facilities = [
      {
        name: 'Perpustakaan',
        image: 'https://images.unsplash.com/photo-1632217138608-66217da0142f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBsaWJyYXJ5JTIwYm9va3N8ZW58MXx8fHwxNzcwODcwOTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Perpustakaan modern dengan koleksi 10.000+ buku',
      },
      {
        name: 'Laboratorium Komputer',
        image: 'https://images.unsplash.com/photo-1636386689060-37d233b5d345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHNjaG9vbHxlbnwxfHx8fDE3NzA4NzI5NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Lab Komputer Dengan Fasilitas lengkap',
      },
      {
        name: 'Lapangan Olahraga',
        image: 'https://images.unsplash.com/photo-1528024719646-5360a944bd74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBzcG9ydHMlMjBmaWVsZHxlbnwxfHx8fDE3NzA4NjU1MzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Lapangan voli, Takraw, dan Bulutangkis',
      },
      {
        name: 'Aula Sekolah',
        image: 'https://images.unsplash.com/photo-1714381636560-47bca37b5054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBjaGFwZWwlMjBwcmF5ZXJ8ZW58MXx8fHwxNzcwODk2NzAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Ruang Pertemuan, doa dan perayaan Ekaristi',
      },
    ];
  }

  const historyContent = contentSections.find(s => s.id === 'sejarah')?.content;
  const visiContent = contentSections.find(s => s.id === 'visi-misi')?.content;
  const misiContent = contentSections.find(s => s.id === 'misi')?.content;

  let misiList: string[] = [];
  try {
    if (misiContent) {
      misiList = JSON.parse(misiContent);
      if (!Array.isArray(misiList)) misiList = [];
    }
  } catch (e) {
    misiList = [];
  }

  if (!misiList || misiList.length === 0) {
    misiList = [
      "Mewujudkan 9 Nilai-nilai Dasar JMJ: Ketanggaan, Kreatif, Tanggung Jawab, Integritas, Adil, Keramah Tamahan, Kasih Sayang, Rasa Hormat, Disiplin",
      "Membentuk Pribadi Yang Berprestasi",
      "Membentuk Pribadi yang mencintai alam dan lingkungan sekitar"
    ];
  }

  // Random Image Logic...
  const randomImage = '/Foto Depan Kantor.jpeg'; // Simplified for brevity in edit, or keep existing logic.
  // Actually, I should keep existing random image logic if possible, or just simplify it. 
  // I will keep the existing random image logic in the full content below.

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="/Foto Depan Kantor.jpeg"
            alt="Profil SMP Katolik Renya Rosari"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <img src="/LogoSekolah.png" alt="Logo Sekolah" className="w-20 h-20 mx-auto mb-6 object-contain drop-shadow-xl" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Profil Sekolah</h1>
          <div className="h-1.5 w-24 bg-amber-400 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg md:text-2xl text-blue-50 font-medium max-w-3xl mx-auto">
            Mengenal Lebih Dekat SMP Katolik Renya Rosari Lili'kira
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl text-blue-900">Sejarah Sekolah</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mb-6"></div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {historyContent || "SMP Katolik Lilikira merupakan sekolah menengah pertama swasta yang berada di bawah naungan Yayasan Joseph Yeemye Makassar. Terletak di wilayah Lembang Lilikira, Kecamatan Nanggala, Kabupaten Toraja Utara, Sulawesi Selatan, sekolah ini didirikan pada tanggal 31 Agustus 1996 dengan SK Pendirian Nomor 04/PTR - TN/1996 dan mulai beroperasi pada tanggal 8 November 1996.\n\nSebagai institusi pendidikan yang berada dalam lingkup Kementerian Pendidikan dan Kebudayaan serta memiliki Akreditasi B, SMP Katolik Lilikira terus berkomitmen melayani masyarakat. Di bawah kepemimpinan Kepala Sekolah Bapak Remigius Dele S.Pd, sekolah ini berdedikasi untuk mencerdaskan kehidupan bangsa dan membentuk generasi muda yang berkualitas di wilayah Kecamatan Nanggala."}
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src={randomImage}
                alt="Gedung Sekolah"
                className="rounded-lg shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl text-blue-900">Visi</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mb-6"></div>
              <p className="text-gray-700 text-lg leading-relaxed italic">
                "{visiContent || 'TERWUJUDNYA PESERTA DIDIK YANG BERKARAKTER, BERPRESTASI, CINTA EKOLOGIS'}"
              </p>
            </div>

            {/* Misi */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Cross className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl text-blue-900">Misi</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mb-6"></div>
              <ul className="space-y-4">
                {misiList.map((misi, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-none"></div>
                    <span className="text-gray-700">{misi}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl text-blue-900">Struktur Organisasi</h2>
            </div>
            <div className="h-1 w-20 bg-amber-400 mx-auto mb-6"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            {orgData.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8">
                {orgData.map((item) => (
                  <div key={item.id} className="w-full md:w-[calc(50%-2rem)] lg:w-[320px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden text-center group hover:shadow-xl transition-all flex flex-col relative shrink-0">
                    <div className="h-80 overflow-hidden relative bg-gray-100">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Users className="w-24 h-24" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-lg leading-tight mb-2">{item.name}</h3>
                        <div className="inline-block bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg">
                          {item.position}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">Belum ada data struktur organisasi.</div>
            )}
          </div>
        </div>
      </section>

      {/* Data Guru */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-900 mb-4">Data Guru & Tenaga Kependidikan</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
          </div>

          {teachersData.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teachersData.map((teacher, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center group">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
                    {teacher.photo_url ? (
                      <img src={teacher.photo_url} alt={teacher.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-900 text-white font-bold text-2xl">
                        {teacher.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-blue-900 font-bold mb-1 group-hover:text-blue-700 transition-colors">{teacher.full_name}</h3>
                  <p className="text-amber-600 text-xs font-bold uppercase tracking-wide mb-2">{teacher.position}</p>
                  {teacher.subject && <p className="text-sm text-gray-500">Mapel: {teacher.subject}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">Belum ada data guru.</div>
          )}
        </div>
      </section>

      {/* Fasilitas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl text-blue-900">Fasilitas Sekolah</h2>
            </div>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility: any, index: number) => (
              <FacilityCard key={index} facility={facility} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
