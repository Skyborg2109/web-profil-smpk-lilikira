import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useAchievements, Achievement } from '../../contexts/AchievementContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    Trophy,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    X,
    Menu,
    Award,
    User,
    Calendar,
    Globe,
    Upload,
    Camera,
    Loader2,
    Image as ImageIcon,
    Save,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function AchievementsManagementPage() {
    const { user, logout } = useAuth();
    const { achievements, addAchievement, updateAchievement, deleteAchievement } = useAchievements();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Achievement | null>(null);
    const [formData, setFormData] = useState<Omit<Achievement, 'id' | 'created_at'>>({
        name: '',
        class_name: '',
        achievement: '',
        level: 'Nasional',
        year: new Date().getFullYear().toString(),
        category: 'akademik',
        type: 'student',
        image: '',
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `achievements/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const filteredItems = achievements.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.achievement.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    const resetForm = () => {
        setFormData({
            name: '',
            class_name: '',
            achievement: '',
            level: 'Nasional',
            year: new Date().getFullYear().toString(),
            category: 'akademik',
            type: 'student',
            image: '',
        });
        setEditingItem(null);
        setShowModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await showAlert.confirm('Simpan Data', 'Simpan data prestasi ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            if (editingItem) {
                await updateAchievement(editingItem.id, formData);
            } else {
                await addAchievement(formData);
            }
            showAlert.success('Berhasil', 'Data prestasi telah disimpan.');
            resetForm();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan data: ' + error.message);
        }
    };

    const handleEdit = (item: Achievement) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            class_name: item.class_name,
            achievement: item.achievement,
            level: item.level,
            year: item.year,
            category: item.category,
            type: item.type,
            image: item.image || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (item: Achievement) => {
        const result = await showAlert.confirm('Hapus Prestasi', 'Apakah Anda yakin ingin menghapus data prestasi ini?');
        if (result.isConfirmed) {
            try {
                // Hapus dari storage jika ada gambarnya
                if (item.image) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(item.image);
                }

                await deleteAchievement(item.id);
                showAlert.success('Berhasil', 'Data prestasi telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus data: ' + error.message);
            }
        }
    };

    const handleRemovePhoto = async () => {
        if (!formData.image) return;

        const result = await showAlert.confirm('Hapus Foto', 'Apakah Anda yakin ingin menghapus foto saja?', 'Ya, Hapus', 'Batal', 'warning');
        if (!result.isConfirmed) return;

        try {
            const { deleteFileFromStorage } = await import('../../../utils/storage');
            await deleteFileFromStorage(formData.image);

            setFormData(prev => ({ ...prev, image: '' }));

            // Jika sedanga mengedit, update langsung ke database
            if (editingItem) {
                await updateAchievement(editingItem.id, { ...formData, image: '' });
                showAlert.success('Berhasil', 'Foto telah dihapus dari database.');
            } else {
                showAlert.success('Berhasil', 'Foto telah dihapus dari form.');
            }
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menghapus foto: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col">
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
                                <Trophy className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Kelola Prestasi Siswa</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Manajemen Pencapaian & Juara Siswa</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/admin/gallery')}
                                className="bg-blue-50 text-blue-600 px-4 lg:px-6 py-2 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 font-bold text-sm border border-blue-100 shadow-sm"
                            >
                                <ImageIcon className="w-4 h-4" />
                                Galeri Piala
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-slate-900 text-white px-4 lg:px-6 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg font-bold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Prestasi
                            </button>
                            <button
                                onClick={() => alert('Data prestasi disinkronkan secara otomatis setiap perubahan disimpan.')}
                                className="bg-white text-slate-900 border border-slate-200 px-4 lg:px-6 py-2 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-sm shadow-sm"
                            >
                                <Save className="w-4 h-4 text-blue-600" />
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau prestasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="h-2 bg-blue-600"></div>
                                <div className="p-6">
                                    {item.image && (
                                        <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-slate-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Kelas {item.class_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-medium">{item.achievement}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            <Globe className="w-4 h-4" />
                                            <span>Tingkat {item.level}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            <Calendar className="w-4 h-4" />
                                            <span>Tahun {item.year}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.category === 'akademik' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                            <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada data prestasi ditemukan</p>
                        </div>
                    )}
                </main>
            </div >

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{editingItem ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}</h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Foto Prestasi (Opsional)</label>
                                <div className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group">
                                    {formData.image ? (
                                        <>
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                                title="Hapus Foto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <Camera className="w-8 h-8 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Klik untuk upload foto</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                        {uploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Upload className="w-6 h-6 text-white" />}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Siswa</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: Michael Agung"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Kelas</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.class_name}
                                        onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: IX-A"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Prestasi</label>
                                <textarea
                                    required
                                    value={formData.achievement}
                                    onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Contoh: Juara 1 Olimpiade Matematika"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tingkat</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="International">Internasional</option>
                                        <option value="Nasional">Nasional</option>
                                        <option value="Provinsi">Provinsi</option>
                                        <option value="Kota">Kota/Kabupaten</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tahun</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={formData.category === 'akademik'}
                                            onChange={() => setFormData({ ...formData, category: 'akademik' })}
                                        />
                                        <span>Akademik</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={formData.category === 'non-akademik'}
                                            onChange={() => setFormData({ ...formData, category: 'non-akademik' })}
                                        />
                                        <span>Non-Akademik</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={resetForm} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
}
