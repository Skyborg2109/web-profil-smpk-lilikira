import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router';
import { Loader2, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import '../../../styles/auth.css';

export function LoginPage() {
    const { login, logout, loading: loginLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // View state: 'login' or 'register'
    const [view, setView] = useState<'login' | 'register'>('login');

    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    // Sync view with URL and check for activation
    useEffect(() => {
        if (location.pathname === '/register') {
            setView('register');
        } else {
            setView('login');
        }

        // Check for Supabase confirmation (usually in hash or query)
        const hash = window.location.hash;
        if (hash && (hash.includes('type=signup') || hash.includes('type=recovery'))) {
            showAlert.success('Akun Diaktivasi', 'Akun Anda berhasil diaktifkan. Silakan login sekarang.');
            // Clear hash
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [location.pathname]);

    // Login logic
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const user = await login(identifier, password);
            if (user) {
                if (user.role === 'student') {
                    showAlert.success('Login Berhasil', `Selamat datang kembali, ${user.name}!`);
                    navigate('/');
                } else {
                    await logout();
                    setError('Akses Ditolak: Silakan login melalui halaman Admin.');
                }
            } else {
                setError('Login Gagal: Periksa email dan password Anda.');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat login.');
        }
    };

    // Register logic
    const [regLoading, setRegLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: 'student' // default role
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (error) {
                // Supabase returns specialized error messages
                if (error.message.includes('User already registered')) {
                    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
                }
                throw error;
            }

            if (data.user) {
                showAlert.success('Registrasi Berhasil', 'Akun Anda telah berhasil dibuat. Silakan login sekarang.')
                    .then(() => {
                        setView('login');
                        window.history.pushState({}, '', '/login');
                    });
                // Reset form
                setFormData({ email: '', password: '', fullName: '', phone: '' });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRegLoading(false);
        }
    };

    const toggleView = (target: 'login' | 'register') => {
        setView(target);
        setError('');
        setShowLoginPassword(false);
        setShowRegisterPassword(false);
        window.history.pushState({}, '', `/${target}`);
    };

    return (
        <div className="auth-wrapper">
            <Link to="/" className="auth-back-button">
                <ArrowLeft />
                <span>Kembali ke Beranda</span>
            </Link>

            <img src="/auth/blob.svg" className="auth-blob" alt="" />
            <div className="auth-orbit"></div>

            <div className="auth-card">
                <div className="auth-hero">
                    <img src="/public/LogoSekolah.png" className="auth-logo-top" alt="Logo Sekolah" />
                    <div className={`auth-toggle ${view === 'login' ? 'login-active' : ''}`}>
                        <button type="button" onClick={() => toggleView('login')}>
                            <span> Login </span>
                        </button>
                        <button type="button" onClick={() => toggleView('register')}>
                            <span> Sign Up</span>
                        </button>
                    </div>
                </div>

                <div className={`auth-forms ${view === 'register' ? 'view-register' : ''}`}>
                    {/* Login Form */}
                    <form className={`auth-form login ${view === 'login' ? 'active' : ''}`} onSubmit={handleLogin}>
                        <h2>Selamat Datang Kembali!</h2>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <input
                            required
                            type="email"
                            placeholder="Email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                        <div className="password-input-wrapper">
                            <input
                                required
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <Link to="#" className="auth-link">Forgot password?</Link>

                        <button type="submit" disabled={loginLoading}>
                            {loginLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
                        </button>
                    </form>

                    {/* Register Form */}
                    <form className={`auth-form register ${view === 'register' ? 'active' : ''}`} onSubmit={handleRegister}>
                        <h2>Silahkan Melakukan Pendaftaran Akun Disini!</h2>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <input
                            required
                            type="text"
                            name="fullName"
                            placeholder="Nama Lengkap"
                            value={formData.fullName}
                            onChange={handleRegChange}
                        />
                        <input
                            required
                            type="email"
                            name="email"
                            placeholder="Alamat Email"
                            value={formData.email}
                            onChange={handleRegChange}
                        />
                        <div className="password-input-wrapper">
                            <input
                                required
                                type={showRegisterPassword ? "text" : "password"}
                                name="password"
                                placeholder="Kata Sandi"
                                value={formData.password}
                                onChange={handleRegChange}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                                {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="Nomor Telepon"
                            value={formData.phone}
                            onChange={handleRegChange}
                        />

                        <button type="submit" disabled={regLoading}>
                            {regLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Daftar Sekarang'}
                        </button>
                    </form>
                </div>

                <p className="terms">
                    Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami, kebijakan privasi, serta peraturan sekolah.
                </p>
            </div>

            <Link to="/admin/login" className="admin-shortcut" title="Login sebagai Admin/Operator">
                <Shield size={20} />
            </Link>
        </div>
    );
}
