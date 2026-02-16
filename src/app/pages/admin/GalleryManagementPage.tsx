import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useGallery, GalleryItem } from '../../contexts/GalleryContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    Image as ImageIcon,
    Upload,
    Trash2,
    Edit,
    Plus,
    Filter,
    Search,
    X,
    Menu,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function GalleryManagementPage() {
    const { user, logout } = useAuth();
    const { galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useGallery();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [newImage, setNewImage] = useState({
        title: '',
        category: selectedCategory === 'all' ? 'akademik' : selectedCategory,
        file: null as File | null,
    });
    const [editImage, setEditImage] = useState({
        title: '',
        category: 'akademik',
        file: null as File | null,
    });

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const categories = [
        { id: 'all', label: 'Semua' },
        { id: 'akademik', label: 'Akademik' },
        { id: 'rohani', label: 'Kegiatan Rohani' },
        { id: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
        { id: 'kelas', label: 'Ruangan Kelas' },
        { id: 'fasilitas', label: 'Fasilitas' },
        { id: 'piala', label: 'Piala' },
        { id: 'sertifikat', label: 'Sertifikat' },
    ];

    const filteredItems = galleryItems.filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleUpload = async () => {
        if (newImage.title && newImage.file) {
            const result = await showAlert.confirm('Upload Foto', 'Apakah Anda yakin ingin mengupload foto ini?', 'Ya, Upload', 'Batal', 'question');
            if (!result.isConfirmed) return;

            try {
                const imageUrl = await uploadImage(newImage.file);
                addGalleryItem({
                    title: newImage.title,
                    category: newImage.category,
                    image: imageUrl,
                });
                showAlert.success('Berhasil', 'Foto telah berhasil diupload.');
                setShowUploadModal(false);
                setNewImage({ title: '', category: selectedCategory === 'all' ? 'akademik' : selectedCategory, file: null });
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal mengupload foto: ' + error.message);
            }
        }
    };

    const handleEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setEditImage({
            title: item.title,
            category: item.category,
            file: null,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (editingItem && editImage.title) {
            const result = await showAlert.confirm('Simpan Perubahan', 'Simpan perubahan foto ini?', 'Ya, Simpan', 'Batal', 'question');
            if (!result.isConfirmed) return;

            try {
                const updates: Partial<GalleryItem> = {
                    title: editImage.title,
                    category: editImage.category,
                };

                if (editImage.file) {
                    // Delete old image from storage if new one is uploaded
                    if (editingItem.image) {
                        const { deleteFileFromStorage } = await import('../../../utils/storage');
                        await deleteFileFromStorage(editingItem.image);
                    }
                    updates.image = await uploadImage(editImage.file);
                }

                await updateGalleryItem(editingItem.id, updates);
                showAlert.success('Berhasil', 'Foto telah berhasil diperbarui.');
                setShowEditModal(false);
                setEditingItem(null);
                setEditImage({ title: '', category: 'akademik', file: null });
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal memperbarui foto: ' + error.message);
            }
        }
    };

    const handleDelete = async (item: GalleryItem) => {
        const result = await showAlert.confirm('Hapus Foto', 'Apakah Anda yakin ingin menghapus foto ini?');
        if (result.isConfirmed) {
            try {
                // Delete from storage first
                if (item.image) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(item.image);
                }

                await deleteGalleryItem(item.id);
                showAlert.success('Berhasil', 'Foto telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus foto: ' + error.message);
            }
        }
    };

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
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Kelola Galeri Foto</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Upload dan kelola foto sekolah (termasuk Piala)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-slate-900 text-white px-4 lg:px-6 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 font-bold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Upload Foto</span>
                            <span className="sm:hidden text-xs">Upload</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 overflow-auto">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari foto..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="relative h-48">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                                            {item.category}
                                        </span>
                                        <span className="text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-20">
                            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Tidak ada foto ditemukan</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">Upload Foto Baru</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul Foto
                                    </label>
                                    <input
                                        type="text"
                                        value={newImage.title}
                                        onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan judul foto"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori
                                    </label>
                                    <select
                                        value={newImage.category}
                                        onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {categories.filter((c) => c.id !== 'all').map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        File Foto
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setNewImage({ ...newImage, file: e.target.files?.[0] || null })
                                            }
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                        >
                                            Pilih file
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {newImage.file ? newImage.file.name : 'PNG, JPG, JPEG (Max 5MB)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!newImage.title || !newImage.file}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Foto</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingItem(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Current Image Preview */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Foto Saat Ini</p>
                                    <img
                                        src={editingItem.image}
                                        alt={editingItem.title}
                                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul Foto
                                    </label>
                                    <input
                                        type="text"
                                        value={editImage.title}
                                        onChange={(e) => setEditImage({ ...editImage, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan judul foto"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori
                                    </label>
                                    <select
                                        value={editImage.category}
                                        onChange={(e) => setEditImage({ ...editImage, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {categories.filter((c) => c.id !== 'all').map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ganti Foto (Opsional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setEditImage({ ...editImage, file: e.target.files?.[0] || null })
                                            }
                                            className="hidden"
                                            id="file-edit"
                                        />
                                        <label
                                            htmlFor="file-edit"
                                            className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                        >
                                            Pilih file baru
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {editImage.file ? editImage.file.name : 'Kosongkan jika tidak ingin mengganti foto'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingItem(null);
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={!editImage.title}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
