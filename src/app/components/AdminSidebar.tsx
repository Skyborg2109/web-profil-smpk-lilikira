import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    LayoutDashboard,
    FileText,
    LogOut,
    Menu,
    X,
    BarChart3,
    Image as ImageIcon,
    FolderOpen,
    Settings,
    ChevronDown,
    Users,
    Globe,
    FileSearch,
    Mail,
    Award,
    Network,
    BookOpen,
    User,
    Trophy,
    Heart,
    Activity,
    Download,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showAlert } from '../../utils/sweetalert';

interface AdminSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onLogout: () => void;
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen, onLogout }: AdminSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const handleConfirmLogout = async () => {
        const result = await showAlert.confirm('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari sistem?', 'Ya, Keluar', 'Batal', 'warning');
        if (result.isConfirmed) {
            onLogout();
        }
    };

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
        );
    };

    const menuGroups = [
        {
            group: 'Utama',
            items: [
                { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
            ]
        },
        {
            group: 'Profil & Akademik',
            items: [
                { path: '/admin/org', icon: Network, label: 'Struktur Organisasi' },
                { path: '/admin/teachers', icon: Users, label: 'Guru & Staf Pengajar' },
                { path: '/admin/academic', icon: BookOpen, label: 'Kurikulum & Akademik' },
                { path: '/admin/achievements', icon: Award, label: 'Data Prestasi Sekolah' },
                { path: '/admin/content', icon: Settings, label: 'Profil Sekolah' },
            ]
        },
        {
            group: 'Kesiswaan & SPMB',
            items: [
                { path: '/admin/spmb', icon: FolderOpen, label: 'Pendaftaran SPMB' },
                { path: '/admin/students', icon: User, label: 'Database Siswa', adminOnly: true },
                { path: '/admin/osis', icon: Users, label: 'Organisasi OSIS' },
                { path: '/admin/extracurricular', icon: Trophy, label: 'Ekstrakurikuler' },
                { path: '/admin/spiritual', icon: Heart, label: 'Kegiatan Rohani' },
                { path: '/admin/rules', icon: FileSearch, label: 'Tata Tertib Siswa' },
            ]
        },
        {
            group: 'Informasi Publik',
            items: [
                { path: '/admin/news', icon: FileText, label: 'Berita & Artikel' },
                { path: '/admin/gallery', icon: ImageIcon, label: 'Galeri Foto' },
                { path: '/admin/documents', icon: Download, label: 'Pusat Download' },
                { path: '/admin/messages', icon: Mail, label: 'Kotak Pesan Masuk' },
            ]
        },
        {
            group: 'Sistem & Pengaturan',
            items: [
                { path: '/admin/statistics', icon: BarChart3, label: 'Statistik Website', adminOnly: true },

                { path: '/admin/logs', icon: Activity, label: 'Log Aktivitas Admin', adminOnly: true },
            ]
        }
    ];

    const isActive = (path: string) => location.pathname === path;
    const isGroupActive = (items: any[]) => items.some(item =>
        item.path ? isActive(item.path) : item.subItems?.some((sub: any) => isActive(sub.path))
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72 lg:w-24'
                    } bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white transition-all duration-300 flex flex-col shadow-2xl lg:shadow-none overflow-hidden`}
            >
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className={`flex items-center gap-3 transition-opacity duration-200 ${!sidebarOpen && 'lg:hidden'}`}>
                        <div className="bg-white p-1 rounded-xl shadow-lg shadow-white/10">
                            <img src="/LogoSekolah.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black tracking-tight text-lg uppercase leading-none">{user?.role === 'admin' ? 'Admin' : 'Operator'}<span className="text-blue-400">Panel</span></span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">v2.0 Beta</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all lg:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-2 hover:bg-white/10 rounded-xl transition-all hidden lg:block ${!sidebarOpen && 'mx-auto'}`}
                    >
                        {sidebarOpen ? <Menu className="w-5 h-5 opacity-50" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pt-6">
                    {menuGroups.map((group, idx) => {
                        // Hide "Sistem & Pengaturan" group for non-admins (operators)
                        if (group.group === 'Sistem & Pengaturan' && user?.role !== 'admin') {
                            return null;
                        }

                        return (
                            <div key={idx} className="space-y-2">
                                <p className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                                    {group.group}
                                </p>
                                <nav className="space-y-1">
                                    {group.items.map((item: any, itemIdx) => {
                                        if (item.adminOnly && user?.role !== 'admin') return null;

                                        if (item.subItems) {
                                            const isMenuOpen = openMenus.includes(item.label) || (sidebarOpen && item.subItems.some((s: any) => isActive(s.path)));
                                            return (
                                                <div key={itemIdx} className="space-y-1">
                                                    <button
                                                        onClick={() => sidebarOpen ? toggleMenu(item.label) : setSidebarOpen(true)}
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${item.subItems.some((s: any) => isActive(s.path))
                                                            ? 'bg-blue-600/10 text-blue-400'
                                                            : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <item.icon className="w-5 h-5" />
                                                            <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                        {sidebarOpen && <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />}
                                                    </button>
                                                    {sidebarOpen && isMenuOpen && (
                                                        <div className="ml-9 space-y-1 py-1 border-l border-white/5">
                                                            {item.subItems.map((sub: any, subIdx: number) => {
                                                                if (sub.adminOnly && user?.role !== 'admin') return null;
                                                                return (
                                                                    <button
                                                                        key={subIdx}
                                                                        onClick={() => {
                                                                            navigate(sub.path);
                                                                            setSidebarOpen(false);
                                                                        }}
                                                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isActive(sub.path)
                                                                            ? 'text-white'
                                                                            : 'text-slate-500 hover:text-slate-300'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-1 h-1 rounded-full ${isActive(sub.path) ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-slate-700'}`} />
                                                                        {sub.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                key={itemIdx}
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setSidebarOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${isActive(item.path)
                                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/10'
                                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                                                <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleConfirmLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl transition-all group shadow-sm bg-black/20"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-125 transition-all text-red-500" />
                        <span className={`font-bold text-sm transition-all duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
                            }`}>
                            Log Out Sistem
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}
