import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    Network,
    Plus,
    Edit,
    Trash2,
    X,
    Menu,
    Camera,
    Save,
    ChevronUp,
    ChevronDown,
    UserCircle,
    Loader2,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import { logActivity } from '../../../utils/logger';

interface OrgMember {
    id: number;
    name: string;
    position: string;
    hierarchy_order: number;
    photo_url: string;
}

export function OrgStructureManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [items, setItems] = useState<OrgMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState<OrgMember | null>(null);
    const [formData, setFormData] = useState<Omit<OrgMember, 'id'>>({
        name: '',
        position: '',
        hierarchy_order: 0,
        photo_url: '',
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
                .from('org_structure')
                .select('*')
                .order('hierarchy_order', { ascending: true });

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
            const filePath = `org/${fileName}`;

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
        const result = await showAlert.confirm('Simpan Data', 'Simpan data pengurus ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('org_structure')
                    .update(formData)
                    .eq('id', editingItem.id);
                if (error) throw error;
                await logActivity(user?.name || 'Admin', 'UPDATE', 'Org Structure', `Memperbarui data pengurus ${formData.name} (${formData.position})`);
            } else {
                const { error } = await supabase
                    .from('org_structure')
                    .insert([formData]);
                if (error) throw error;
                await logActivity(user?.name || 'Admin', 'INSERT', 'Org Structure', `Menambah pengurus baru: ${formData.name} (${formData.position})`);
            }
            showAlert.success('Berhasil', 'Data pengurus telah disimpan.');
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', position: '', hierarchy_order: 0, photo_url: '' });
            fetchData();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        }
    };

    const handleDelete = async (item: OrgMember) => {
        const result = await showAlert.confirm('Hapus Pengurus', 'Hapus data pengurus ini?');
        if (result.isConfirmed) {
            try {
                // Delete from storage
                if (item.photo_url) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(item.photo_url);
                }

                const { error } = await supabase.from('org_structure').delete().eq('id', item.id);
                if (error) throw error;
                await logActivity(user?.name || 'Admin', 'DELETE', 'Org Structure', `Menghapus data pengurus ${item.name} (${item.position})`);
                showAlert.success('Berhasil', 'Data pengurus telah dihapus.');
                fetchData();
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus: ' + error.message);
            }
        }
    };

    const handleRemovePhoto = async () => {
        if (!formData.photo_url) return;

        const result = await showAlert.confirm('Hapus Foto', 'Hapus foto pengurus ini?', 'Ya, Hapus', 'Batal', 'warning');
        if (!result.isConfirmed) return;

        try {
            const { deleteFileFromStorage } = await import('../../../utils/storage');
            await deleteFileFromStorage(formData.photo_url);

            setFormData(prev => ({ ...prev, photo_url: '' }));

            if (editingItem) {
                await supabase.from('org_structure').update({ ...formData, photo_url: '' }).eq('id', editingItem.id);
                showAlert.success('Berhasil', 'Foto telah dihapus.');
                fetchData();
            } else {
                showAlert.success('Berhasil', 'Foto telah dihapus dari form.');
            }
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menghapus foto: ' + error.message);
        }
    };

    const updateOrder = async (id: number, newOrder: number) => {
        try {
            const { error } = await supabase.from('org_structure').update({ hierarchy_order: newOrder }).eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal update urutan: ' + error.message);
        }
    };

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
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Struktur Organisasi</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Manajemen Hirarki Kepengurusan Sekolah</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setFormData({ name: '', position: '', hierarchy_order: items.length, photo_url: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Pengurus
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : items.map((item, index) => (
                            <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => updateOrder(item.id, item.hierarchy_order - 1.5)}
                                        className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-blue-600 transition-colors"
                                    >
                                        <ChevronUp className="w-5 h-5" />
                                    </button>
                                    <div className="text-center font-black text-slate-200 text-xs px-2">#{item.hierarchy_order}</div>
                                    <button
                                        onClick={() => updateOrder(item.id, item.hierarchy_order + 1.5)}
                                        className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-blue-600 transition-colors"
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="shrink-0 relative">
                                    {item.photo_url ? (
                                        <img src={item.photo_url} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-slate-50" />
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100">
                                            <UserCircle className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-slate-900 leading-none mb-1 truncate">{item.name}</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.position}</p>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setFormData({
                                                name: item.name,
                                                position: item.position,
                                                hierarchy_order: item.hierarchy_order,
                                                photo_url: item.photo_url || '',
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl hover:bg-white border border-transparent hover:border-blue-100 transition-all"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl hover:bg-white border border-transparent hover:border-red-100 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {!loading && items.length === 0 && (
                            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <Network className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Belum Ada Struktur Pengurus</h3>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="mt-4 text-blue-600 font-bold hover:underline"
                                >
                                    Tambah Pengurus Pertama
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Pengurus' : 'Tambah Pengurus'}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Lengkapi informasi struktur kepengurusan</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-7 h-7 text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center mb-6">
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

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Nama & Gelar"
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
                                        placeholder="Contoh: Kepala Sekolah"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Urut Jabatan (1 = Tertinggi)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.hierarchy_order}
                                        onChange={(e) => setFormData({ ...formData, hierarchy_order: parseFloat(e.target.value) })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-center"
                                        placeholder="1"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold italic">* Semakin kecil angkanya, semakin tinggi jabatan</p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Batal</button>
                                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />
                                    {editingItem ? 'Perbarui Pengurus' : 'Simpan Pengurus'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
