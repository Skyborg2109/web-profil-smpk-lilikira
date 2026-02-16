import { useState } from 'react';
import { GraduationCap, Calendar, FileText, CheckCircle, Upload, User, Mail, Phone, Lock } from 'lucide-react';
import { useSPMB } from '../contexts/SPMBContext';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { Link } from 'react-router';
import { showAlert } from '../../utils/sweetalert';

export function SPMBPage() {
  const { addApplication, loading, requirements, schedules } = useSPMB();
  const { user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Informasi Pendaftaran..." fullScreen={false} />
      </div>
    );
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birth_date: '',
    address: '',
    previous_school: '',
    parents_name: '',
    parents_phone: '',
  });

  const [files, setFiles] = useState<{
    photo: File | null;
    birth_certificate: File | null;
    report_card: File | null;
  }>({
    photo: null,
    birth_certificate: null,
    report_card: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await showAlert.confirm('Kirim Pendaftaran', 'Apakah data yang Anda masukkan sudah benar?', 'Ya, Kirim', 'Cek Lagi', 'question');
    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await addApplication(formData, files);
      showAlert.success('Berhasil', 'Terima kasih! Data pendaftaran Anda telah kami terima. Tim kami akan menghubungi Anda segera.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birth_date: '',
        address: '',
        previous_school: '',
        parents_name: '',
        parents_phone: '',
      });
      setFiles({
        photo: null,
        birth_certificate: null,
        report_card: null,
      });
    } catch (error) {
      showAlert.error('Gagal', 'Maaf, terjadi kesalahan saat mengirim pendaftaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      // Basic validation: max 5MB
      if (file.size > 5 * 1024 * 1024) {
        showAlert.error('File Terlalu Besar', 'Ukuran file maksimal 5MB');
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };


  return (
    <div className="bg-gray-50">
      {/* Header with Background */}
      <section className="relative bg-amber-600 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: "url('/bg%20berita.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-600/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-6 text-white" />
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">SPMB 2026/2027</h1>
          <p className="text-xl md:text-2xl text-amber-50 max-w-2xl mx-auto mb-8">Seleksi Penerimaan Murid Baru Tahun Ajaran 2026/2027</p>
          <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/30">
            <p className="text-lg font-bold">📅 Pendaftaran: 1 Maret - 30 April 2026</p>
          </div>
        </div>
      </section>

      {/* Syarat Pendaftaran */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl text-blue-900">Syarat Pendaftaran</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <ul className="space-y-4">
                {requirements.map((req) => (
                  <li key={req.id} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{req.description}</span>
                  </li>
                ))}
                {requirements.length === 0 && (
                  <li className="text-gray-500 italic">Belum ada syarat pendaftaran yang ditambahkan.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl text-blue-900">Jadwal SPMB</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {schedules.filter(s => s.is_active).map((item, index) => (
                  <div key={item.id} className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white z-10 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
                      <div className="text-amber-500 mb-2">{item.date_range}</div>
                      <h3 className="text-xl text-blue-900">{item.event_name}</h3>
                      {item.description && <p className="text-gray-600 mt-2 text-sm">{item.description}</p>}
                    </div>
                  </div>
                ))}
                {schedules.filter(s => s.is_active).length === 0 && (
                  <p className="text-center text-gray-500 italic py-8">Jadwal belum tersedia.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulir Pendaftaran Online */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl text-blue-900">Formulir Pendaftaran Online</h2>
              </div>
              <div className="h-1 w-20 bg-amber-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Isi formulir di bawah ini untuk mendaftar sebagai calon siswa baru</p>
            </div>

            {user ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
                {/* Data Siswa */}
                <div className="mb-8">
                  <h3 className="text-xl text-blue-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Data Calon Siswa
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Nama Lengkap *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama lengkap sesuai ijazah"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Tanggal Lahir *</label>
                      <input
                        type="date"
                        name="birth_date"
                        required
                        value={formData.birth_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Jenis Kelamin *</label>
                      <select
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@contoh.com"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-700 mb-2">Alamat Lengkap *</label>
                    <textarea
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Alamat tempat tinggal saat ini"
                    ></textarea>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Nomor Telepon *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Asal Sekolah *</label>
                      <input
                        type="text"
                        name="previous_school"
                        required
                        value={formData.previous_school}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama SD/MI asal"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Orang Tua */}
                <div className="mb-8 pt-8 border-t-2 border-gray-200">
                  <h3 className="text-xl text-blue-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Data Orang Tua/Wali
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Nama Orang Tua/Wali *</label>
                      <input
                        type="text"
                        name="parents_name"
                        required
                        value={formData.parents_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama lengkap orang tua/wali"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Nomor Telepon Orang Tua *</label>
                      <input
                        type="tel"
                        name="parents_phone"
                        required
                        value={formData.parents_phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Dokumen */}
                <div className="mb-8 pt-8 border-t-2 border-gray-200">
                  <h3 className="text-xl text-blue-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Dokumen (Opsional)
                  </h3>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Pas Foto 3x4 (Wajib)</label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative ${files.photo ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'}`}>
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required
                        />
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${files.photo ? 'text-green-500' : 'text-gray-400'}`} />
                        <p className="text-sm text-gray-600 truncate">{files.photo ? files.photo.name : 'Upload Foto'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Akta Kelahiran</label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative ${files.birth_certificate ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'}`}>
                        <input
                          type="file"
                          name="birth_certificate"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${files.birth_certificate ? 'text-green-500' : 'text-gray-400'}`} />
                        <p className="text-sm text-gray-600 truncate">{files.birth_certificate ? files.birth_certificate.name : 'Upload Akta'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Rapor / Kartu Keluarga</label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative ${files.report_card ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'}`}>
                        <input
                          type="file"
                          name="report_card"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${files.report_card ? 'text-green-500' : 'text-gray-400'}`} />
                        <p className="text-sm text-gray-600 truncate">{files.report_card ? files.report_card.name : 'Upload Dokumen'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">Format: JPG, PNG, PDF. Maksimal 5MB per file.</p>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Dokumen fisik asli tetap dibawa saat tes wawancara.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      gender: '',
                      birth_date: '',
                      address: '',
                      previous_school: '',
                      parents_name: '',
                      parents_phone: '',
                    })}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <p className="mt-6 text-sm text-gray-600 text-center">
                  Dengan mengirimkan formulir ini, Anda menyetujui bahwa data yang diberikan adalah benar dan dapat dipertanggungjawabkan.
                </p>
              </form>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6 relative">
                  <Lock className="w-10 h-10 text-blue-600" />
                  <div className="absolute top-0 right-0 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-blue-900 text-xs font-bold">!</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Akses Dibatasi</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Silakan login terlebih dahulu untuk mengisi formulir pendaftaran siswa baru.
                  Jika belum memiliki akun, silakan mendaftar.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
                  >
                    Login Sekarang
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-blue-100 text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-all"
                  >
                    Buat Akun Baru
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div >
      </section >

      {/* Brosur Download */}
      < section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white" >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl mb-4">Download Brosur SPMB</h2>
          <p className="text-blue-100 mb-8">
            Unduh brosur lengkap informasi SPMB untuk panduan lebih detail
          </p>
          <button className="bg-amber-400 text-blue-900 px-8 py-3 rounded-lg hover:bg-amber-500 transition-colors inline-flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Download Brosur PDF
          </button>
        </div>
      </section >
    </div >
  );
}
