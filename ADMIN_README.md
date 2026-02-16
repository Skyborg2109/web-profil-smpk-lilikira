# 📚 Admin Dashboard - SMP Katolik Renya Rosari Lili'kira

## 🎯 Fitur-Fitur Admin Dashboard

Dashboard admin telah dilengkapi dengan berbagai fitur manajemen website yang komprehensif:

### 1. 📊 **Dashboard Utama** (`/admin/dashboard`)
- **Statistik Real-time**: Pengunjung harian, total pengunjung, pengguna aktif
- **Grafik Pengunjung**: Visualisasi data pengunjung 7 hari terakhir
- **Quick Stats**: Page views, durasi rata-rata, bounce rate
- **Berita Terbaru**: Daftar artikel terbaru dengan status publikasi

### 2. 📰 **Kelola Berita** (`/admin/news`)
- ✏️ Buat, edit, dan hapus artikel berita
- 📸 Upload gambar untuk setiap artikel
- 📝 Editor teks lengkap dengan preview
- 🔄 Toggle status publikasi (Draft/Published)
- 👁️ Tracking jumlah views per artikel
- 🔍 Pencarian dan filter artikel

### 3. 🖼️ **Kelola Galeri** (`/admin/gallery`)
- 📤 Upload foto ke berbagai kategori:
  - Akademik
  - Kegiatan Rohani
  - Ekstrakurikuler
  - Ruangan Kelas
  - Fasilitas
- 🗑️ Hapus foto yang tidak diperlukan
- ✏️ Edit informasi foto
- 🔍 Pencarian dan filter berdasarkan kategori
- 📅 Tracking tanggal upload

### 4. 📋 **Kelola SPMB** (`/admin/spmb`)
- 📊 Dashboard statistik pendaftaran:
  - Total pendaftar
  - Pendaftar menunggu review
  - Pendaftar diterima
  - Pendaftar ditolak
- 👤 Detail lengkap setiap pendaftar:
  - Informasi siswa (nama, tanggal lahir, kontak)
  - Informasi orang tua
  - Sekolah asal
  - Dokumen pendukung (foto, akta, rapor)
- ✅ Approve/Reject pendaftaran
- 🔍 Pencarian dan filter berdasarkan status
- 📥 Download dokumen pendaftar

### 5. ⚙️ **Kelola Konten** (`/admin/content`)
- 📝 Edit konten halaman website:
  - Visi & Misi
  - Sejarah Sekolah
  - Sambutan Kepala Sekolah
  - Informasi SPMB
- 👁️ Live preview saat mengedit
- 💾 Simpan perubahan dengan mudah
- 📅 Tracking tanggal update terakhir

### 6. 📈 **Statistik** (`/admin/statistics`)
- 📊 Analisis pengunjung website
- 📈 Grafik tren pengunjung
- 🎯 Metrik performa website

---

## 🔐 Login Admin

### Akses Login:
- **URL**: `/admin/login`
- **Kredensial Default**:
  - Email: `admin@smkkatolik.sch.id`
  - Password: `admin123`

### Fitur Login:
- 🔒 Autentikasi aman
- 👤 Session management
- 🚪 Auto-redirect ke dashboard setelah login
- 🔄 Protected routes (harus login untuk akses)

---

## 🎨 Desain & UX

### Sidebar Navigation
- 📱 **Responsive**: Dapat di-collapse untuk layar kecil
- 🎯 **Intuitive**: Icon dan label yang jelas
- 🎨 **Modern**: Gradient blue theme
- ⚡ **Smooth**: Transisi animasi halus

### Interface Features
- 🎨 **Color-coded Stats**: Setiap metrik punya warna unik
- 📊 **Interactive Charts**: Hover untuk detail
- 🔔 **Status Badges**: Visual indicator untuk status
- ⚡ **Quick Actions**: Tombol aksi cepat di setiap halaman

---

## 🚀 Cara Menggunakan

### 1. Login ke Dashboard
```
1. Buka browser dan akses: http://localhost:5173/admin/login
2. Masukkan kredensial admin
3. Klik "Login"
4. Anda akan diarahkan ke Dashboard
```

### 2. Mengelola Berita
```
1. Klik "Kelola Berita" di sidebar
2. Klik tombol "+ Buat Berita Baru"
3. Isi form:
   - Judul berita
   - Konten berita
   - Upload gambar
   - Pilih kategori
4. Klik "Simpan" untuk draft atau "Publish" untuk publikasi
```

### 3. Upload Foto Galeri
```
1. Klik "Kelola Galeri" di sidebar
2. Klik tombol "+ Upload Foto"
3. Isi form:
   - Judul foto
   - Pilih kategori
   - Upload file gambar (PNG, JPG, JPEG)
4. Klik "Upload"
```

### 4. Review Pendaftaran SPMB
```
1. Klik "Kelola SPMB" di sidebar
2. Lihat daftar pendaftar
3. Klik "Detail" pada pendaftar yang ingin direview
4. Periksa informasi dan dokumen
5. Klik "Terima" atau "Tolak"
```

### 5. Edit Konten Website
```
1. Klik "Kelola Konten" di sidebar
2. Pilih bagian yang ingin diedit dari sidebar kiri
3. Klik tombol "Edit"
4. Ubah konten sesuai kebutuhan
5. Lihat preview di bawah
6. Klik "Simpan Perubahan"
```

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework**: React + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Form Handling**: Controlled Components

---

## 📱 Responsive Design

Dashboard admin fully responsive untuk berbagai ukuran layar:
- 💻 **Desktop**: Full sidebar dengan label
- 📱 **Tablet**: Collapsible sidebar
- 📱 **Mobile**: Icon-only sidebar dengan hamburger menu

---

## 🔒 Keamanan

- ✅ Protected routes dengan authentication check
- ✅ Auto-redirect ke login jika belum authenticated
- ✅ Session management dengan Context API
- ✅ Logout functionality

---

## 📝 Catatan Pengembangan

### Data Storage
Saat ini menggunakan **local state** untuk demo. Untuk production:
- Integrasikan dengan backend API (Node.js/Express, Laravel, dll)
- Gunakan database (MySQL, PostgreSQL, MongoDB)
- Implementasi file upload ke server/cloud storage
- Tambahkan validasi dan error handling

### Future Enhancements
- 📧 Email notification untuk pendaftar SPMB
- 📊 Export data ke Excel/PDF
- 🔔 Real-time notifications
- 👥 Multi-user management dengan roles
- 📱 Mobile app untuk admin
- 🌐 Multi-language support

---

## 🎯 Best Practices

1. **Selalu logout** setelah selesai menggunakan dashboard
2. **Backup data** secara berkala
3. **Review pendaftaran SPMB** secara rutin
4. **Update konten** agar tetap fresh dan relevan
5. **Monitor statistik** untuk insight pengunjung

---

## 📞 Support

Jika ada pertanyaan atau masalah:
- 📧 Email: admin@smkkatolik.sch.id
- 📱 WhatsApp: +62 xxx-xxxx-xxxx

---

**Dibuat dengan ❤️ untuk SMP Katolik Renya Rosari Lili'kira**
