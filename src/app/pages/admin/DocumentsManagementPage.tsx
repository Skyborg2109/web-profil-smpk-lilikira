import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useDocuments, Document } from '../../contexts/DocumentContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    FileText,
    Plus,
    Trash2,
    Search,
    X,
    Menu,
    Download,
    Upload,
    File,
    FolderOpen,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function DocumentsManagementPage() {
    const { user, logout } = useAuth();
    const { documents, addDocument, deleteDocument } = useDocuments();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Kurikulum',
    });
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const filteredItems = documents.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ title: '', category: 'Kurikulum' });
        setFile(null);
        setShowModal(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            showAlert.error('Gagal', 'Pilih file terlebih dahulu');
            return;
        }

        const result = await showAlert.confirm('Upload Dokumen', 'Apakah Anda yakin ingin mengupload dokumen ini?', 'Ya, Upload', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `documents/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            // 3. Save to DB
            await addDocument({
                title: formData.title,
                category: formData.category,
                file_url: publicUrl,
                file_size: (file.size / 1024).toFixed(2) + ' KB',
                file_type: fileExt?.toUpperCase() || 'FILE',
            });

            showAlert.success('Berhasil', 'File berhasil diupload.');
            resetForm();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item: Document) => {
        const result = await showAlert.confirm('Hapus File', `Hapus file "${item.title}"?`);
        if (result.isConfirmed) {
            try {
                await deleteDocument(item.id, item.file_url);
                showAlert.success('Berhasil', 'File telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus file: ' + error.message);
            }
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
                                <FolderOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Pusat Download</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Kelola File & Dokumen Sekolah</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-slate-900 text-white px-4 lg:px-6 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg font-bold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Upload Dokumen
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari judul atau kategori dokumen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Dokumen</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Format</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <File className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none mb-1">{item.title}</p>
                                                    <p className="text-[10px] text-gray-400">{item.file_size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-xs text-blue-600">{item.file_type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredItems.length === 0 && (
                            <div className="text-center py-20">
                                <FileText className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400">Belum ada dokumen yang diupload</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload Dokumen</h2>
                                <p className="text-sm text-gray-500 mt-1">Tambahkan file baru ke pusat download</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Judul Dokumen</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    placeholder="Nama berkas..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-white"
                                >
                                    <option value="Kurikulum">Kurikulum</option>
                                    <option value="Kesiswaan">Kesiswaan</option>
                                    <option value="Kepegawaian">Kepegawaian</option>
                                    <option value="Administrasi">Administrasi</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div className="relative group">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Pilih Berkas</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center group-hover:border-blue-400 transition-all cursor-pointer bg-gray-50/50">
                                    <Upload className="w-10 h-10 text-gray-300 group-hover:text-blue-500 mb-3 transition-colors" />
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <p className="text-sm font-bold text-gray-500">
                                        {file ? file.name : 'Klik atau seret file ke sini'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">PDF, DOCX, XLSX (Max 10MB)</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Mengunggah...
                                        </>
                                    ) : (
                                        'Upload Sekarang'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
