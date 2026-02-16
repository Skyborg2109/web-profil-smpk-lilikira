import { useState } from 'react';
import { Camera, Video, Image as ImageIcon, Cross } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useGallery } from '../contexts/GalleryContext';
import { LoadingScreen } from '../components/LoadingScreen';

export function GaleriPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { galleryItems, loading } = useGallery();

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Galeri..." fullScreen={false} />
      </div>
    );
  }

  // Convert gallery items to match the expected format
  const formattedGalleryItems = galleryItems.map(item => ({
    id: item.id,
    type: 'photo',
    category: item.category,
    title: item.title,
    image: item.image,
  }));

  const tabs = [
    { id: 'all', label: 'Semua', icon: ImageIcon },
    { id: 'akademik', label: 'Akademik', icon: Camera },
    { id: 'rohani', label: 'Kegiatan Rohani', icon: Cross },
    { id: 'ekstrakurikuler', label: 'Ekstrakurikuler', icon: Camera },
    { id: 'kelas', label: 'Ruangan Kelas', icon: Camera },
    { id: 'fasilitas', label: 'Fasilitas', icon: Camera },
  ];

  const filteredItems = activeTab === 'all'
    ? formattedGalleryItems
    : formattedGalleryItems.filter(item => item.category === activeTab);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <section className="relative bg-blue-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay scale-110"
          style={{ backgroundImage: "url('/akademik%20bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <Camera className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Galeri</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">Dokumentasi Kegiatan dan Fasilitas Sekolah</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-white shadow-sm sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors ${activeTab === tab.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-white">
                <div className="relative h-72 overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-lg mb-2">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span className="text-white text-sm capitalize">{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada foto untuk kategori ini</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Video className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl text-blue-900">Video Dokumentasi</h2>
            </div>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                <Video className="w-16 h-16 text-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="text-xl text-blue-900 mb-2">Profile Sekolah 2026</h3>
                <p className="text-gray-600">Video profil lengkap SMP Katolik Renya Rosari Lili'kira</p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                <Video className="w-16 h-16 text-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="text-xl text-blue-900 mb-2">Highlight Kegiatan 2025</h3>
                <p className="text-gray-600">Dokumentasi kegiatan selama tahun 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
