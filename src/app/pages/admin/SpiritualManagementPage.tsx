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
    Cross,
    Calendar,
    AlignLeft,
    Upload,
    Camera,
    ImageIcon,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import { LoadingScreen } from '../../components/LoadingScreen';

interface SpiritualActivity {
    id: string;
    title: string;
    description: string;
    schedule: string;
    image?: string;
}

interface SpiritualData {
    activities: SpiritualActivity[];
}

export function SpiritualManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const [spiritualData, setSpiritualData] = useState<SpiritualData>({
        activities: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchSpiritual();
        }
    }, [user, navigate]);

    const fetchSpiritual = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('academic_sections')
                .select('*')
                .eq('type', 'spiritual')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                try {
                    const parsed = JSON.parse(data.content);
                    setSpiritualData(parsed);
                } catch (e) {
                    console.error('Failed to parse spiritual data');
                }
            }
        } catch (error: any) {
            console.error('Error fetching spiritual:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `spiritual/${fileName}`;

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
            const oldActivity = spiritualData.activities.find(a => a.id === id);
            if (oldActivity?.image) {
                const { deleteFileFromStorage } = await import('../../../utils/storage');
                await deleteFileFromStorage(oldActivity.image);
            }

            setSpiritualData(prev => ({
                ...prev,
                activities: prev.activities.map(a => a.id === id ? { ...a, image: url } : a)
            }));
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleSave = async () => {
        const result = await showAlert.confirm('Simpan Data', 'Simpan data kegiatan rohani ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('academic_sections')
                .upsert({
                    type: 'spiritual',
                    title: 'Kegiatan Rohani',
                    content: JSON.stringify(spiritualData),
                    last_updated_by: user?.name || user?.username,
                }, { onConflict: 'type' });

            if (error) throw error;
            showAlert.success('Berhasil', 'Data Kegiatan Rohani berhasil disimpan!');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        const newItem: SpiritualActivity = {
            id: crypto.randomUUID(),
            title: '',
            description: '',
            schedule: '',
        };
        setSpiritualData(prev => ({ ...prev, activities: [...prev.activities, newItem] }));
    };

    const removeItem = async (id: string) => {
        const result = await showAlert.confirm('Hapus Kegiatan', 'Apakah Anda yakin ingin menghapus data kegiatan rohani ini?');
        if (result.isConfirmed) {
            const activity = spiritualData.activities.find(a => a.id === id);
            if (activity?.image) {
                const { deleteFileFromStorage } = await import('../../../utils/storage');
                await deleteFileFromStorage(activity.image);
            }
            setSpiritualData(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
            showAlert.success('Berhasil', 'Kegiatan telah dihapus.');
        }
    };

    const updateItem = (id: string, updates: Partial<SpiritualActivity>) => {
        setSpiritualData(prev => ({
            ...prev,
            activities: prev.activities.map(a => a.id === id ? { ...a, ...updates } : a)
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
                    <LoadingScreen message="Memuat Kegiatan Rohani..." fullScreen={false} />
                ) : (
                    <>
                        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                        <Menu className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Manajemen Kegiatan Rohani</h1>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kelola Pembinaan Iman & Spiritualitas</p>
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
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Daftar Kegiatan</h2>
                                    <button
                                        onClick={addItem}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah Kegiatan
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {spiritualData.activities.map((item, idx) => (
                                        <div key={item.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8 relative group">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute top-6 right-6 text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="shrink-0 space-y-4">
                                                    <div className="relative w-48 h-48 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group/img">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-6 text-center">
                                                                <ImageIcon className="w-8 h-8 mb-2" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">Foto Kegiatan</span>
                                                            </div>
                                                        )}
                                                        <label className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                                                            {uploading === item.id ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Upload className="w-6 h-6 text-white" />}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, item.id)} disabled={!!uploading} />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Nama Kegiatan</label>
                                                            <div className="relative">
                                                                <Cross className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                                <input
                                                                    type="text"
                                                                    value={item.title}
                                                                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                                                    placeholder="Contoh: Misa Jumat Pertama"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Jadwal / Frekuensi</label>
                                                            <div className="relative">
                                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                                <input
                                                                    type="text"
                                                                    value={item.schedule}
                                                                    onChange={(e) => updateItem(item.id, { schedule: e.target.value })}
                                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                                                    placeholder="Contoh: Setiap Hari Jumat"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Deskripsi Kegiatan</label>
                                                        <div className="relative h-full">
                                                            <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                                                            <textarea
                                                                value={item.description}
                                                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                                rows={3}
                                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                                                                placeholder="Jelaskan detail kegiatan..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {spiritualData.activities.length === 0 && (
                                        <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <Cross className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-xs">Belum ada data kegiatan rohani</p>
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
