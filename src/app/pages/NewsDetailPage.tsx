import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, User, ArrowLeft, Share2, Tag, ChevronLeft, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function NewsDetailPage() {
    const { id } = useParams();
    const { articles, loading, incrementViews } = useNews();
    const [currentImgIdx, setCurrentImgIdx] = useState(0);

    const article = articles.find((a) => a.id.toString() === id);
    const images = article?.images && article.images.length > 0 ? article.images : (article?.image ? [article.image] : []);

    useEffect(() => {
        if (article) {
            incrementViews(article.id);
        }
    }, [article?.id, incrementViews]);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImgIdx((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    const shareToWhatsApp = () => {
        const text = `${article?.title}\n\nBaca selengkapnya di: ${window.location.href}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

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
            <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-slate-900">
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
                            <span className="bg-amber-400 text-blue-900 px-4 py-1 rounded-lg font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20">
                                {article.category}
                            </span>
                            <div className="flex items-center gap-2 text-blue-50 font-medium">
                                <Calendar className="w-5 h-5 text-amber-400" />
                                <span>{article.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-50 font-medium">
                                <User className="w-5 h-5 text-amber-400" />
                                <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-50 font-medium">
                                <Tag className="w-5 h-5 text-amber-400" />
                                <span>{article.views || 0} Views</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-2xl font-display">
                            {article.title}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <main className="lg:col-span-8">
                        <article className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-6 md:p-16 overflow-hidden border border-slate-100">
                            {/* Social Share Mobile */}
                            <div className="flex lg:hidden items-center justify-between mb-10 pb-6 border-b border-gray-100">
                                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Bagikan Berita</span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={shareToFacebook}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all active:scale-95"
                                        title="Bagikan ke Facebook"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={shareToWhatsApp}
                                        className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all active:scale-95"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Rich Content Render */}
                            <div
                                className="prose prose-lg md:prose-xl prose-slate max-w-none text-slate-700 leading-relaxed font-medium"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {article.content}
                            </div>

                            {/* Gallery Section */}
                            {article.images && article.images.length > 1 && (
                                <div className="mt-20 pt-16 border-t border-slate-100">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-blue-900 shadow-lg shadow-amber-200">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Galeri Foto</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dokumentasi Kegiatan</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {article.images.map((img, idx) => (
                                            <div key={idx} className="group relative rounded-3xl overflow-hidden shadow-xl border-4 border-white hover:border-amber-100 transition-all duration-500 hover:-translate-y-2">
                                                <ImageWithFallback
                                                    src={img}
                                                    alt={`${article.title} - Galleri ${idx + 1}`}
                                                    className="w-full h-full object-cover aspect-[4/3] group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-slate-400 mr-2">
                                    <Tag className="w-5 h-5" />
                                    <span className="font-black uppercase tracking-widest text-[10px]">Kategori:</span>
                                </div>
                                <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors cursor-default border border-blue-100">
                                    {article.category}
                                </span>
                                <span className="px-5 py-2 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-default border border-slate-200">
                                    Pendidikan
                                </span>
                                <span className="px-5 py-2 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-default border border-slate-200">
                                    Sekolah Katolik
                                </span>
                            </div>
                        </article>
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Share Desktop */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 hidden lg:block border border-slate-50">
                            <h3 className="text-xl font-black text-blue-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <Share2 className="w-6 h-6 text-amber-500" />
                                Bagikan
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={shareToFacebook}
                                    className="flex items-center justify-center gap-3 py-4 bg-[#1877F2] text-white rounded-2xl hover:opacity-90 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    Facebook
                                </button>
                                <button
                                    onClick={shareToWhatsApp}
                                    className="flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white rounded-2xl hover:opacity-90 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-200 active:scale-95"
                                >
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Berita Terkait */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-50">
                            <div className="flex items-center gap-3 mb-8">
                                <FileText className="w-6 h-6 text-amber-500" />
                                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">
                                    Baru <span className="text-amber-400">Rilis</span>
                                </h3>
                            </div>
                            <div className="space-y-8">
                                {articles
                                    .filter((a) => a.id !== article.id && a.published)
                                    .slice(0, 4)
                                    .map((related) => (
                                        <Link key={related.id} to={`/berita/${related.id}`} className="group block focus:outline-none">
                                            <div className="flex gap-5">
                                                <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-white group-hover:border-amber-400 transition-colors">
                                                    <ImageWithFallback
                                                        src={related.image}
                                                        alt={related.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1.5">{related.date}</p>
                                                    <h4 className="text-sm font-bold text-blue-900 leading-snug group-hover:text-amber-500 transition-colors line-clamp-2 uppercase tracking-tight">
                                                        {related.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                            <Link
                                to="/berita"
                                className="mt-10 w-full flex items-center justify-center gap-2 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-blue-900 hover:border-blue-100 transition-all font-black uppercase tracking-widest text-[10px]"
                            >
                                Lihat Semua Berita
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
