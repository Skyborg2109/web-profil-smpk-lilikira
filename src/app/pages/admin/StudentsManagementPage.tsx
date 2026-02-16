import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useStudents, Student } from '../../contexts/StudentContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    Users,
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    Filter,
    Menu,
    UserPlus,
    Phone,
    MapPin,
    Calendar,
    CheckCircle2,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function StudentsManagementPage() {
    const { user, logout } = useAuth();
    const { students, addStudent, updateStudent, deleteStudent } = useStudents();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at'>>({
        full_name: '',
        nisn: '',
        class_name: '',
        gender: 'Laki-laki',
        birth_place: '',
        birth_date: '',
        address: '',
        parent_name: '',
        phone: '',
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

    const filteredStudents = students.filter((s) => {
        const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nisn?.includes(searchQuery);
        const matchesClass = selectedClass === 'all' || s.class_name === selectedClass;
        return matchesSearch && matchesClass;
    });

    const classes = Array.from(new Set(students.map(s => s.class_name))).filter(Boolean);

    const resetForm = () => {
        setFormData({
            full_name: '',
            nisn: '',
            class_name: '',
            gender: 'Laki-laki',
            birth_place: '',
            birth_date: '',
            address: '',
            parent_name: '',
            phone: '',
        });
        setEditingStudent(null);
        setShowModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await showAlert.confirm('Simpan Data', 'Apakah Anda yakin ingin menyimpan data siswa ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            if (editingStudent) {
                await updateStudent(editingStudent.id, formData);
            } else {
                await addStudent(formData);
            }
            showAlert.success('Berhasil', 'Data siswa telah disimpan.');
            resetForm();
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan data: ' + error.message);
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            full_name: student.full_name,
            nisn: student.nisn || '',
            class_name: student.class_name || '',
            gender: student.gender || 'Laki-laki',
            birth_place: student.birth_place || '',
            birth_date: student.birth_date || '',
            address: student.address || '',
            parent_name: student.parent_name || '',
            phone: student.phone || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        const result = await showAlert.confirm('Hapus Data', 'Hapus data siswa ini?');
        if (result.isConfirmed) {
            try {
                await deleteStudent(id);
                showAlert.success('Berhasil', 'Data siswa telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus data: ' + error.message);
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

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Siswa</h1>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Total {students.length} Siswa Terdaftar</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 font-bold"
                        >
                            <UserPlus className="w-5 h-5" />
                            Tambah Siswa
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau NISN siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-gray-50 border-none px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-600"
                            >
                                <option value="all">Semua Kelas</option>
                                {classes.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Siswa</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">NISN</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kelas</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jenis Kelamin</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all font-black text-sm">
                                                        {item.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-none mb-1">{item.full_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                                                            <MapPin className="w-3 h-3" /> {item.birth_place}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{item.nisn || '-'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black uppercase">
                                                    Kelas {item.class_name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-xs font-bold ${item.gender === 'Laki-laki' ? 'text-blue-600' : 'text-pink-600'}`}>
                                                    {item.gender}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredStudents.length === 0 && (
                            <div className="p-20 text-center">
                                <Users className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Siswa tidak ditemukan</h3>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingStudent ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Lengkapi informasi dasar siswa</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-7 h-7 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Contoh: Michael Agung"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NISN</label>
                                    <input
                                        type="text"
                                        value={formData.nisn}
                                        onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Masukkan 10 digit NISN"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kelas</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.class_name}
                                        onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-center"
                                        placeholder="IX-A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                    >
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tgl Lahir</label>
                                    <input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempat Lahir</label>
                                    <input
                                        type="text"
                                        value={formData.birth_place}
                                        onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Contoh: Toraja Utara"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Orang Tua</label>
                                    <input
                                        type="text"
                                        value={formData.parent_name}
                                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Nama Ayah / Ibu"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No. HP Orang Tua / Siswa</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="08..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Tinggal</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                    placeholder="Alamat lengkap..."
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={resetForm} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Batal</button>
                                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:translate-y-[-2px] transition-all">
                                    {editingStudent ? 'Perbarui Data' : 'Simpan Siswa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
