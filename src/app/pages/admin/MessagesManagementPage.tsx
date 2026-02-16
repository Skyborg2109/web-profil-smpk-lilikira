import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages, Message } from '../../contexts/MessageContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    Mail,
    Trash2,
    Search,
    Menu,
    Eye,
    CheckCircle2,
    X,
    User,
    ChevronRight,
    Calendar,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function MessagesManagementPage() {
    const { user, logout } = useAuth();
    const { messages, markAsRead, deleteMessage, refreshMessages } = useMessages();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        refreshMessages();
    }, [refreshMessages]);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const filteredItems = messages.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = async (message: Message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            await markAsRead(message.id);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await showAlert.confirm('Hapus Pesan', 'Hapus pesan ini?');
        if (result.isConfirmed) {
            try {
                await deleteMessage(id);
                if (selectedMessage?.id === id) setSelectedMessage(null);
                showAlert.success('Berhasil', 'Pesan telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus pesan: ' + error.message);
            }
        }
    };

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 bg-blue-50 rounded-xl lg:hidden hover:bg-blue-100 transition-colors"
                            >
                                <Menu className="w-6 h-6 text-blue-600" />
                            </button>
                            <div className="p-2 bg-blue-50 rounded-lg hidden lg:block">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Pesan Masuk</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">
                                    {unreadCount} Pesan belum dibaca
                                </p>
                            </div>
                        </div>
                        <div className="relative max-w-xs w-full hidden sm:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pesan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden bg-white">
                    {/* Message List */}
                    <div className={`w-full lg:w-[400px] border-r border-gray-100 overflow-y-auto ${selectedMessage ? 'hidden lg:block' : 'block'}`}>
                        <div className="divide-y divide-gray-50">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleView(item)}
                                    className={`w-full text-left p-6 hover:bg-slate-50 transition-all relative group ${selectedMessage?.id === item.id ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    {!item.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${!item.is_read ? 'text-blue-600' : 'text-slate-400'
                                            }`}>
                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                        </span>
                                        {!item.is_read && (
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </div>
                                    <h3 className={`text-sm mb-1 truncate ${!item.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                        {item.name}
                                    </h3>
                                    <p className={`text-xs mb-2 truncate ${!item.is_read ? 'text-slate-700 font-bold' : 'text-slate-400 font-medium'}`}>
                                        {item.subject}
                                    </p>
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                        {item.message}
                                    </p>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4 text-blue-500" />
                                    </div>
                                </button>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="p-12 text-center">
                                    <Mail className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Tidak ada pesan</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Detail */}
                    <div className={`flex-1 overflow-y-auto bg-slate-50/30 ${selectedMessage ? 'block' : 'hidden lg:flex items-center justify-center'}`}>
                        {selectedMessage ? (
                            <div className="max-w-4xl mx-auto p-4 lg:p-10 w-full">
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="lg:hidden mb-6 flex items-center gap-2 text-blue-600 font-bold text-sm"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                    Kembali ke Daftar
                                </button>

                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                    <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{selectedMessage.name}</h2>
                                                    <p className="text-sm text-slate-400 font-bold">{selectedMessage.email}</p>
                                                    <p className="text-sm text-slate-400 font-bold">{selectedMessage.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(selectedMessage.id)}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <a
                                                    href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`}
                                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-lg shadow-slate-900/20"
                                                >
                                                    Balas Pesan
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 lg:p-12">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Subjek Pesan</p>
                                                <h3 className="text-lg font-black text-slate-900">{selectedMessage.subject}</h3>
                                            </div>
                                        </div>

                                        <div className="prose max-w-none">
                                            <div className="flex items-center gap-2 mb-4 text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">
                                                    {new Date(selectedMessage.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                                    {selectedMessage.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-20">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-slate-50 mx-auto mb-8 animate-bounce">
                                    <Mail className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Pilih pesan untuk dibaca</h3>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
