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
    FileText,
    GripVertical,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import { LoadingScreen } from '../../components/LoadingScreen';

interface RulesData {
    rules: string[];
    sanctions: string[];
}

export function RulesManagementPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [rulesData, setRulesData] = useState<RulesData>({
        rules: [],
        sanctions: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchRules();
        }
    }, [user, navigate]);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('academic_sections')
                .select('*')
                .eq('type', 'rules')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                try {
                    const parsed = JSON.parse(data.content);
                    setRulesData({
                        rules: parsed.rules || [],
                        sanctions: parsed.sanctions || []
                    });
                } catch (e) {
                    console.error('Failed to parse rules data');
                }
            }
        } catch (error: any) {
            console.error('Error fetching rules:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const result = await showAlert.confirm('Simpan Data', 'Simpan data tata tertib ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('academic_sections')
                .upsert({
                    type: 'rules',
                    title: 'Tata Tertib Sekolah',
                    content: JSON.stringify(rulesData),
                    last_updated_by: user?.name || user?.username,
                }, { onConflict: 'type' });

            if (error) throw error;
            showAlert.success('Berhasil', 'Data Tata Tertib & Sanksi berhasil disimpan!');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const addItem = (type: 'rules' | 'sanctions') => {
        setRulesData(prev => ({ ...prev, [type]: [...prev[type], ''] }));
    };

    const removeItem = async (type: 'rules' | 'sanctions', idx: number) => {
        const result = await showAlert.confirm('Hapus Data', 'Hapus butir ini?');
        if (result.isConfirmed) {
            setRulesData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));
            showAlert.success('Berhasil', 'Hapus butir dari daftar (klik simpan untuk mempermanenkan).');
        }
    };

    const updateItem = (type: 'rules' | 'sanctions', idx: number, value: string) => {
        const newData = [...rulesData[type]];
        newData[idx] = value;
        setRulesData({ ...rulesData, [type]: newData });
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
                    <LoadingScreen message="Memuat Tata Tertib..." fullScreen={false} />
                ) : (
                    <>
                        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                        <Menu className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Manajemen Tata Tertib & Sanksi</h1>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kelola Aturan & Kedisiplinan Siswa</p>
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
                            <div className="max-w-4xl mx-auto space-y-12">
                                {/* Tata Tertib */}
                                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Butir-Butir Tata Tertib</h2>
                                        <button
                                            onClick={() => addItem('rules')}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                        >
                                            <Plus className="w-4 h-4" /> Tambah Butir
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {rulesData.rules.map((rule, idx) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="flex-1 relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={rule}
                                                        onChange={(e) => updateItem('rules', idx, e.target.value)}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                                                        placeholder="Masukkan aturan sekolah..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeItem('rules', idx)}
                                                    className="p-4 text-red-400 hover:text-red-600 bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sanksi */}
                                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ketentuan Sanksi</h2>
                                        <button
                                            onClick={() => addItem('sanctions')}
                                            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                                        >
                                            <Plus className="w-4 h-4" /> Tambah Sanksi
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {rulesData.sanctions.map((sanksi, idx) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="flex-1 relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                        <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={sanksi}
                                                        onChange={(e) => updateItem('sanctions', idx, e.target.value)}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 font-medium"
                                                        placeholder="Masukkan ketentuan sanksi..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeItem('sanctions', idx)}
                                                    className="p-4 text-red-400 hover:text-red-600 bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
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
