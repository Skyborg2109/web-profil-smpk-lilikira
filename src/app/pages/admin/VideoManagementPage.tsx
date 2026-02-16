import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useVideos, VideoItem } from '../../contexts/VideoContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    Video,
    Trash2,
    Edit,
    Plus,
    Search,
    X,
    Menu,
    Youtube,
    Link as LinkIcon
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function VideoManagementPage() {
    const { user, logout } = useAuth();
    const { videos, addVideo, updateVideo, deleteVideo } = useVideos();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
    const [newVideo, setNewVideo] = useState({
        title: '',
        description: '',
        video_url: '',
    });
    const [editVideoData, setEditVideoData] = useState({
        title: '',
        description: '',
        video_url: '',
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

    const filteredVideos = videos.filter((v) =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleAdd = async () => {
        if (newVideo.title && newVideo.video_url) {
            const youtubeId = getYoutubeId(newVideo.video_url);
            if (!youtubeId) {
                showAlert.error('Error', 'Link YouTube tidak valid. Mohon periksa kembali.');
                return;
            }

            const result = await showAlert.confirm('Tambah Video', 'Apakah Anda yakin ingin menambahkan video ini?', 'Ya, Tambah', 'Batal', 'question');
            if (!result.isConfirmed) return;

            try {
                await addVideo({
                    title: newVideo.title,
                    description: newVideo.description,
                    video_url: newVideo.video_url,
                    thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                });
                showAlert.success('Berhasil', 'Video telah berhasil ditambahkan.');
                setShowAddModal(false);
                setNewVideo({ title: '', description: '', video_url: '' });
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menambahkan video: ' + error.message);
            }
        }
    };

    const handleEdit = (video: VideoItem) => {
        setEditingVideo(video);
        setEditVideoData({
            title: video.title,
            description: video.description,
            video_url: video.video_url,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (editingVideo && editVideoData.title && editVideoData.video_url) {
            const youtubeId = getYoutubeId(editVideoData.video_url);
            if (!youtubeId) {
                showAlert.error('Error', 'Link YouTube tidak valid.');
                return;
            }

            const result = await showAlert.confirm('Simpan Perubahan', 'Simpan perubahan video ini?', 'Ya, Simpan', 'Batal', 'question');
            if (!result.isConfirmed) return;

            try {
                await updateVideo(editingVideo.id, {
                    title: editVideoData.title,
                    description: editVideoData.description,
                    video_url: editVideoData.video_url,
                    thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                });
                showAlert.success('Berhasil', 'Video telah berhasil diperbarui.');
                setShowEditModal(false);
                setEditingVideo(null);
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal memperbarui video: ' + error.message);
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await showAlert.confirm('Hapus Video', 'Apakah Anda yakin ingin menghapus video ini?');
        if (result.isConfirmed) {
            try {
                await deleteVideo(id);
                showAlert.success('Berhasil', 'Video telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus video: ' + error.message);
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
                                className="p-2 bg-amber-50 rounded-xl lg:hidden hover:bg-amber-100 transition-colors"
                            >
                                <Menu className="w-6 h-6 text-amber-600" />
                            </button>
                            <div className="p-2 bg-amber-50 rounded-lg hidden lg:block">
                                <Video className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Kelola Dokumentasi Video</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Manajemen link video YouTube sekolah</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-slate-900 text-white px-4 lg:px-6 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 font-bold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Video</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari judul video..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((v) => (
                            <div key={v.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow">
                                <div className="relative h-48 bg-slate-900">
                                    <img
                                        src={v.thumbnail_url || `https://img.youtube.com/vi/${getYoutubeId(v.video_url)}/mqdefault.jpg`}
                                        alt={v.title}
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="p-3 bg-red-600 rounded-full shadow-xl">
                                            <Youtube className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(v)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{v.title}</h3>
                                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{v.description || 'Tidak ada deskripsi'}</p>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3" />
                                            YouTube Link
                                        </span>
                                        <span>{new Date(v.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredVideos.length === 0 && (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <Video className="w-10 h-10" />
                            </div>
                            <p className="text-slate-400 font-bold">Belum ada video dokumentasi ditemukan</p>
                            <p className="text-slate-300 text-sm">Tambahkan video baru untuk menampilkannya di halaman Galeri</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
                            <h2 className="text-xl font-black tracking-tight">Tambah Video Baru</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Judul Video</label>
                                <input
                                    type="text"
                                    value={newVideo.title}
                                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                    placeholder="Contoh: Profil Sekolah 2026"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Link YouTube</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Youtube className="w-5 h-5 text-red-600" />
                                    </div>
                                    <input
                                        type="text"
                                        value={newVideo.video_url}
                                        onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic px-1">Masukkan URL lengkap video dari YouTube</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deskripsi (Opsional)</label>
                                <textarea
                                    value={newVideo.description}
                                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
                                    placeholder="Keterangan singkat mengenai video ini..."
                                />
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors">Batal</button>
                            <button onClick={handleAdd} className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold transition-all shadow-lg shadow-amber-200">Simpan Video</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
                            <h2 className="text-xl font-black tracking-tight">Edit Video</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Judul Video</label>
                                <input
                                    type="text"
                                    value={editVideoData.title}
                                    onChange={(e) => setEditVideoData({ ...editVideoData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Link YouTube</label>
                                <input
                                    type="text"
                                    value={editVideoData.video_url}
                                    onChange={(e) => setEditVideoData({ ...editVideoData, video_url: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deskripsi</label>
                                <textarea
                                    value={editVideoData.description}
                                    onChange={(e) => setEditVideoData({ ...editVideoData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors">Batal</button>
                            <button onClick={handleUpdate} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200">Update Video</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
