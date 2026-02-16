import { useState } from 'react';
import { Camera, Video, Image as ImageIcon, Cross, PlayCircle, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useGallery } from '../contexts/GalleryContext';
import { useVideos } from '../contexts/VideoContext';
import { LoadingScreen } from '../components/LoadingScreen';

export function GaleriPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { galleryItems, loading: galleryLoading } = useGallery();
  const { videos, loading: videosLoading } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (galleryLoading || videosLoading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Galeri..." fullScreen={false} />
      </div>
    );
  }

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-full mb-6">
              <Video className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-bold text-sm uppercase tracking-widest">Video Dokumentasi</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-6 tracking-tight">Momen Berharga Kami</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
          </div>

          {videos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {videos.map((v) => (
                <div key={v.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="relative h-60 bg-gray-900">
                    <img
                      src={v.thumbnail_url || `https://img.youtube.com/vi/${getYoutubeId(v.video_url)}/maxresdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <button
                      onClick={() => setSelectedVideo(v.video_url)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <PlayCircle className="w-10 h-10 text-white group-hover:text-red-600 transition-colors" />
                      </div>
                    </button>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-blue-950 mb-3 group-hover:text-blue-700 transition-colors line-clamp-1">{v.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{v.description || 'Saksikan rangkaian kegiatan dan dokumentasi dari sekolah kami.'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada video dokumentasi untuk ditampilkan.</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-8">
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 text-white hover:text-amber-400 transition-colors p-2"
          >
            <X className="w-10 h-10" />
          </button>
          <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
