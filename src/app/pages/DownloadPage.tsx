import { useState } from 'react';
import { FileText, Download, Search, File, FolderOpen, Cross } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';

import { LoadingScreen } from '../components/LoadingScreen';

export function DownloadPage() {
  const { documents, loading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="min-h-[60vh] relative">
        <LoadingScreen message="Memuat Dokumen..." fullScreen={false} />
      </div>
    );
  }

  const categories = ['Kurikulum', 'Kesiswaan', 'Kepegawaian', 'Administrasi', 'Lainnya'];

  const getFilteredDocuments = (category: string) => {
    return documents.filter(doc =>
      doc.category === category &&
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="relative bg-blue-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay scale-110"
          style={{ backgroundImage: "url('/prestasi.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <FolderOpen className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Pusat Download</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">Dokumen Resmi dan Informasi Sekolah</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari judul dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-lg shadow-gray-100"
            />
          </div>
        </div>
      </section>

      {/* Document Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {categories.map((category) => {
              const categoryDocs = getFilteredDocuments(category);
              if (categoryDocs.length === 0 && searchQuery === '') return null;
              if (categoryDocs.length === 0 && searchQuery !== '') return null;

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl text-blue-900">{category}</h2>
                  </div>
                  <div className="h-1 w-16 bg-amber-400"></div>

                  <div className="grid gap-4">
                    {categoryDocs.map((doc, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                              <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-sm">
                                {doc.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 uppercase">
                                {doc.file_type} • {doc.file_size}
                              </p>
                            </div>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {documents.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <File className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada dokumen yang tersedia untuk diunduh.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl mb-4">Butuh Dokumen Lain?</h2>
              <p className="text-blue-100 mb-6">
                Jika dokumen yang Anda cari tidak tersedia di sini, silakan hubungi bagian tata usaha sekolah melalui formulir kontak.
              </p>
              <a
                href="/kontak"
                className="inline-block bg-amber-400 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-amber-300 transition-colors"
              >
                Hubungi Kami
              </a>
            </div>
            <FolderOpen className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5" />
          </div>
        </div>
      </section>
    </div>
  );
}
