import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNews } from '../../contexts/NewsContext';
import { useSPMB } from '../../contexts/SPMBContext';
import { useVideos } from '../../contexts/VideoContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    Users,
    Eye,
    TrendingUp,
    Calendar,
    BarChart3,
    Activity,
    Clock,
    FileText,
    ArrowRight,
    PlusCircle,
    ClipboardList,
    LayoutDashboard,
    Menu,
    Video,
} from 'lucide-react';

export function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const { articles } = useNews();
    const { applications } = useSPMB();
    const { videos } = useVideos();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // visitor statistics
    const [stats] = useState({
        todayVisitors: 234,
        totalVisitors: 15847,
        activeUsers: 42,
        pageViews: 3421,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const publishedArticles = articles.filter((a) => a.published).length;
    const pendingSPMB = applications.filter((app) => app.status === 'pending').length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 bg-blue-50 rounded-xl lg:hidden hover:bg-blue-100 transition-colors"
                            >
                                <Menu className="w-6 h-6 text-blue-600" />
                            </button>
                            <div className="p-2 bg-blue-50 rounded-lg hidden lg:block">
                                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Operator Dashboard'}
                                </h1>
                                <p className="text-[10px] font-semibold text-slate-400 opacity-0 sm:opacity-100 uppercase tracking-widest leading-none">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.name.split(' ')[0]}</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border ${user?.role === 'admin'
                                    ? 'text-blue-600 bg-blue-50 border-blue-100'
                                    : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                    }`}>
                                    {user?.role === 'admin' ? 'Administrator' : 'Operator Staff'}
                                </span>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white ${user?.role === 'admin'
                                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-200'
                                : 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-200'
                                }`}>
                                {user?.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 lg:p-10 space-y-6 lg:space-y-10 overflow-auto">
                    {/* Welcome Section */}
                    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-12 shadow-sm">
                        <div className="relative z-10 max-w-2xl">
                            <span className={`inline-block px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest mb-4 border ${user?.role === 'admin'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {user?.role === 'admin' ? 'System Administrator' : 'Content Operator'} Area
                            </span>
                            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-4 leading-[1.1]">
                                Halo, {user?.name.split(' ')[0]}! <span className="animate-wave inline-block">👋</span>
                            </h2>
                            <p className="text-slate-500 text-base lg:text-lg font-medium leading-relaxed mb-6 lg:mb-8">
                                {user?.role === 'admin'
                                    ? 'Pantau statistik, kelola pengguna, dan atur seluruh konfigurasi sistem sekolah.'
                                    : 'Kelola konten berita, pendaftaran siswa, dan informasi publik sekolah dengan mudah.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => navigate('/admin/news')}
                                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-sm"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Post Berita Baru
                                </button>
                                <button
                                    onClick={() => navigate('/admin/spmb')}
                                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                                >
                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                    Cek Pendaftar
                                </button>
                                <button
                                    onClick={() => navigate('/admin/videos')}
                                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-50 border-2 border-amber-100 text-amber-700 rounded-2xl font-bold hover:bg-amber-100 transition-all text-sm"
                                >
                                    <Video className="w-5 h-5" />
                                    Kelola Video
                                </button>
                            </div>
                        </div>

                        {/* Geometric Background Decorations */}
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 lg:w-96 lg:h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                                <Users className="w-5 h-5 lg:w-6 lg:h-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pengunjung</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">{stats.todayVisitors}</h3>
                                <div className="flex items-center text-[10px] font-bold text-green-500">
                                    <TrendingUp className="w-3 h-3 mr-1" /> 12%
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                                <ClipboardList className="w-5 h-5 lg:w-6 lg:h-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendaftaran</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">{pendingSPMB}</h3>
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Pending</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600">
                                <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Artikel</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">{articles.length}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{publishedArticles} Live</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                                <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Server</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">Stable</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                                <Video className="w-5 h-5 lg:w-6 lg:h-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Video Dokumentasi</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">{videos.length}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Youtube Links</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
                        {/* News Summary */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">Postingan Terbaru</h3>
                                    <p className="text-xs lg:text-sm font-medium text-slate-500">Update berita terkini</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/news')}
                                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
                                >
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {articles.slice(0, 4).map((article) => (
                                    <div
                                        key={article.id}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
                                        onClick={() => navigate('/admin/news')}
                                    >
                                        <div className="relative h-14 w-14 lg:h-16 lg:w-20 flex-shrink-0 overflow-hidden rounded-xl">
                                            <img src={article.image} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-slate-800 truncate mb-1 text-xs lg:text-sm uppercase tracking-tight">{article.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                                <span>{article.date}</span>
                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SPMB Summary */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">Pendaftaran Baru</h3>
                                    <p className="text-xs lg:text-sm font-medium text-slate-500">Siswa baru terdaftar</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/spmb')}
                                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
                                >
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {applications.slice(0, 4).map((app) => (
                                    <div key={app.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                                                {app.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-xs lg:text-sm uppercase">{app.name}</h4>
                                                <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{app.previous_school}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest ${app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
