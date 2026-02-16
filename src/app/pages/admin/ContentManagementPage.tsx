import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import {
    Save,
    Edit3,
    Menu,
    Settings,
    Plus,
    Trash2,
    X,
    Image as ImageIcon,
    Upload,
    Loader2,
    Camera
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function ContentManagementPage() {
    const { user, logout } = useAuth();
    const { contentSections, updateContent } = useContent();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string>('visi-misi');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const [facilityItems, setFacilityItems] = useState<any[]>([]);
    const [misiItems, setMisiItems] = useState<string[]>([]);

    useEffect(() => {
        let section = contentSections.find((s) => s.id === selectedSection);

        if (!section) {
            if (selectedSection === 'fasilitas') section = { id: 'fasilitas', title: 'Fasilitas Sekolah', content: '[]', last_updated: '' };
            else if (selectedSection === 'misi') section = { id: 'misi', title: 'Misi Sekolah', content: '[]', last_updated: '' };
            else if (selectedSection === 'sambutan') section = { id: 'sambutan', title: 'Sambutan Kepala Sekolah', content: '', last_updated: '' };
        }

        if (section) {
            if (selectedSection === 'fasilitas') {
                try {
                    const parsed = JSON.parse(section.content);
                    const normalized = (Array.isArray(parsed) ? parsed : []).map((item: any) => ({
                        ...item,
                        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : [])
                    }));
                    setFacilityItems(normalized);
                } catch {
                    setFacilityItems([]);
                }
            } else if (selectedSection === 'misi') {
                try {
                    const parsed = JSON.parse(section.content);
                    setMisiItems(Array.isArray(parsed) ? parsed : []);
                } catch {
                    setMisiItems(section.content ? section.content.split('\n').filter(Boolean) : []);
                }
            } else {
                setEditedContent(section.content || '');
            }
        }
    }, [selectedSection, contentSections]);

    const handleAddFacility = () => {
        setFacilityItems([...facilityItems, { name: '', images: [], description: '' }]);
    };

    const handleRemoveFacility = (index: number) => {
        const newItems = [...facilityItems];
        newItems.splice(index, 1);
        setFacilityItems(newItems);
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `facility-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `facilities/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('files')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('files')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            const currentImages = facilityItems[index].images || [];
            handleUpdateFacility(index, 'images', [...currentImages, ...uploadedUrls]);
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal upload foto: ' + error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleUpdateFacility = (index: number, field: string, value: any) => {
        const newItems = [...facilityItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setFacilityItems(newItems);
    };

    const handleSave = async () => {
        const result = await showAlert.confirm('Simpan Perubahan', 'Apakah Anda yakin ingin menyimpan perubahan ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            setSaving(true);
            let contentToSave;

            if (selectedSection === 'fasilitas') {
                contentToSave = JSON.stringify(facilityItems);
            } else if (selectedSection === 'misi') {
                contentToSave = JSON.stringify(misiItems);
            } else {
                contentToSave = editedContent;
            }

            const sectionTitle = selectedSection === 'fasilitas'
                ? 'Fasilitas Sekolah'
                : (selectedSection === 'misi'
                    ? 'Misi Sekolah'
                    : (selectedSection === 'sambutan'
                        ? 'Sambutan Kepala Sekolah'
                        : currentSection?.title));

            await updateContent(selectedSection, contentToSave, sectionTitle);
            showAlert.success('Berhasil', 'Perubahan telah disimpan.');
            setIsEditing(false);
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

    const currentSection = contentSections.find((s) => s.id === selectedSection) || {
        id: selectedSection,
        title: selectedSection === 'fasilitas' ? 'Fasilitas Sekolah'
            : selectedSection === 'misi' ? 'Misi Sekolah'
                : selectedSection === 'sambutan' ? 'Sambutan Kepala Sekolah'
                    : selectedSection === 'visi-misi' ? 'Visi Sekolah'
                        : '',
        content: '',
        last_updated: new Date().toISOString()
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
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Profil Sekolah</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Edit konten profil sekolah</p>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedContent(currentSection?.content || '');
                                    }}
                                    className="px-3 py-2 lg:px-6 lg:py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs lg:text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 lg:px-6 lg:py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg font-bold text-xs lg:text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Simpan
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 overflow-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Section List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-0">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Bagian Konten</h2>
                                <div className="space-y-2">
                                    {/* Merge fetched sections with default required sections if missing */}
                                    {(() => {
                                        const sections = [...contentSections];
                                        if (!sections.find(s => s.id === 'fasilitas')) {
                                            sections.push({
                                                id: 'fasilitas',
                                                title: 'Fasilitas Sekolah',
                                                content: '[]',
                                                last_updated: new Date().toISOString()
                                            });
                                        }
                                        if (!sections.find(s => s.id === 'misi')) {
                                            sections.push({
                                                id: 'misi',
                                                title: 'Misi Sekolah',
                                                content: '[]',
                                                last_updated: new Date().toISOString()
                                            });
                                        }
                                        if (!sections.find(s => s.id === 'sambutan')) {
                                            sections.push({
                                                id: 'sambutan',
                                                title: 'Sambutan Kepala Sekolah',
                                                content: '',
                                                last_updated: new Date().toISOString()
                                            });
                                        }
                                        // Rename 'visi-misi' to 'Visi Sekolah' for display clarity
                                        const processed = sections.map(s => {
                                            if (s.id === 'visi-misi') return { ...s, title: 'Visi Sekolah' };
                                            return s;
                                        });

                                        // Sort order
                                        const order = ['sambutan', 'visi-misi', 'misi', 'sejarah', 'fasilitas'];
                                        return processed.sort((a, b) => {
                                            const indexA = order.indexOf(a.id);
                                            const indexB = order.indexOf(b.id);
                                            if (indexA === -1 && indexB === -1) return 0;
                                            if (indexA === -1) return 1;
                                            if (indexB === -1) return -1;
                                            return indexA - indexB;
                                        });
                                    })().map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => {
                                                setSelectedSection(section.id);
                                                setIsEditing(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedSection === section.id
                                                ? 'bg-blue-100 text-blue-900 font-medium'
                                                : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <p className="font-medium">{section.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Update: {new Date(section.last_updated).toLocaleDateString('id-ID')}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {currentSection.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Terakhir diupdate: {currentSection.last_updated ? new Date(currentSection.last_updated).toLocaleDateString('id-ID') : '-'}
                                        </p>
                                    </div>
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                disabled={saving}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all font-medium disabled:opacity-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
                                            >
                                                {saving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {selectedSection === 'fasilitas' ? (
                                    <div className="space-y-6">
                                        {isEditing && (
                                            <button
                                                onClick={handleAddFacility}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                            >
                                                <Plus className="w-8 h-8 mb-2" />
                                                <span className="font-bold">Tambah Fasilitas Baru</span>
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {facilityItems.map((item, index) => (
                                                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative group">
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => handleRemoveFacility(index)}
                                                            className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                                                        {(item.images?.length > 0) || item.image ? (
                                                            <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <ImageIcon className="w-12 h-12" />
                                                            </div>
                                                        )}
                                                        {item.images?.length > 1 && (
                                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-bold">
                                                                +{item.images.length - 1} Foto
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isEditing ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Nama Fasilitas</label>
                                                                <input
                                                                    type="text"
                                                                    value={item.name}
                                                                    onChange={(e) => handleUpdateFacility(index, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm font-bold"
                                                                    placeholder="Perpustakaan..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Foto Fasilitas</label>
                                                                <div className="space-y-3">
                                                                    {item.images && item.images.length > 0 && (
                                                                        <div className="grid grid-cols-4 gap-2">
                                                                            {item.images.map((img: string, imgIdx: number) => (
                                                                                <div key={imgIdx} className="relative aspect-square group/img">
                                                                                    <img src={img} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                                                    <button
                                                                                        onClick={async () => {
                                                                                            const { deleteFileFromStorage } = await import('../../../utils/storage');
                                                                                            await deleteFileFromStorage(img);
                                                                                            const newImages = [...item.images];
                                                                                            newImages.splice(imgIdx, 1);
                                                                                            handleUpdateFacility(index, 'images', newImages);
                                                                                        }}
                                                                                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm cursor-pointer z-20"
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    <div className="relative">
                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            onChange={(e) => handleFileUpload(e, index)}
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            accept="image/*"
                                                                            disabled={uploading}
                                                                        />
                                                                        <div className={`bg-white border border-gray-200 text-gray-600 rounded-lg px-4 py-3 flex items-center justify-center gap-2 w-full transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-300'}`}>
                                                                            {uploading ? (
                                                                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                                                            ) : (
                                                                                <Camera className="w-5 h-5" />
                                                                            )}
                                                                            <span className="text-sm font-bold">
                                                                                {uploading ? 'Sedang Mengupload...' : 'Tambah Foto'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Deskripsi</label>
                                                                <textarea
                                                                    value={item.description}
                                                                    onChange={(e) => handleUpdateFacility(index, 'description', e.target.value)}
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                                    rows={3}
                                                                    placeholder="Deskripsi fasilitas..."
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-900 mb-2">{item.name || 'Nama Fasilitas'}</h3>
                                                            <p className="text-sm text-gray-600 leading-relaxed">{item.description || 'Tidak ada deskripsi.'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {facilityItems.length === 0 && !isEditing && (
                                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                                                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                                    <p className="font-medium">Belum ada data fasilitas.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : selectedSection === 'misi' ? (
                                    <div className="space-y-6">
                                        {isEditing && (
                                            <button
                                                onClick={() => setMisiItems([...misiItems, ''])}
                                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                <span className="font-bold">Tambah Poin Misi</span>
                                            </button>
                                        )}

                                        <div className="space-y-3">
                                            {misiItems.map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <div className="flex-none pt-3">
                                                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                            </div>
                                                            <textarea
                                                                value={item}
                                                                onChange={(e) => {
                                                                    const newItems = [...misiItems];
                                                                    newItems[index] = e.target.value;
                                                                    setMisiItems(newItems);
                                                                }}
                                                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                                                rows={2}
                                                                placeholder="Masukkan butir misi..."
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newItems = [...misiItems];
                                                                    newItems.splice(index, 1);
                                                                    setMisiItems(newItems);
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex gap-3 p-3 bg-gray-50 rounded-lg w-full border border-gray-100">
                                                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-none"></div>
                                                            <p className="text-gray-700">{item}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {misiItems.length === 0 && (
                                                <div className="text-center text-gray-400 py-8 italic">
                                                    Belum ada data misi.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    isEditing ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Konten
                                            </label>
                                            <textarea
                                                value={editedContent}
                                                onChange={(e) => setEditedContent(e.target.value)}
                                                rows={12}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                                placeholder="Masukkan konten..."
                                            />
                                            <p className="text-sm text-gray-500 mt-2">
                                                {editedContent.length} karakter
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="prose max-w-none">
                                            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                    {currentSection?.content}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Preview Section */}
                            {isEditing && selectedSection !== 'fasilitas' && (
                                <div className="mt-6 bg-white rounded-xl shadow-lg p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                        {selectedSection === 'misi' ? (
                                            <ul className="space-y-4">
                                                {misiItems.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-none"></div>
                                                        <span className="text-gray-700">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                {editedContent}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
