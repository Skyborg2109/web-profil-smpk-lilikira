import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNews, NewsArticle } from '../../contexts/NewsContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Filter,
    Calendar,
    User,
    Save,
    XCircle,
    Upload,
    Menu,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function NewsManagementPage() {
    const { user, logout } = useAuth();
    const { articles, addArticle, updateArticle, deleteArticle } = useNews();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        author: user?.name || '',
        category: 'Kegiatan Rohani',
        image: '',
        images: [] as string[],
        excerpt: '',
        content: '',
        published: false,
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

    const categories = ['Kegiatan Rohani', 'Prestasi', 'Perayaan', 'Kegiatan Sosial', 'Akademik'];

    const filteredArticles = articles.filter((article) => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news/${fileName}`;

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await showAlert.confirm('Simpan Berita', 'Apakah Anda yakin ingin menyimpan berita ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            let currentImages = [...formData.images];

            // Upload new images
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(file => uploadImage(file));
                const newUrls = await Promise.race([
                    Promise.all(uploadPromises),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout upload gambar')), 60000))
                ]) as string[];
                currentImages = [...currentImages, ...newUrls];
            }

            const articleData = {
                ...formData,
                image: currentImages[0] || '', // Use first image as main
                images: currentImages,
            };

            if (editingArticle) {
                await updateArticle(editingArticle.id, articleData);
            } else {
                await addArticle(articleData);
            }
            showAlert.success('Berhasil', 'Berita telah disimpan.');
            resetForm();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan berita: ' + error.message);
        }
    };

    const handleEdit = (article: NewsArticle) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            date: article.date,
            author: article.author,
            category: article.category,
            image: article.image,
            images: article.images || (article.image ? [article.image] : []),
            excerpt: article.excerpt,
            content: article.content,
            published: article.published,
        });
        setImageFiles([]); // Reset image files when editing
        setShowModal(true);
    };

    const handleDelete = async (article: NewsArticle) => {
        const result = await showAlert.confirm('Hapus Berita', 'Apakah Anda yakin ingin menghapus berita ini?');
        if (result.isConfirmed) {
            try {
                // Delete from storage
                if (article.image) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(article.image);
                }

                await deleteArticle(article.id);
                showAlert.success('Berhasil', 'Berita telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus berita: ' + error.message);
            }
        }
    };

    const handleRemovePhoto = async () => {
        if (!formData.image) return;

        const result = await showAlert.confirm('Hapus Foto', 'Hapus foto berita ini?', 'Ya, Hapus', 'Batal', 'warning');
        if (!result.isConfirmed) return;

        try {
            const { deleteFileFromStorage } = await import('../../../utils/storage');
            await deleteFileFromStorage(formData.image);

            setFormData(prev => ({ ...prev, image: '' }));

            if (editingArticle) {
                await updateArticle(editingArticle.id, { ...formData, image: '' });
                showAlert.success('Berhasil', 'Foto telah dihapus.');
            } else {
                showAlert.success('Berhasil', 'Foto telah dihapus dari form.');
            }
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menghapus foto: ' + error.message);
        }
    };

    const togglePublish = (article: NewsArticle) => {
        updateArticle(article.id, { published: !article.published });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            author: user?.name || '',
            category: 'Kegiatan Rohani',
            image: '',
            images: [],
            excerpt: '',
            content: '',
            published: false,
        });
        setImageFiles([]);
        setEditingArticle(null);
        setShowModal(false);
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
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Manajemen Berita</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Kelola berita dan artikel sekolah</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-slate-900 text-white px-4 lg:px-6 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 font-bold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Berita</span>
                            <span className="sm:hidden text-xs">Tambah</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 overflow-auto">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari berita..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Articles Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Berita
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredArticles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{article.title}</p>
                                                        <p className="text-sm text-gray-500">{article.author}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    {article.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{article.date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{article.views}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => togglePublish(article)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${article.published
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {article.published ? (
                                                        <>
                                                            <Eye className="w-3 h-3" />
                                                            Published
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3 h-3" />
                                                            Draft
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(article)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {user?.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(article)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        {/* Sticky Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingArticle ? 'Edit Berita' : 'Tambah Berita Baru'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Informasi Dasar */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasi Dasar</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Judul Berita *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Masukkan judul berita"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kategori *
                                            </label>
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Penulis *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.author}
                                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nama penulis"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Gambar Berita */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Gambar Berita</h3>

                                    {/* Multiple Images Preview */}
                                    {(formData.images.length > 0 || imageFiles.length > 0) && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Existing Images */}
                                            {formData.images.map((img, idx) => (
                                                <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                                                    <img src={img} alt="Existing" className="w-full h-full object-cover" />
                                                    <div className="absolute top-2 left-2 bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Lama</div>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const result = await showAlert.confirm('Hapus Foto', 'Hapus foto ini dari galeri berita?');
                                                            if (result.isConfirmed) {
                                                                const { deleteFileFromStorage } = await import('../../../utils/storage');
                                                                await deleteFileFromStorage(img);
                                                                const newImages = formData.images.filter((_, i) => i !== idx);
                                                                setFormData(prev => ({ ...prev, images: newImages }));
                                                                if (editingArticle) {
                                                                    await updateArticle(editingArticle.id, { ...formData, images: newImages });
                                                                }
                                                                showAlert.success('Berhasil', 'Foto dihapus.');
                                                            }
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* New Files to Upload */}
                                            {imageFiles.map((file, idx) => (
                                                <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-green-300">
                                                    <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                                                    <div className="absolute top-2 left-2 bg-green-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Baru</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageFiles(prev => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-gray-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50 group">
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-12 h-12 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setImageFiles(prev => [...prev, ...files]);
                                                }}
                                                className="hidden"
                                                id="news-image-upload"
                                            />
                                            <label
                                                htmlFor="news-image-upload"
                                                className="inline-block cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold transition-all shadow-md active:scale-95"
                                            >
                                                📷 Pilih Foto ({imageFiles.length} terpilih)
                                            </label>
                                            <p className="text-xs text-gray-500 mt-3 font-semibold uppercase tracking-widest">
                                                Klik untuk menambah foto (PNG, JPG, Maks 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Konten Berita */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Konten Berita</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ringkasan *
                                        </label>
                                        <textarea
                                            required
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Ringkasan singkat berita (1-2 kalimat)"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.excerpt.length} karakter
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Konten Lengkap *
                                        </label>
                                        <textarea
                                            required
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            rows={8}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Tulis konten lengkap berita di sini..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.content.length} karakter
                                        </p>
                                    </div>
                                </div>

                                {/* Pengaturan Publikasi */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pengaturan Publikasi</h3>

                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <input
                                            type="checkbox"
                                            id="published"
                                            checked={formData.published}
                                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <label htmlFor="published" className="text-sm font-semibold text-gray-900 cursor-pointer">
                                                Publikasikan Berita
                                            </label>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {formData.published
                                                    ? '✓ Berita akan ditampilkan di halaman publik'
                                                    : 'Berita disimpan sebagai draft'}
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-200">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="w-5 h-5" />
                                        {editingArticle ? 'Simpan Perubahan' : 'Tambah Berita'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
