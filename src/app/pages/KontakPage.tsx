import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, Cross } from 'lucide-react';
import { useMessages } from '../contexts/MessageContext';
import { showAlert } from '../../utils/sweetalert';

export function KontakPage() {
  const { sendMessage } = useMessages();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await showAlert.confirm('Kirim Pesan', 'Kirim pesan ini ke sekolah?', 'Ya, Kirim', 'Batal', 'question');
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await sendMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      showAlert.success('Berhasil', 'Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error: any) {
      showAlert.error('Gagal', 'Gagal mengirim pesan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <section className="relative bg-blue-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: "url('/kontak.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          <Mail className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-5xl font-bold mb-4 drop-shadow-md">Kontak Kami</h1>
          <p className="text-xl text-blue-100 drop-shadow-md">Hubungi Kami untuk Informasi Lebih Lanjut</p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl text-blue-900 mb-6">Informasi Kontak</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-blue-900 mb-1">Alamat</h3>
                      <p className="text-gray-600">
                        Lili'kira'<br />
                        Kec. Nanggala, Kabupaten Toraja Utara<br />
                        Sulawesi Selatan 91855
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-blue-900 mb-1">Telepon</h3>
                      <p className="text-gray-600">0823-4818-7656 (WA)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-blue-900 mb-1">Email</h3>
                      <p className="text-gray-600">info@smpkatoliklilikira.sch.id</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-blue-900 mb-1">Jam Operasional</h3>
                      <p className="text-gray-600">Senin - Sabtu: 07.00 - 14.00</p>
                      <p className="text-gray-600">Minggu: Tutup</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg shadow-lg p-8 text-white">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <Cross className="w-6 h-6" />
                  Ikuti Kami
                </h3>
                <p className="text-blue-100 mb-6">Dapatkan update terbaru melalui media sosial kami</p>

                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Facebook className="w-6 h-6" />
                    <div>
                      <p className="text-sm">Facebook</p>
                      <p className="text-blue-100 text-xs">@SMPRenyaRosariLilikira</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Instagram className="w-6 h-6" />
                    <div>
                      <p className="text-sm">Instagram</p>
                      <p className="text-blue-100 text-xs">@smprenyarosarililikira</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Youtube className="w-6 h-6" />
                    <div>
                      <p className="text-sm">YouTube</p>
                      <p className="text-blue-100 text-xs">SMP Renya Rosari Lili'kira Official</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl text-blue-900 mb-6">Kirim Pesan</h2>
                <p className="text-gray-600 mb-6">
                  Isi formulir di bawah ini dan kami akan merespons secepat mungkin
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Nama Lengkap *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@contoh.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Nomor Telepon *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Subjek *</label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Subjek</option>
                      <option value="spmb">Informasi SPMB</option>
                      <option value="akademik">Informasi Akademik</option>
                      <option value="fasilitas">Fasilitas Sekolah</option>
                      <option value="keuangan">Informasi Keuangan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Pesan *</label>
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tulis pesan Anda di sini..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {loading ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    Dengan mengirimkan formulir ini, Anda menyetujui bahwa kami dapat menghubungi Anda melalui email atau telepon.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-blue-900 mb-4">Lokasi Kami</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
          </div>

          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg">
            <div className="relative w-full h-96 bg-gray-300">
              {/* Google Maps Embed */}
              {/* In real implementation, you would embed Google Maps here */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1020.6558611003444!2d120.00225!3d-2.9225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d93dce6a9f02cd1%3A0x951897d2e26000d1!2sSMP%20Katolik%20Renya%20Rosari%20Lili'kira'!5e0!3m2!1sid!2sid!4v1710000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi SMP Katolik Renya Rosari Lili'kira"
              ></iframe>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
