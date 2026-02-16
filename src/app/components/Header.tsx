import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ChevronDown, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { showAlert } from '../../utils/sweetalert';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await showAlert.confirm(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun Anda?',
      'Ya, Keluar',
      'Batal',
      'question'
    );

    if (result.isConfirmed) {
      await logout();
      showAlert.success('Berhasil', 'Anda telah berhasil keluar.');
    }
  };

  const menuItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    {
      name: 'Akademik',
      subItems: [
        { name: 'Program Akademik', path: '/akademik' },
        { name: 'Kesiswaan', path: '/kesiswaan' },
        { name: 'Prestasi Siswa', path: '/prestasi' },
      ]
    },
    {
      name: 'Informasi',
      subItems: [
        { name: 'Berita & Kegiatan', path: '/berita' },
        { name: 'Galeri Foto', path: '/galeri' },
        { name: 'Pusat Download', path: '/download' },
      ]
    },
    { name: 'SPMB', path: '/spmb' },
    { name: 'Kontak', path: '/kontak' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <img src="/logo yayasan.png" alt="Logo Yayasan" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <div className="w-px h-6 sm:h-8 bg-gray-200 hidden sm:block"></div>
              <img src="/LogoSekolah.png" alt="Logo Sekolah" className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform" />
            </div>
            <div className="max-w-[150px] sm:max-w-none">
              <h1 className="text-sm sm:text-lg lg:text-xl text-blue-900 font-black leading-tight tracking-tight">SMP Katolik Renya Rosari</h1>
              <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Yayasan Joseph Yeemye Makassar</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.subItems ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`px-4 py-2 rounded-lg transition-all font-bold text-sm flex items-center gap-1 ${item.subItems.some(sub => isActive(sub.path))
                        ? 'bg-blue-900 text-white shadow-lg shadow-blue-200'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                    >
                      {item.name}
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>
                    {/* Dropdown */}
                    <div className={`absolute left-0 mt-0 w-56 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50`}>
                      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-2">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`block px-4 py-2.5 text-sm font-semibold transition-colors ${isActive(sub.path)
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                              }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg transition-all font-bold text-sm flex items-center gap-1 ${isActive(item.path)
                      ? 'bg-blue-900 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Auth Buttons */}
            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-2">
              {user && user.role === 'student' ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-2xl transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-blue-600 transition-colors">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user.role}</p>
                    </div>
                  </Link>
                  <div className="w-px h-8 bg-slate-100 mx-1" />
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-95"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-blue-900 hover:bg-blue-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-6 border-t pt-4 space-y-1">
            {/* Mobile User Section */}
            {user && user.role === 'student' ? (
              <div className="px-4 py-3 mb-2 bg-blue-50 rounded-xl flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg ml-2"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="px-2 mb-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <LogIn className="w-5 h-5" />
                  Login / Register
                </Link>
              </div>
            )}

            {menuItems.map((item) => (
              <div key={item.name} className="px-2">
                {item.subItems ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${item.subItems.some(sub => isActive(sub.path))
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700'
                        }`}
                    >
                      {item.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.name && (
                      <div className="bg-slate-50 rounded-xl overflow-hidden ml-4 border-l-2 border-slate-200">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 text-sm font-bold transition-all ${isActive(sub.path)
                              ? 'text-blue-700'
                              : 'text-slate-600'
                              }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path)
                      ? 'bg-blue-900 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-700 hover:bg-blue-50'
                      }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
