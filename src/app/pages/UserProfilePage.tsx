import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import {
    User as UserIcon,
    Mail,
    Shield,
    LogOut,
    Clock,
    ChevronRight,
    Camera,
    Calendar,
    Phone,
    MapPin,
    GraduationCap,
    Edit3,
    X,
    Loader2
} from 'lucide-react';
import { showAlert } from '../../utils/sweetalert';
import { supabase } from '../../lib/supabase';

export function UserProfilePage() {
    const { user, logout, updateProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
        if (user) {
            setFormData({
                name: user.name,
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user, authLoading, navigate]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile(formData);
            setIsEditing(false);
            showAlert.success('Berhasil', 'Profil Anda telah diperbarui.');
        } catch (error: any) {
            showAlert.error('Gagal', 'Terjadi kesalahan saat memperbarui profil: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi tipe file
        if (!file.type.startsWith('image/')) {
            showAlert.error('Error', 'Silakan pilih file gambar.');
            return;
        }

        setUploadingPhoto(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            await updateProfile({ avatar_url: data.publicUrl });
            showAlert.success('Berhasil', 'Foto profil telah diperbarui.');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal mengunggah foto: ' + error.message);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleLogout = async () => {
        const result = await showAlert.confirm(
            'Konfirmasi Logout',
            'Apakah Anda yakin ingin keluar?',
            'Ya, Keluar',
            'Batal',
            'question'
        );

        if (result.isConfirmed) {
            await logout();
            navigate('/');
            showAlert.success('Berhasil', 'Anda telah keluar.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
                {/* Hero Profile Section */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden mb-8 border border-slate-100 relative">
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
                    </div>

                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-6">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-2xl overflow-hidden">
                                    <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 relative group-hover:bg-slate-200 transition-colors">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <UserIcon className="w-16 h-16 md:w-20 md:h-20" />
                                        )}

                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            {uploadingPhoto ? (
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-white" />
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                                        </label>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                                    <Shield className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-2">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{user.name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-widest">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        {user.role}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-widest">
                                        <GraduationCap className="w-4 h-4 text-amber-500" />
                                        Siswa @ SMPK Renya Rosari
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${isEditing ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                    {isEditing ? 'Batal' : 'Edit Profil'}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Email Utama</p>
                                    <p className="font-bold text-slate-700">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Terakhir Login</p>
                                    <p className="font-bold text-slate-700">Hari ini, 10:45</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Tahun Masuk</p>
                                    <p className="font-bold text-slate-700">2025/2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info - Detail Pribadi */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-6 bg-amber-400 rounded-full" />
                                Detail Pribadi
                            </h3>

                            {isEditing ? (
                                <form onSubmit={handleSave} className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">No. Telepon</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                                            placeholder="Contoh: 0812..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Alamat Lengkap</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700 outline-none min-h-[100px]"
                                            placeholder="Alamat domisili..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                        Simpan Perubahan
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Phone className="w-5 h-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">No. Telepon</p>
                                            <p className="font-bold text-slate-700">{user.phone || 'Belum diisi'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Alamat</p>
                                            <p className="font-bold text-slate-700">{user.address || 'Belum diisi'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <GraduationCap className="w-5 h-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sekolah</p>
                                            <p className="font-bold text-slate-700">SMP Katolik Renya Rosari</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Activity Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-2 h-6 bg-blue-600 rounded-full" />
                                    Aktivitas Terbaru
                                </h3>
                                <button className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                                    Lihat Semua
                                </button>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { title: 'Mengakses Materi Pembelajaran', desc: 'Matematika - Aljabar Dasar', time: '2 jam yang lalu', icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
                                    { title: 'Memperbarui Profil', desc: 'Informasi biodata berhasil disimpan', time: 'Baru saja', icon: Edit3, color: 'bg-green-50 text-green-600' },
                                    { title: 'Update Foto Profil', desc: 'Perubahan foto profil berhasil', time: '1 hari yang lalu', icon: Camera, color: 'bg-amber-50 text-amber-600' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all group">
                                        <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-800 text-sm mb-0.5">{item.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium truncate">{item.desc}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.time}</p>
                                            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
