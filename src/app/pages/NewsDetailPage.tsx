import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, User, ArrowLeft, Share2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function NewsDetailPage() {
    const { id } = useParams();
    const { articles, loading } = useNews();
    const [currentImgIdx, setCurrentImgIdx] = useState(0);

    const article = articles.find((a) => a.id.toString() === id);
    const images = article?.images && article.images.length > 0 ? article.images : (article?.image ? [article.image] : []);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImgIdx((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    if (loading) {
        return (
            <div className="min-h-[60vh] relative">
                <LoadingScreen message="Memuat Berita..." fullScreen={false} />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Berita Tidak Ditemukan</h2>
                <p className="text-gray-600 mb-8 text-center max-w-md">
                    Maaf, berita yang Anda cari tidak tersedia atau telah dihapus.
                </p>
                <Link
                    to="/berita"
                    className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition-all font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Berita
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Header Slider */}
            <section className="relative h-[65vh] min-h-[450px] w-full overflow-hidden bg-slate-900">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${idx === currentImgIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                            }`}
                    >
                        <ImageWithFallback
                            src={img}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                {/* Slider Indicators - Horizontal bottom right */}
                {images.length > 1 && (
                    <div className="absolute right-8 md:right-16 bottom-12 flex flex-row gap-2 z-50 bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCurrentImgIdx(idx);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentImgIdx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                )}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-30">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            to="/berita"
                            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Berita
                        </Link>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <span className="bg-amber-400 text-blue-900 px-4 py-1 rounded-lg font-bold text-sm uppercase tracking-wider">
                                {article.category}
                            </span>
                            <div className="flex items-center gap-2 text-blue-100">
                                <Calendar className="w-5 h-5" />
                                <span>{article.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-100">
                                <User className="w-5 h-5" />
                                <span>{article.author}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg font-display">
                            {article.title}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <main className="lg:col-span-8">
                        <article className="bg-white rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden">
                            {/* Social Share Mobile */}
                            <div className="flex lg:hidden items-center justify-between mb-8 pb-8 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Bagikan Berita:</span>
                                <div className="flex gap-4">
                                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Rich Content Render */}
                            <div
                                className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed space-y-6"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {article.content}
                            </div>

                            {/* Gallery Section */}
                            {article.images && article.images.length > 0 && (
                                <div className="mt-12 space-y-6">
                                    <h3 className="text-2xl font-bold text-blue-900 border-b pb-4">Galeri Foto</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {article.images.map((img, idx) => (
                                            <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-lg border-4 border-white hover:border-blue-100 transition-all">
                                                <ImageWithFallback
                                                    src={img}
                                                    alt={`${article.title} - Galleri ${idx + 1}`}
                                                    className="w-full h-full object-cover aspect-video group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-gray-500 mr-2">
                                    <Tag className="w-5 h-5" />
                                    <span className="font-bold">Tags:</span>
                                </div>
                                <span className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-default">
                                    {article.category}
                                </span>
                                <span className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-default">
                                    Pendidikan
                                </span>
                                <span className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-default">
                                    Sekolah Katolik
                                </span>
                            </div>
                        </article>
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Share Desktop */}
                        <div className="bg-white rounded-3xl shadow-lg p-8 hidden lg:block">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                Bagikan Berita
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-bold shadow-md">
                                    Facebook
                                </button>
                                <button className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-colors font-bold shadow-md">
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Berita Terkait */}
                        <div className="bg-white rounded-3xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Berita Terkait
                            </h3>
                            <div className="space-y-6">
                                {articles
                                    .filter((a) => a.id !== article.id && a.published)
                                    .slice(0, 3)
                                    .map((related) => (
                                        <Link key={related.id} to={`/berita/${related.id}`} className="group block">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                                                    <ImageWithFallback
                                                        src={related.image}
                                                        alt={related.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-500 font-bold mb-1">{related.date}</p>
                                                    <h4 className="text-sm font-bold text-blue-900 leading-snug group-hover:text-amber-500 transition-colors line-clamp-2">
                                                        {related.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
