import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    BookOpen,
    Save,
    Menu,
    Calendar,
    Hash,
    Layers,
    FileText,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Image as ImageIcon,
    Upload,
    X,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

type AcademicType = 'kurikulum' | 'mapel' | 'kalender' | 'penilaian';

interface Section {
    id?: number;
    type: AcademicType;
    title: string;
    content: string;
}

export function AcademicManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<AcademicType>('kurikulum');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sectionData, setSectionData] = useState<Section>({
        type: 'kurikulum',
        title: '',
        content: '',
    });

    // Structured State for different tabs
    const [mapelItems, setMapelItems] = useState<{ name: string; image_url: string }[]>([]);
    const [kalenderItems, setKalenderItems] = useState<{ month: string; event: string; description: string }[]>([]);
    const [penilaianData, setPenilaianData] = useState({
        description: '',
        percentages: { harian: '30', uts: '35', uas: '35' },
        aspects: [{ label: '', description: '', icon: 'FileText' }]
    });

    const tabs = [
        { id: 'kurikulum', label: 'Kurikulum Deep Learning', icon: Layers },
        { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen },
        { id: 'kalender', label: 'Kalender Akademik', icon: Calendar },
        { id: 'penilaian', label: 'Sistem Penilaian', icon: FileText },
    ];

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchSection(activeTab);
        }
    }, [user, navigate, activeTab]);

    const [uploadingItem, setUploadingItem] = useState<number | null>(null);

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `academic/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const fetchSection = async (type: AcademicType) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('academic_sections')
                .select('*')
                .eq('type', type)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setSectionData(data);
                // Parse structured content if it's JSON
                try {
                    const parsed = JSON.parse(data.content);
                    if (type === 'mapel' && Array.isArray(parsed)) {
                        // Migration: if items are strings, convert to objects
                        const formatted = parsed.map((item: any) =>
                            typeof item === 'string' ? { name: item, image_url: '' } : item
                        );
                        setMapelItems(formatted);
                    }
                    if (type === 'kalender' && Array.isArray(parsed)) setKalenderItems(parsed);
                    if (type === 'penilaian') setPenilaianData(parsed);
                } catch (e) {
                    // Fallback for non-JSON content
                    console.log('Legacy or plain text content found');
                }
            } else {
                setSectionData({
                    type: type,
                    title: tabs.find(t => t.id === type)?.label || '',
                    content: '',
                });
                // Reset structured states
                setMapelItems([]);
                setKalenderItems([]);
                setPenilaianData({
                    description: '',
                    percentages: { harian: '30', uts: '35', uas: '35' },
                    aspects: [{ label: '', description: '', icon: 'FileText' }]
                });
            }
        } catch (error: any) {
            console.error('Error fetching section:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const result = await showAlert.confirm('Simpan Perubahan', 'Simpan perubahan data akademik ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setSaving(true);
            let finalContent = sectionData.content;

            // Use structured data based on tab
            if (activeTab === 'mapel') finalContent = JSON.stringify(mapelItems);
            if (activeTab === 'kalender') finalContent = JSON.stringify(kalenderItems);
            if (activeTab === 'penilaian') finalContent = JSON.stringify(penilaianData);

            const { error } = await supabase
                .from('academic_sections')
                .upsert({
                    ...sectionData,
                    content: finalContent,
                    last_updated_by: user?.name || user?.username,
                }, { onConflict: 'type' });

            if (error) throw error;
            showAlert.success('Berhasil', 'Perubahan akademik berhasil disimpan!');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex text-slate-900">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Manajemen Akademik</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kelola Kurikulum & Program Sekolah</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="max-w-6xl mx-auto p-8">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as AcademicType)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Editor Area */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden mb-20">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                        {(() => {
                                            const Icon = tabs.find(t => t.id === activeTab)?.icon || AlertCircle;
                                            return <Icon className="w-6 h-6 text-blue-600" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 leading-none">{tabs.find(t => t.id === activeTab)?.label}</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Editor Informasi Akademik</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Perubahan
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Judul Konten</label>
                                    <input
                                        type="text"
                                        value={sectionData.title}
                                        onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                                        placeholder="Masukkan judul..."
                                    />
                                </div>

                                {activeTab === 'kurikulum' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Deskripsi Kurikulum (HTML)</label>
                                        <textarea
                                            value={sectionData.content}
                                            onChange={(e) => setSectionData({ ...sectionData, content: e.target.value })}
                                            rows={12}
                                            className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed font-mono text-sm"
                                            placeholder="Gunakan teks biasa atau tag HTML..."
                                        />
                                    </div>
                                )}

                                {activeTab === 'mapel' && (
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Daftar Mata Pelajaran</label>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {mapelItems.map((item, idx) => (
                                                <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-3 relative group border border-transparent hover:border-blue-100 transition-all">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase px-1">Nama Mata Pelajaran</label>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <input
                                                                    type="text"
                                                                    value={item.name}
                                                                    onChange={(e) => {
                                                                        const newItems = [...mapelItems];
                                                                        newItems[idx].name = e.target.value;
                                                                        setMapelItems(newItems);
                                                                    }}
                                                                    className="flex-1 bg-white border-none font-bold text-sm px-4 py-2 rounded-xl"
                                                                    placeholder="Nama Mapel..."
                                                                />
                                                                <button onClick={() => setMapelItems(mapelItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-2 bg-white rounded-xl shadow-sm h-10 w-10 flex items-center justify-center">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase px-1">Foto Mata Pelajaran</label>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden relative group/img shadow-sm">
                                                                {item.image_url ? (
                                                                    <>
                                                                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                                        <button
                                                                            onClick={() => {
                                                                                const newItems = [...mapelItems];
                                                                                newItems[idx].image_url = '';
                                                                                setMapelItems(newItems);
                                                                            }}
                                                                            className="absolute inset-0 bg-red-500/80 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                                        >
                                                                            <X className="w-5 h-5" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-center">
                                                                        {uploadingItem === idx ? (
                                                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                                                        ) : (
                                                                            <ImageIcon className="w-5 h-5 text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            try {
                                                                                setUploadingItem(idx);
                                                                                const url = await uploadImage(file);
                                                                                const newItems = [...mapelItems];
                                                                                newItems[idx].image_url = url;
                                                                                setMapelItems(newItems);
                                                                            } catch (err: any) {
                                                                                showAlert.error('Gagal', 'Gagal upload: ' + err.message);
                                                                            } finally {
                                                                                setUploadingItem(null);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                    id={`file-mapel-${idx}`}
                                                                />
                                                                <label
                                                                    htmlFor={`file-mapel-${idx}`}
                                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 cursor-pointer transition-all shadow-sm"
                                                                >
                                                                    <Upload className="w-3 h-3 text-blue-500" />
                                                                    {item.image_url ? 'Ganti Foto' : 'Pilih Foto'}
                                                                </label>
                                                                <p className="text-[8px] text-slate-400 mt-1 font-bold italic px-1">Format: JPG, PNG, WEBP (Maks 2MB)</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setMapelItems([...mapelItems, { name: '', image_url: '' }])}
                                                className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all font-black uppercase tracking-widest text-[10px]"
                                            >
                                                <Plus className="w-6 h-6 mb-1" /> Tambah Mata Pelajaran
                                            </button>
                                        </div>
                                    </div>
                                )}


                                {activeTab === 'kalender' && (
                                    <div className="space-y-6">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Item Kalender Akademik</label>
                                        <div className="space-y-4">
                                            {kalenderItems.map((item, idx) => (
                                                <div key={idx} className="bg-slate-50 p-6 rounded-3xl grid md:grid-cols-4 gap-4 items-end relative group">
                                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                                        <button onClick={() => setKalenderItems(kalenderItems.filter((_, i) => i !== idx))} className="bg-red-500 text-white p-2 rounded-xl shadow-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">Bulan/Waktu</label>
                                                        <input
                                                            type="text"
                                                            value={item.month}
                                                            onChange={(e) => {
                                                                const newItems = [...kalenderItems];
                                                                newItems[idx].month = e.target.value;
                                                                setKalenderItems(newItems);
                                                            }}
                                                            className="w-full bg-white border-none rounded-xl mt-1 py-3 px-4 font-bold text-xs"
                                                            placeholder="Juli 2025"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">Kegiatan</label>
                                                        <input
                                                            type="text"
                                                            value={item.event}
                                                            onChange={(e) => {
                                                                const newItems = [...kalenderItems];
                                                                newItems[idx].event = e.target.value;
                                                                setKalenderItems(newItems);
                                                            }}
                                                            className="w-full bg-white border-none rounded-xl mt-1 py-3 px-4 font-bold text-xs"
                                                            placeholder="Awal Semester"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">Keterangan Singkat</label>
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => {
                                                                const newItems = [...kalenderItems];
                                                                newItems[idx].description = e.target.value;
                                                                setKalenderItems(newItems);
                                                            }}
                                                            className="w-full bg-white border-none rounded-xl mt-1 py-3 px-4 font-medium text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setKalenderItems([...kalenderItems, { month: '', event: '', description: '' }])}
                                                className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-amber-400 hover:text-amber-600 transition-all font-bold text-xs flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Tambah Agenda Kalender
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'penilaian' && (
                                    <div className="space-y-10">
                                        <div className="grid md:grid-cols-4 gap-6">
                                            <div className="md:col-span-4">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Deskripsi Ringkas</label>
                                                <input
                                                    type="text"
                                                    value={penilaianData.description}
                                                    onChange={(e) => setPenilaianData({ ...penilaianData, description: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                                    placeholder="Deskripsi awal tentang sistem penilaian..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase">Harian (%)</label>
                                                <input
                                                    type="number"
                                                    value={penilaianData.percentages.harian}
                                                    onChange={(e) => setPenilaianData({ ...penilaianData, percentages: { ...penilaianData.percentages, harian: e.target.value } })}
                                                    className="w-full bg-slate-50 border-none rounded-xl mt-1 py-3 px-4 font-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase">UTS (%)</label>
                                                <input
                                                    type="number"
                                                    value={penilaianData.percentages.uts}
                                                    onChange={(e) => setPenilaianData({ ...penilaianData, percentages: { ...penilaianData.percentages, uts: e.target.value } })}
                                                    className="w-full bg-slate-50 border-none rounded-xl mt-1 py-3 px-4 font-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase">UAS (%)</label>
                                                <input
                                                    type="number"
                                                    value={penilaianData.percentages.uas}
                                                    onChange={(e) => setPenilaianData({ ...penilaianData, percentages: { ...penilaianData.percentages, uas: e.target.value } })}
                                                    className="w-full bg-slate-50 border-none rounded-xl mt-1 py-3 px-4 font-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Aspek Penilaian</label>
                                            {penilaianData.aspects.map((aspect, idx) => (
                                                <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-transparent hover:border-blue-100 transition-all flex flex-col md:flex-row gap-6 relative">
                                                    <button onClick={() => {
                                                        const newAspects = penilaianData.aspects.filter((_, i) => i !== idx);
                                                        setPenilaianData({ ...penilaianData, aspects: newAspects });
                                                    }} className="absolute top-4 right-4 text-red-400">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <div className="w-full md:w-1/4">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">Icon</label>
                                                        <input
                                                            type="text"
                                                            value={aspect.icon}
                                                            onChange={(e) => {
                                                                const newAspects = [...penilaianData.aspects];
                                                                newAspects[idx].icon = e.target.value;
                                                                setPenilaianData({ ...penilaianData, aspects: newAspects });
                                                            }}
                                                            className="w-full bg-white border-none rounded-xl mt-1 py-3 px-4 font-bold text-xs"
                                                            placeholder="Clock, FileText, etc."
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-1/4">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">Label Aspek</label>
                                                        <input
                                                            type="text"
                                                            value={aspect.label}
                                                            onChange={(e) => {
                                                                const newAspects = [...penilaianData.aspects];
                                                                newAspects[idx].label = e.target.value;
                                                                setPenilaianData({ ...penilaianData, aspects: newAspects });
                                                            }}
                                                            className="w-full bg-white border-none rounded-xl mt-1 py-3 px-4 font-bold text-xs"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-1/2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">Penjelasan</label>
                                                        <input
                                                            type="text"
                                                            value={aspect.description}
                                                            onChange={(e) => {
                                                                const newAspects = [...penilaianData.aspects];
                                                                newAspects[idx].description = e.target.value;
                                                                setPenilaianData({ ...penilaianData, aspects: newAspects });
                                                            }}
                                                            className="w-full bg-white border-none rounded-xl mt-1 py-3 px-4 font-medium text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setPenilaianData({ ...penilaianData, aspects: [...penilaianData.aspects, { label: '', description: '', icon: 'FileText' }] })}
                                                className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all font-bold text-xs"
                                            >
                                                + Tambah Aspek Penilaian
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                    <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight leading-normal mb-1">
                                            Status: {saving ? 'Sedang menyimpan...' : 'Siap disimpan'}
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight leading-normal">
                                            Data ini akan langsung diperbarui di halaman Akademik website utama setelah Anda menekan tombol simpan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
