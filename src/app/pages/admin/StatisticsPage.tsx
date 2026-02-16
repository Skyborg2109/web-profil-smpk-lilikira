import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNews } from '../../contexts/NewsContext';
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
    Globe,
    MousePointer,
    Download,
    Menu,
} from 'lucide-react';

export function StatisticsPage() {
    const { user, logout } = useAuth();
    const { articles } = useNews();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Mock visitor statistics
    const [stats] = useState({
        todayVisitors: 234,
        totalVisitors: 15847,
        activeUsers: 42,
        pageViews: 3421,
        avgDuration: '3m 24s',
        bounceRate: '42.3%',
        newVisitors: 8234,
        returningVisitors: 7613,
    });

    const [visitorData] = useState([
        { day: 'Sen', visitors: 145 },
        { day: 'Sel', visitors: 189 },
        { day: 'Rab', visitors: 234 },
        { day: 'Kam', visitors: 198 },
        { day: 'Jum', visitors: 267 },
        { day: 'Sab', visitors: 156 },
        { day: 'Min', visitors: 123 },
    ]);

    const [monthlyData] = useState([
        { month: 'Jan', visitors: 4234, pageViews: 12456 },
        { month: 'Feb', visitors: 5123, pageViews: 15234 },
        { month: 'Mar', visitors: 4567, pageViews: 13567 },
        { month: 'Apr', visitors: 5890, pageViews: 17234 },
        { month: 'Mei', visitors: 6234, pageViews: 18456 },
        { month: 'Jun', visitors: 5678, pageViews: 16789 },
    ]);

    const [topPages] = useState([
        { page: 'Beranda', views: 5234, percentage: 35 },
        { page: 'Profil Sekolah', views: 3456, percentage: 23 },
        { page: 'Galeri', views: 2345, percentage: 16 },
        { page: 'Berita', views: 1890, percentage: 13 },
        { page: 'SPMB', views: 1234, percentage: 8 },
        { page: 'Kontak', views: 756, percentage: 5 },
    ]);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    const maxVisitors = Math.max(...visitorData.map((d) => d.visitors));
    const maxMonthlyVisitors = Math.max(...monthlyData.map((d) => d.visitors));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
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
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Dashboard Statistik</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Ringkasan data performa website sekolah</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 overflow-auto">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Hari Ini</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-gray-900">{stats.todayVisitors}</h3>
                                <span className="text-xs font-bold text-green-500">+12%</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Total Kunjungan</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.totalVisitors.toLocaleString()}</h3>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Halaman Dilihat</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.pageViews.toLocaleString()}</h3>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Sesi Aktif</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <h3 className="text-3xl font-black text-gray-900">{stats.activeUsers}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Weekly Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <h3 className="text-lg font-black text-gray-900 mb-8 border-l-4 border-blue-600 pl-4 uppercase tracking-tight">Grafik Pengunjung Mingguan</h3>
                            <div className="flex items-end justify-between gap-4 h-72">
                                {visitorData.map((data, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="w-full bg-gray-50 rounded-xl relative h-full flex items-end overflow-hidden border border-gray-100">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-b-lg transition-all duration-500 group-hover:from-blue-700 group-hover:to-blue-500"
                                                style={{ height: `${(data.visitors / maxVisitors) * 100}%` }}
                                            />
                                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                {data.visitors}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{data.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Side Metrics */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest border-b pb-4">Retensi & Durasi</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Rerata Durasi</p>
                                        <p className="text-lg font-black text-blue-600">{stats.avgDuration}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Bounce Rate</p>
                                        <p className="text-lg font-black text-amber-600">{stats.bounceRate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest border-b pb-4">Tipe Pengguna</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                                            <span>Pengguna Baru</span>
                                            <span className="text-blue-600">52%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full rounded-full" style={{ width: '52%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                                            <span>Pengguna Lama</span>
                                            <span className="text-green-600">48%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full rounded-full" style={{ width: '48%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
