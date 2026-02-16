import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    FileSearch,
    Search,
    Menu,
    Clock,
    User,
    Activity,
    Calendar,
    Filter,
} from 'lucide-react';

interface ActivityLog {
    id: number;
    created_at: string;
    user_name: string;
    action: string;
    description: string;
    target: string;
}

export function ActivityLogManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else if (user.role !== 'admin') {
            navigate('/admin/dashboard');
        } else {
            fetchLogs();
        }
    }, [user, navigate]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error: any) {
            console.error('Error fetching logs:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const filteredLogs = logs.filter((log) =>
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Log Aktivitas</h1>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Jejak Audit & Monitoring Sistem</p>
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{logs.length} Log Tercatat</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col h-full overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex-none">
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari user, aksi, atau deskripsi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto px-8 relative">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {filteredLogs.map((log) => (
                                        <div key={log.id} className="py-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="w-10 h-10 bg-white shadow-md border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-4 mb-1">
                                                    <h3 className="font-black text-slate-900 text-sm truncate">{log.user_name}</h3>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(log.created_at).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${log.action.toLowerCase().includes('delete') ? 'bg-red-100 text-red-600' :
                                                            log.action.toLowerCase().includes('update') ? 'bg-amber-100 text-amber-600' :
                                                                'bg-green-100 text-green-600'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">— {log.target}</span>
                                                </div>
                                                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                    {log.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <div className="py-20 text-center">
                                            <FileSearch className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">Tidak ada log aktivitas ditemukan</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
