import { Link } from 'react-router';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Cross } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo yayasan.png" alt="Logo Yayasan" className="w-10 h-10 object-contain bg-white rounded-md p-1" />
              <img src="/LogoSekolah.png" alt="Logo Sekolah" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
              <div>
                <h3 className="text-lg font-bold leading-tight">SMP Katolik</h3>
                <p className="text-sm font-medium">Renya Rosari Lili'kira</p>
              </div>
            </div>
            <p className="text-sm text-blue-100 leading-relaxed">
              Sekolah Katolik yang unggul dalam iman, karakter, dan prestasi akademik.
              <span className="block mt-2 font-semibold text-amber-400">Di bawah Naungan Yayasan Joseph Yeemye Makassar.</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Menu Cepat</h4>
            <ul className="space-y-2 text-sm text-blue-100">
              <li><Link to="/" className="hover:text-white">Beranda</Link></li>
              <li><Link to="/profil" className="hover:text-white">Profil Sekolah</Link></li>
              <li><Link to="/akademik" className="hover:text-white">Akademik</Link></li>
              <li><Link to="/spmb" className="hover:text-white">SPMB</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-blue-100">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Lili'kira', Kec. Nanggala, Toraja Utara, Sulawesi Selatan 91855</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>0823-4818-7656</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@smpkatoliklilikira.sch.id</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="mb-4">Media Sosial</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6 p-4 bg-blue-800 rounded-lg">
              <Cross className="w-6 h-6 mb-2" />
              <p className="text-xs text-blue-100 italic">
                "Kasihilah Tuhan, Allahmu, dengan segenap hatimu" - Matius 22:37
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6 text-center text-sm text-blue-100">
          <p>© 2026 SMP Katolik Renya Rosari Lili'kira. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
