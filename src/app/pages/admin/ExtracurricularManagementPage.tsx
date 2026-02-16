import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    Plus,
    Trash2,
    Save,
    Menu,
    Loader2,
    Upload,
    Trophy,
    Music,
    Users,
    Heart,
    Star,
    Camera,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import { LoadingScreen } from '../../components/LoadingScreen';

interface Extracurricular {
    id: string;
    name: string;
    category: string;
    description: string;
    image?: string;
    icon: string;
}

interface ExtraData {
    items: Extracurricular[];
}

const ICON_OPTIONS = [
    { name: 'Users', icon: Users },
    { name: 'Trophy', icon: Trophy },
    { name: 'Music', icon: Music },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
];

const CATEGORIES = ['Wajib', 'Olahraga', 'Seni', 'Rohani', 'Akademik', 'Lainnya'];

export function ExtracurricularManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const [extraData, setExtraData] = useState<ExtraData>({
        items: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchExtras();
        }
    }, [user, navigate]);

    const fetchExtras = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('academic_sections')
                .select('*')
                .eq('type', 'extracurricular')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                try {
                    const parsed = JSON.parse(data.content);
                    setExtraData(parsed);
                } catch (e) {
                    console.error('Failed to parse extracurricular data');
                }
            }
        } catch (error: any) {
            console.error('Error fetching extras:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `extracurricular/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(id);
            const url = await uploadImage(file);

            // Delete old image if exists
            const oldItem = extraData.items.find(item => item.id === id);
            if (oldItem?.image) {
                const { deleteFileFromStorage } = await import('../../../utils/storage');
                await deleteFileFromStorage(oldItem.image);
            }

            setExtraData(prev => ({
                ...prev,
                items: prev.items.map(item => item.id === id ? { ...item, image: url } : item)
            }));
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleSave = async () => {
        const result = await showAlert.confirm('Simpan Data', 'Simpan data ekstrakurikuler ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('academic_sections')
                .upsert({
                    type: 'extracurricular',
                    title: 'Ekstrakurikuler',
                    content: JSON.stringify(extraData),
                    last_updated_by: user?.name || user?.username,
                }, { onConflict: 'type' });

            if (error) throw error;
            showAlert.success('Berhasil', 'Data Ekstrakurikuler berhasil disimpan!');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        const newItem: Extracurricular = {
            id: crypto.randomUUID(),
            name: '',
            category: 'Hobi',
            description: '',
            icon: 'Star',
        };
        setExtraData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = async (id: string) => {
        const result = await showAlert.confirm('Hapus Ekskul', 'Apakah Anda yakin ingin menghapus data ekstrakurikuler ini?');
        if (result.isConfirmed) {
            const item = extraData.items.find(i => i.id === id);
            if (item?.image) {
                const { deleteFileFromStorage } = await import('../../../utils/storage');
                await deleteFileFromStorage(item.image);
            }
            setExtraData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
            showAlert.success('Berhasil', 'Ekskul telah dihapus.');
        }
    };

    const updateItem = (id: string, updates: Partial<Extracurricular>) => {
        setExtraData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex text-slate-900">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {loading ? (
                    <LoadingScreen message="Memuat Ekstrakurikuler..." fullScreen={false} />
                ) : (
                    <>
                        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                        <Menu className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Manajemen Ekstrakurikuler</h1>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kelola Kegiatan Ekspedisi Minat & Bakat</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-slate-200"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </header>

                        <main className="flex-1 overflow-auto p-8">
                            <div className="max-w-6xl mx-auto space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Daftar Ekstrakurikuler</h2>
                                    <button
                                        onClick={addItem}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah Ekstrakurikuler
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {extraData.items.map((item) => (
                                        <div key={item.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8 space-y-6 relative group overflow-hidden">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute top-6 right-6 text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="flex gap-8">
                                                <div className="shrink-0 space-y-4">
                                                    <div className="relative w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group/img">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Camera className="w-8 h-8 text-slate-300" />
                                                            </div>
                                                        )}
                                                        <label className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                                                            {uploading === item.id ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Upload className="w-6 h-6 text-white" />}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, item.id)} disabled={!!uploading} />
                                                        </label>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Icon</label>
                                                        <div className="flex gap-2 flex-wrap max-w-[128px]">
                                                            {ICON_OPTIONS.map((opt) => (
                                                                <button
                                                                    key={opt.name}
                                                                    onClick={() => updateItem(item.id, { icon: opt.name })}
                                                                    className={`p-2 rounded-lg transition-all ${item.icon === opt.name ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                                >
                                                                    <opt.icon className="w-4 h-4" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Nama Ekskul</label>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                                                            placeholder="Contoh: Pramuka"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Kategori</label>
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => updateItem(item.id, { category: e.target.value })}
                                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                                                        >
                                                            {CATEGORIES.map(cat => (
                                                                <option key={cat} value={cat}>{cat}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Keterangan Singkat</label>
                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                            rows={3}
                                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                                                            placeholder="Deskripsi singkat kegiatan..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {extraData.items.length === 0 && (
                                        <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <Star className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-xs">Belum ada data ekstrakurikuler</p>
                                            <button onClick={addItem} className="mt-4 text-blue-600 font-bold text-xs uppercase hover:underline">Tambah Sekarang</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}
