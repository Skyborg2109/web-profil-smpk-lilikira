import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    Users,
    Save,
    Menu,
    Loader2,
    Plus,
    Trash2,
    Upload,
    Camera,
    Image as ImageIcon,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import { LoadingScreen } from '../../components/LoadingScreen';

interface OsisMember {
    role: string;
    name: string;
    class: string;
    image?: string;
}

interface OsisData {
    description: string;
    vision: string;
    groupImage?: string;
    members: OsisMember[];
}

export function OsisManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const [osisData, setOsisData] = useState<OsisData>({
        description: '',
        vision: '',
        groupImage: '',
        members: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchOsis();
        }
    }, [user, navigate]);

    const fetchOsis = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('academic_sections')
                .select('*')
                .eq('type', 'osis')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                try {
                    const parsed = JSON.parse(data.content);
                    setOsisData(parsed);
                } catch (e) {
                    console.error('Failed to parse OSIS data');
                }
            }
        } catch (error: any) {
            console.error('Error fetching OSIS:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'group' | number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(type === 'group' ? 'group' : `member-${type}`);
            const url = await uploadImage(file, 'osis');

            if (type === 'group') {
                if (osisData.groupImage) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(osisData.groupImage);
                }
                setOsisData(prev => ({ ...prev, groupImage: url }));
            } else {
                if (osisData.members[type].image) {
                    const { deleteFileFromStorage } = await import('../../../utils/storage');
                    await deleteFileFromStorage(osisData.members[type].image!);
                }
                const newMembers = [...osisData.members];
                newMembers[type].image = url;
                setOsisData(prev => ({ ...prev, members: newMembers }));
            }
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleSave = async () => {
        const result = await showAlert.confirm('Simpan Data', 'Simpan data OSIS ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('academic_sections')
                .upsert({
                    type: 'osis',
                    title: 'OSIS (Organisasi Siswa Intra Sekolah)',
                    content: JSON.stringify(osisData),
                    last_updated_by: user?.name || user?.username,
                }, { onConflict: 'type' });

            if (error) throw error;
            showAlert.success('Berhasil', 'Data OSIS berhasil disimpan!');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMember = async (idx: number) => {
        const result = await showAlert.confirm('Hapus Pengurus', 'Hapus pengurus ini?');
        if (result.isConfirmed) {
            const member = osisData.members[idx];
            if (member.image) {
                const { deleteFileFromStorage } = await import('../../../utils/storage');
                await deleteFileFromStorage(member.image);
            }
            setOsisData({ ...osisData, members: osisData.members.filter((_, i) => i !== idx) });
            showAlert.success('Berhasil', 'Pengurus telah dihapus.');
        }
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
                    <LoadingScreen message="Menyiapkan Data OSIS..." fullScreen={false} />
                ) : (
                    <>
                        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                        <Menu className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Manajemen OSIS</h1>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Struktur & Program Kerja OSIS</p>
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

                        <main className="flex-1 overflow-auto">
                            <div className="max-w-6xl mx-auto p-8 space-y-8">
                                {/* Informasi Umum */}
                                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8 space-y-8">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Informasi Umum</h2>

                                    {/* Group Photo Upload */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Foto Bersama OSIS / Banner</label>
                                        <div className="grid md:grid-cols-2 gap-8 items-start">
                                            <div className="relative group">
                                                <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center">
                                                    {osisData.groupImage ? (
                                                        <img src={osisData.groupImage} alt="OSIS Group" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-6">
                                                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada foto</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-[2rem] backdrop-blur-sm">
                                                    <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                        {uploading === 'group' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                        Ganti Foto
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'group')} disabled={!!uploading} />
                                                </label>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Deskripsi OSIS</label>
                                                    <textarea
                                                        value={osisData.description}
                                                        onChange={(e) => setOsisData({ ...osisData, description: e.target.value })}
                                                        rows={4}
                                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                                                        placeholder="Masukkan deskripsi umum OSIS..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Visi OSIS</label>
                                                    <textarea
                                                        value={osisData.vision}
                                                        onChange={(e) => setOsisData({ ...osisData, vision: e.target.value })}
                                                        rows={3}
                                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                                                        placeholder="Masukkan visi OSIS..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pengurus OSIS */}
                                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Struktur Pengurus OSIS</h2>
                                        <button
                                            onClick={() => setOsisData({ ...osisData, members: [...osisData.members, { role: '', name: '', class: '', image: '' }] })}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all"
                                        >
                                            <Plus className="w-4 h-4" /> Tambah Pengurus
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {osisData.members.map((member, idx) => (
                                            <div key={idx} className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 relative group border border-transparent hover:border-blue-100 transition-all">
                                                <button
                                                    onClick={() => handleRemoveMember(idx)}
                                                    className="absolute top-4 right-4 z-10 text-red-400 hover:text-red-600 p-2 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="relative w-24 h-24 mx-auto mb-6">
                                                    <div className="w-full h-full bg-white rounded-[2rem] flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-10 h-10 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-2 border-white">
                                                        {uploading === `member-${idx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, idx)} disabled={!!uploading} />
                                                    </label>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase px-1">Jabatan</label>
                                                    <input
                                                        type="text"
                                                        value={member.role}
                                                        onChange={(e) => {
                                                            const newMembers = [...osisData.members];
                                                            newMembers[idx].role = e.target.value;
                                                            setOsisData({ ...osisData, members: newMembers });
                                                        }}
                                                        className="w-full bg-white border-none font-bold text-xs px-4 py-3 rounded-xl mt-1"
                                                        placeholder="Contoh: Ketua OSIS"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase px-1">Nama Lengkap</label>
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => {
                                                            const newMembers = [...osisData.members];
                                                            newMembers[idx].name = e.target.value;
                                                            setOsisData({ ...osisData, members: newMembers });
                                                        }}
                                                        className="w-full bg-white border-none font-black text-sm px-4 py-3 rounded-xl mt-1"
                                                        placeholder="Nama Siswa"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase px-1">Kelas</label>
                                                    <input
                                                        type="text"
                                                        value={member.class}
                                                        onChange={(e) => {
                                                            const newMembers = [...osisData.members];
                                                            newMembers[idx].class = e.target.value;
                                                            setOsisData({ ...osisData, members: newMembers });
                                                        }}
                                                        className="w-full bg-white border-none font-bold text-xs px-4 py-3 rounded-xl mt-1 text-center"
                                                        placeholder="IX-A"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {osisData.members.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p className="font-bold uppercase tracking-widest text-[10px]">Belum ada data pengurus</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}
