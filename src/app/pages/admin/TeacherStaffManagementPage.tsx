import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    Users,
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    Filter,
    Menu,
    UserCircle,
    Camera,
    Save,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import { logActivity } from '../../../utils/logger';

interface TeacherStaff {
    id: number;
    full_name: string;
    nip: string;
    position: string;
    type: 'guru' | 'staf';
    photo_url: string;
    subject?: string;
}

export function TeacherStaffManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'guru' | 'staf'>('all');
    const [items, setItems] = useState<TeacherStaff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState<TeacherStaff | null>(null);
    const [formData, setFormData] = useState<Omit<TeacherStaff, 'id'>>({
        full_name: '',
        nip: '',
        position: '',
        type: 'guru',
        photo_url: '',
        subject: '',
    });

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchData();
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('teachers_staff')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `teachers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            setFormData({ ...formData, photo_url: publicUrl });
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload foto: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await showAlert.confirm('Simpan Data', 'Simpan data guru/staf ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('teachers_staff')
                    .update(formData)
                    .eq('id', editingItem.id);
                if (error) throw error;
                await logActivity(user?.name || 'Admin', 'UPDATE', 'Teacher/Staff', `Memperbarui data ${formData.full_name} (${formData.position})`);
            } else {
                const { error } = await supabase
                    .from('teachers_staff')
                    .insert([formData]);
                if (error) throw error;
                await logActivity(user?.name || 'Admin', 'INSERT', 'Teacher/Staff', `Menambah data ${formData.full_name} sebagai ${formData.position}`);
            }
            showAlert.success('Berhasil', 'Data telah disimpan.');
            setShowModal(false);
            setEditingItem(null);
            setFormData({ full_name: '', nip: '', position: '', type: 'guru', photo_url: '', subject: '' });
            fetchData();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        }
    };

    const handleDelete = async (item: TeacherStaff) => {
        const result = await showAlert.confirm('Hapus Data', 'Hapus data ini?');
        if (result.isConfirmed) {
            try {
                // Delete from storage
                if (item.photo_url) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(item.photo_url);
                }

                const { error } = await supabase.from('teachers_staff').delete().eq('id', item.id);
                if (error) throw error;
                await logActivity(user?.name || 'Admin', 'DELETE', 'Teacher/Staff', `Menghapus data ${item.full_name} (${item.position})`);
                showAlert.success('Berhasil', 'Data telah dihapus.');
                fetchData();
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus: ' + error.message);
            }
        }
    };

    const handleRemovePhoto = async () => {
        if (!formData.photo_url) return;

        const result = await showAlert.confirm('Hapus Foto', 'Hapus foto personel ini?', 'Ya, Hapus', 'Batal', 'warning');
        if (!result.isConfirmed) return;

        try {
            const { deleteFileFromStorage } = await import('../../../utils/storage');
            await deleteFileFromStorage(formData.photo_url);

            setFormData(prev => ({ ...prev, photo_url: '' }));

            if (editingItem) {
                await supabase.from('teachers_staff').update({ ...formData, photo_url: '' }).eq('id', editingItem.id);
                showAlert.success('Berhasil', 'Foto telah dihapus.');
                fetchData();
            } else {
                showAlert.success('Berhasil', 'Foto telah dihapus dari form.');
            }
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menghapus foto: ' + error.message);
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Guru & Staf</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Manajemen Tenaga Kependidikan</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setFormData({ full_name: '', nip: '', position: '', type: 'guru', photo_url: '', subject: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Personel
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau jabatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as any)}
                                className="bg-gray-50 border-none px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-600"
                            >
                                <option value="all">Semua Jenis</option>
                                <option value="guru">Guru</option>
                                <option value="staf">Staf</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-4" />
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                                </div>
                            ))
                        ) : filteredItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-gray-100 group relative overflow-hidden transition-all hover:translate-y-[-4px]">
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setFormData({
                                                full_name: item.full_name,
                                                nip: item.nip || '',
                                                position: item.position,
                                                type: item.type,
                                                photo_url: item.photo_url || '',
                                                subject: item.subject || '',
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-2 bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        {item.photo_url ? (
                                            <img src={item.photo_url} alt={item.full_name} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg" />
                                        ) : (
                                            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                                                <UserCircle className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-md ${item.type === 'guru' ? 'bg-blue-600' : 'bg-amber-500'}`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-slate-900 leading-tight mb-1">{item.full_name}</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{item.position}</p>
                                    {item.nip && <p className="text-[10px] text-slate-400 font-bold">NIP. {item.nip}</p>}
                                    {item.subject && <p className="text-[10px] text-slate-400 font-bold mt-1">Mapel: {item.subject}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!loading && filteredItems.length === 0 && (
                        <div className="py-20 text-center">
                            <Users className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Tidak Ada Personel Ditemukan</h3>
                        </div>
                    )}
                </main>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Personel' : 'Tambah Personel'}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Lengkapi data tenaga kependidikan</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-7 h-7 text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center mb-8">
                                <div className="relative group">
                                    {formData.photo_url ? (
                                        <>
                                            <img src={formData.photo_url} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-slate-50" />
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                                title="Hapus Foto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border-4 border-dashed border-slate-200 group-hover:border-blue-300 transition-colors">
                                            <Camera className="w-8 h-8 text-slate-300 group-hover:text-blue-400" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Nama & Gelar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                    >
                                        <option value="guru">Guru</option>
                                        <option value="staf">Staf</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NIP / NUPTK</label>
                                    <input
                                        type="text"
                                        value={formData.nip}
                                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jabatan</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Contoh: Guru Matematika"
                                    />
                                </div>
                            </div>

                            {formData.type === 'guru' && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mata Pelajaran Diampu</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Contoh: IPA & SBDP"
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Batal</button>
                                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />
                                    {editingItem ? 'Perbarui Data' : 'Simpan Personel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
