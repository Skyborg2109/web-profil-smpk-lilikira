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

    const [stats, setStats] = useState({
        todayVisitors: 234,
        totalVisitors: 15847,
        activeUsers: 42,
        pageViews: 3421,
        avgDuration: '3m 24s',
        bounceRate: '42.3%',
        newVisitors: 8234,
        returningVisitors: 7613,
    });

    const [dbStats, setDbStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalOrg: 0,
        totalGallery: 0,
    });

    const [visitorData, setVisitorData] = useState([
        { day: 'Sen', visitors: 0 },
        { day: 'Sel', visitors: 0 },
        { day: 'Rab', visitors: 0 },
        { day: 'Kam', visitors: 0 },
        { day: 'Jum', visitors: 0 },
        { day: 'Sab', visitors: 0 },
        { day: 'Min', visitors: 0 },
    ]);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchDbStats();
        }
    }, [user, navigate]);

    const fetchDbStats = async () => {
        try {
            const { supabase } = await import('../../../lib/supabase');
            const [
                { count: studentsCount },
                { count: teachersCount },
                { count: orgCount },
                { count: galleryCount },
                { data: activityLog }
            ] = await Promise.all([
                supabase.from('students').select('*', { count: 'exact', head: true }),
                supabase.from('teachers_staff').select('*', { count: 'exact', head: true }),
                supabase.from('org_structure').select('*', { count: 'exact', head: true }),
                supabase.from('gallery').select('*', { count: 'exact', head: true }),
                supabase.from('activity_logs').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            ]);

            const totalArticleViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

            setStats(prev => ({
                ...prev,
                totalVisitors: totalArticleViews + (galleryCount || 0) * 5, // Simulated total reach
                pageViews: totalArticleViews,
                activeUsers: 1, // Current admin
            }));

            setDbStats({
                totalStudents: studentsCount || 0,
                totalTeachers: teachersCount || 0,
                totalOrg: orgCount || 0,
                totalGallery: galleryCount || 0,
            });

            // Process activity logs for the last 7 days
            if (activityLog) {
                const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                const activityByDay: { [key: string]: number } = {};

                // Initialize last 7 days
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    activityByDay[days[date.getDay()]] = 0;
                }

                activityLog.forEach(log => {
                    const dayName = days[new Date(log.created_at).getDay()];
                    if (activityByDay[dayName] !== undefined) {
                        activityByDay[dayName]++;
                    }
                });

                const formattedData = Object.entries(activityByDay).map(([day, count]) => ({
                    day,
                    visitors: count
                }));
                setVisitorData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching db stats:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const maxVisitors = Math.max(...visitorData.map((d) => d.visitors), 1);

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
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Total Siswa</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-gray-900">{dbStats.totalStudents}</h3>
                                <span className="text-xs font-bold text-blue-500">Aktif</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Guru & Staf</p>
                            <h3 className="text-3xl font-black text-gray-900">{dbStats.totalTeachers}</h3>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Media Terunggah</p>
                            <h3 className="text-3xl font-black text-gray-900">{dbStats.totalGallery}</h3>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Artikel Publik</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-3xl font-black text-gray-900">{articles.length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Weekly Chart */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tren Aktivitas Sistem</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Log 7 Hari Terakhir</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-200" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktual</span>
                                    </div>
                                    <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                                        <TrendingUp className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative h-80 w-full group/chart">
                                {/* Grid Background */}
                                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                                    {[1, 2, 3, 4].map((_, i) => (
                                        <div key={i} className="w-full border-t border-slate-50 relative">
                                            <span className="absolute -left-8 -top-2 text-[9px] font-black text-slate-300 uppercase">
                                                {Math.round((maxVisitors / 4) * (4 - i))}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="w-full border-t border-slate-50" />
                                </div>

                                {/* Bars Container */}
                                <div className="absolute inset-0 flex items-end justify-between gap-4 pt-10 px-2">
                                    {visitorData.map((data, index) => {
                                        const isToday = new Date().getDay() === ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].indexOf(data.day);
                                        return (
                                            <div key={index} className="flex-1 h-full flex flex-col items-center gap-4 group relative">
                                                {/* Tooltip */}
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-20 pointer-events-none shadow-xl">
                                                    {data.visitors} Aksi
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                                </div>

                                                <div className="w-full relative flex-1 flex items-end">
                                                    {/* The Bar */}
                                                    <div
                                                        className={`w-full max-w-[40px] mx-auto rounded-t-2xl relative transition-all duration-700 ease-out shadow-lg 
                                                            ${isToday
                                                                ? 'bg-gradient-to-t from-blue-700 to-indigo-500 shadow-blue-200'
                                                                : 'bg-gradient-to-t from-slate-200 to-slate-100 group-hover:from-blue-600 group-hover:to-blue-400 group-hover:shadow-blue-100'
                                                            }`}
                                                        style={{ height: `${(data.visitors / maxVisitors) * 100}%` }}
                                                    >
                                                        {/* Glossy overlay */}
                                                        <div className="absolute inset-0 bg-white/10 rounded-t-2xl pointer-events-none" />

                                                        {/* Top indicator for Today */}
                                                        {isToday && (
                                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-400 rounded-full blur-[2px] animate-pulse" />
                                                        )}
                                                    </div>
                                                </div>

                                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isToday ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                                                    {data.day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Side Metrics */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Retention Card */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-50 rounded-xl">
                                        <Activity className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Metrik Performa</h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rerata Durasi</p>
                                            <p className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{stats.avgDuration}</p>
                                        </div>
                                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-2/3 h-full bg-blue-600" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pentalan (Bounce)</p>
                                            <p className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{stats.bounceRate}</p>
                                        </div>
                                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-amber-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Type Card */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 px-2">Karakteristik Pengguna</h3>
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 rounded-3xl group">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengguna Baru</span>
                                            <span className="text-sm font-black text-blue-600">52%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white rounded-full overflow-hidden p-0.5">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '52%' }} />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-3xl group">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengguna Lama</span>
                                            <span className="text-sm font-black text-indigo-600">48%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white rounded-full overflow-hidden p-0.5">
                                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '48%' }} />
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
