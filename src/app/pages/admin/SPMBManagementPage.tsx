import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useSPMB } from '../../contexts/SPMBContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
    FolderOpen,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Mail,
    Phone,
    Calendar,
    X,
    Menu,
    Trash2,
    Edit2,
    Plus,
} from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function SPMBManagementPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const { applications, schedules, requirements, updateApplicationStatus, addSchedule, updateSchedule, deleteSchedule, addRequirement, updateRequirement, deleteRequirement } = useSPMB();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<any>(null);

    // Schedule CRUD states
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<any>(null);
    const [scheduleForm, setScheduleForm] = useState({
        event_name: '',
        date_range: '',
        description: '',
        is_active: true
    });

    // Requirement CRUD states
    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
    const [editingRequirement, setEditingRequirement] = useState<any>(null);
    const [requirementForm, setRequirementForm] = useState({
        description: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await showAlert.confirm('Simpan Jadwal', 'Simpan data jadwal ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            if (editingSchedule) {
                await updateSchedule(editingSchedule.id, scheduleForm);
            } else {
                await addSchedule(scheduleForm);
            }
            setIsScheduleModalOpen(false);
            setEditingSchedule(null);
            setScheduleForm({ event_name: '', date_range: '', description: '', is_active: true });
            showAlert.success('Berhasil', 'Jadwal telah disimpan.');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan jadwal: ' + error.message);
        }
    };

    const handleDeleteSchedule = async (id: number) => {
        const result = await showAlert.confirm('Hapus Jadwal', 'Apakah Anda yakin ingin menghapus jadwal ini?');
        if (result.isConfirmed) {
            try {
                await deleteSchedule(id);
                showAlert.success('Berhasil', 'Jadwal telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus jadwal: ' + error.message);
            }
        }
    };

    const openEditSchedule = (schedule: any) => {
        setEditingSchedule(schedule);
        setScheduleForm({
            event_name: schedule.event_name,
            date_range: schedule.date_range,
            description: schedule.description,
            is_active: schedule.is_active
        });
        setIsScheduleModalOpen(true);
    };

    const handleSaveRequirement = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await showAlert.confirm('Simpan Syarat', 'Simpan data syarat pendaftaran ini?', 'Ya, Simpan', 'Batal', 'question');
        if (!result.isConfirmed) return;

        try {
            if (editingRequirement) {
                await updateRequirement(editingRequirement.id, requirementForm);
            } else {
                await addRequirement(requirementForm);
            }
            setIsRequirementModalOpen(false);
            setEditingRequirement(null);
            setRequirementForm({ description: '' });
            showAlert.success('Berhasil', 'Syarat pendaftaran telah disimpan.');
        } catch (error: any) {
            showAlert.error('Gagal', 'Gagal menyimpan syarat: ' + error.message);
        }
    };

    const handleDeleteRequirement = async (id: number) => {
        const result = await showAlert.confirm('Hapus Syarat', 'Apakah Anda yakin ingin menghapus syarat ini?');
        if (result.isConfirmed) {
            try {
                await deleteRequirement(id);
                showAlert.success('Berhasil', 'Syarat pendaftaran telah dihapus.');
            } catch (error: any) {
                showAlert.error('Gagal', 'Gagal menghapus syarat: ' + error.message);
            }
        }
    };

    const openEditRequirement = (req: any) => {
        setEditingRequirement(req);
        setRequirementForm({
            description: req.description
        });
        setIsRequirementModalOpen(true);
    };

    const filteredApplications = applications.filter((app) => {
        const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
        const matchesSearch =
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected') => {
        const title = newStatus === 'approved' ? 'Terima Siswa' : 'Tolak Berkas';
        const text = newStatus === 'approved'
            ? 'Apakah Anda yakin ingin menerima siswa ini?'
            : 'Apakah Anda yakin ingin menolak berkas siswa ini?';
        const confirmText = newStatus === 'approved' ? 'Ya, Terima' : 'Ya, Tolak';
        const icon = newStatus === 'approved' ? 'success' : 'warning';

        const result = await showAlert.confirm(title, text, confirmText, 'Batal', icon as any);

        if (result.isConfirmed) {
            try {
                await updateApplicationStatus(id, newStatus);
                setSelectedApplication(null);
                showAlert.success(
                    newStatus === 'approved' ? 'Pendaftaran Diterima' : 'Pendaftaran Ditolak',
                    newStatus === 'approved' ? 'Siswa telah berhasil diterima.' : 'Berkas siswa telah ditolak.'
                );
            } catch (error: any) {
                showAlert.error('Gagal', 'Terjadi kesalahan: ' + error.message);
            }
        }
    };

    const stats = {
        total: applications.length,
        pending: applications.filter((a) => a.status === 'pending').length,
        approved: applications.filter((a) => a.status === 'approved').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
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
                                <FolderOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Kelola SPMB</h1>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Manajemen pendaftaran siswa baru</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 overflow-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Pendaftar</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <FolderOpen className="w-12 h-12 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Menunggu</p>
                                    <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                                </div>
                                <Calendar className="w-12 h-12 text-amber-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Diterima</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Ditolak</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Jadwal SPMB Management */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Jadwal & Agenda SPMB</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingSchedule(null);
                                    setScheduleForm({ event_name: '', date_range: '', description: '', is_active: true });
                                    setIsScheduleModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Agenda
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-gray-900">{schedule.event_name}</h3>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => openEditSchedule(schedule)}
                                                className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm border border-blue-100 hover:bg-blue-50"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                                className="p-1.5 bg-white text-red-600 rounded-md shadow-sm border border-red-100 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-blue-600 font-bold mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {schedule.date_range}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{schedule.description}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {schedule.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Requirements Management */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-amber-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Syarat Pendaftaran</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingRequirement(null);
                                    setRequirementForm({ description: '' });
                                    setIsRequirementModalOpen(true);
                                }}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-200"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Syarat
                            </button>
                        </div>
                        <div className="space-y-3">
                            {requirements.map((req) => (
                                <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-700 font-medium">{req.description}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => openEditRequirement(req)}
                                            className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm border border-blue-100 hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRequirement(req.id)}
                                            className="p-1.5 bg-white text-red-600 rounded-md shadow-sm border border-red-100 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {requirements.length === 0 && (
                                <p className="text-center text-gray-500 italic py-4">Belum ada syarat pendaftaran</p>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="approved">Diterima</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Nama Siswa
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Kontak
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Sekolah Asal
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Tanggal Daftar
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {app.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{app.name}</p>
                                                        <p className="text-sm text-gray-500">{app.birth_date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        {app.email}
                                                    </p>
                                                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                                                        <Phone className="w-4 h-4" />
                                                        {app.phone}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {app.previous_school}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {app.submitted_date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : app.status === 'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {app.status === 'pending'
                                                        ? 'Menunggu'
                                                        : app.status === 'approved'
                                                            ? 'Diterima'
                                                            : 'Ditolak'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedApplication(app)}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {filteredApplications.length === 0 && (
                        <div className="text-center py-20">
                            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Tidak ada pendaftar ditemukan</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Detail Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pendaftar</h2>
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-8">
                                {/* Student Info */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        Informasi Siswa
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Nama Lengkap</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Tanggal Lahir</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.birth_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Email</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Telepon</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.phone}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Alamat</p>
                                            <p className="font-semibold text-gray-900 text-lg leading-relaxed">{selectedApplication.address}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Sekolah Asal</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.previous_school}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Parent Info */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-green-600" />
                                        Informasi Orang Tua
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Nama Orang Tua</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.parents_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Telepon Orang Tua</p>
                                            <p className="font-semibold text-gray-900 text-lg">{selectedApplication.parents_phone}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Documents */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                        <Download className="w-5 h-5 text-amber-600" />
                                        Dokumen Terkait
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {selectedApplication.documents?.photo ? (
                                            <a
                                                href={selectedApplication.documents.photo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                                            >
                                                <Download className="w-8 h-8 text-green-500 mb-2" />
                                                <span className="text-sm font-medium text-green-700">Foto Siswa</span>
                                            </a>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl opacity-50">
                                                <XCircle className="w-8 h-8 text-gray-300 mb-2" />
                                                <span className="text-sm font-medium text-gray-500">Tidak Ada Foto</span>
                                            </div>
                                        )}

                                        {selectedApplication.documents?.birth_certificate ? (
                                            <a
                                                href={selectedApplication.documents.birth_certificate}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                            >
                                                <Download className="w-8 h-8 text-blue-500 mb-2" />
                                                <span className="text-sm font-medium text-blue-700">Akta Lahir</span>
                                            </a>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl opacity-50">
                                                <XCircle className="w-8 h-8 text-gray-300 mb-2" />
                                                <span className="text-sm font-medium text-gray-500">Tidak Ada Akta</span>
                                            </div>
                                        )}

                                        {selectedApplication.documents?.report_card ? (
                                            <a
                                                href={selectedApplication.documents.report_card}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-amber-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
                                            >
                                                <Download className="w-8 h-8 text-amber-500 mb-2" />
                                                <span className="text-sm font-medium text-amber-700">Rapor / KK</span>
                                            </a>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl opacity-50">
                                                <XCircle className="w-8 h-8 text-gray-300 mb-2" />
                                                <span className="text-sm font-medium text-gray-500">Tidak Ada Rapor</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                            {selectedApplication.status === 'pending' ? (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200"
                                    >
                                        <XCircle className="w-6 h-6" />
                                        Tolak Berkas
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-200"
                                    >
                                        <CheckCircle className="w-6 h-6" />
                                        Terima Siswa
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedApplication(null)}
                                    className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                                >
                                    Tutup Detail
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Schedule Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSchedule ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                            </h2>
                            <button onClick={() => setIsScheduleModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kegiatan</label>
                                <input
                                    type="text"
                                    required
                                    value={scheduleForm.event_name}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, event_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: Pendaftaran Gelombang 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Rentang Tanggal</label>
                                <input
                                    type="text"
                                    required
                                    value={scheduleForm.date_range}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, date_range: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: 1 Maret - 30 April 2026"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Keterangan</label>
                                <textarea
                                    value={scheduleForm.description}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Keterangan tambahan..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={scheduleForm.is_active}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, is_active: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Tampilkan Agenda Ini (Aktif)</label>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Requirement Modal */}
            {isRequirementModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingRequirement ? 'Edit Syarat' : 'Tambah Syarat Baru'}
                            </h2>
                            <button onClick={() => setIsRequirementModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRequirement} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Syarat</label>
                                <textarea
                                    required
                                    value={requirementForm.description}
                                    onChange={(e) => setRequirementForm({ ...requirementForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Contoh: Fotokopi Ijazah yang dilegalisir"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRequirementModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-bold shadow-lg shadow-amber-200"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
