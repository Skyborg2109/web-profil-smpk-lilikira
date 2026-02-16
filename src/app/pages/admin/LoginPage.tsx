import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, User, LogIn, Eye, EyeOff, Shield, Loader2, ArrowRight } from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';

export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, logout, user, loading: authLoading } = useAuth();
    const [localLoading, setLocalLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'admin' || user.role === 'operator') {
                navigate('/admin/dashboard');
            }
        }
    }, [user, authLoading, navigate]);

    const loading = localLoading || authLoading;

    const loginWithEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);

        try {
            const user = await login(username, password);
            if (user) {
                if (user.role === 'admin' || user.role === 'operator') {
                    showAlert.success('Login Berhasil', `Selamat datang di Panel Admin, ${user.name}!`);
                    navigate('/admin/dashboard');
                } else {
                    await logout();
                    setError('Akses ditolak: Hanya untuk Admin dan Operator.');
                }
            } else {
                setError('Email/Password salah atau Profil tidak ditemukan.');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan sistem.');
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Immersive Background Decorations */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 scale-110 blur-sm"
                    style={{ backgroundImage: "url('/prestasi.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900/90 to-slate-900" />
            </div>

            {/* Animated Glow Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-lg relative">
                {/* School Brand Header */}
                <div className="text-center mb-10 transform transition-all duration-700 hover:scale-105">
                    <div className="inline-flex relative p-1 mb-6 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-amber-400 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-white p-4 rounded-full shadow-2xl">
                            <img src="/LogoSekolah.png" alt="Logo" className="w-20 h-20 object-contain" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Admin<span className="text-blue-400">Portal</span></h1>
                        <p className="text-blue-200/60 font-black text-xs uppercase tracking-[0.3em]">SMP Katolik Renya Rosari Lili'kira</p>
                    </div>
                </div>

                {/* Login Card with Glassmorphism */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                    <div className="p-10 lg:p-12">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Selamat Datang</h2>
                            <p className="text-slate-400 font-medium">Silakan masuk untuk mengelola sistem website.</p>
                        </div>

                        <form onSubmit={loginWithEmail} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider">{error}</p>
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Alamat Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-800/50 border-2 border-slate-700/50 text-white pl-14 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 font-bold"
                                        placeholder="admin@sekolah.sch.id"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password Sistem</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-800/50 border-2 border-slate-700/50 text-white pl-14 pr-12 py-4 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 font-bold"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative p-[2px] rounded-2xl overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-blue-500/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 group-hover/btn:scale-x-110 transition-transform duration-500" />
                                <div className="relative bg-slate-900 group-hover/btn:bg-transparent transition-colors py-4 rounded-[14px] flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                            <span className="font-black text-sm uppercase tracking-widest text-white">Otentikasi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5 text-white" />
                                            <span className="font-black text-sm uppercase tracking-widest text-white">Masuk Sistem</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    </div>

                    {/* Bottom Status Decoration */}
                    <div className="px-10 py-6 bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Online</span>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-[10px] font-black text-blue-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            <ArrowRight className="w-3 h-3 rotate-180" /> Buka Website
                        </button>
                    </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Encrypted Connection</span>
                </div>
            </div>
        </div>
    );
}
