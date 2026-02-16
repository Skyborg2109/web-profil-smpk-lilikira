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
    const [successMessage, setSuccessMessage] = useState('');

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

        // Check for Supabase confirmation in both hash and query params
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        const isActivation = hash.includes('type=signup') ||
            hash.includes('type=recovery') ||
            params.get('type') === 'signup' ||
            params.get('type') === 'recovery' ||
            params.get('token');

        if (isActivation) {
            setSuccessMessage('Akun Anda berhasil diverifikasi. Silakan login sekarang.');
            // Clear hash and params to prevent re-triggering
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [location.pathname]);

    // Login logic
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const handleLoginChange = (field: string, value: string) => {
        if (field === 'identifier') setIdentifier(value);
        if (field === 'password') setPassword(value);
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const errors: { [key: string]: string } = {};
        if (!identifier) errors.identifier = 'Email wajib diisi';
        if (!password) errors.password = 'Kata sandi wajib diisi';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            const user = await login(identifier, password);
            if (user) {
                if (user.role === 'student') {
                    showAlert.success('Login Berhasil', `Selamat datang kembali, ${user.name}!`);
                    navigate('/');
                } else {
                    await logout();
                    setError('Akses Ditolak: Akun Anda terdaftar sebagai Admin/Operator. Silakan login melalui portal administrasi.');
                }
            }
        } catch (err: any) {
            let message = err.message || 'Terjadi kesalahan saat login.';
            if (message === 'Invalid login credentials') {
                message = 'Email atau kata sandi salah. Silakan periksa kembali.';
            } else if (message.includes('Email not confirmed')) {
                message = 'Email belum dikonfirmasi. Silakan cek kotak masuk email Anda.';
            }
            setError(message);
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
    const [regErrors, setRegErrors] = useState<{ [key: string]: string }>({});

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (regErrors[name]) {
            setRegErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const errors: { [key: string]: string } = {};

        if (!formData.fullName) errors.fullName = 'Nama lengkap wajib diisi';
        if (!formData.email) errors.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Format email tidak valid';

        if (!formData.password) errors.password = 'Kata sandi wajib diisi';
        else if (formData.password.length < 6) errors.password = 'Kata sandi minimal 6 karakter';

        if (!formData.phone) errors.phone = 'Nomor telepon wajib diisi';

        if (Object.keys(errors).length > 0) {
            setRegErrors(errors);
            return;
        }

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
                console.log('Registration success:', data.user);
                const isEmailConfirmed = !!data.session;
                const msg = isEmailConfirmed
                    ? 'Akun Anda telah berhasil dibuat. Silakan login sekarang.'
                    : 'Registrasi berhasil! Silakan cek inbox email Anda untuk mengeklik link verifikasi sebelum login.';

                setSuccessMessage(msg);
                setView('login');
                window.history.pushState({}, '', '/login');
                setFormData({ email: '', password: '', fullName: '', phone: '' });
                setError(''); // clear any previous register errors
            }
        } catch (err: any) {
            let message = err.message || 'Terjadi kesalahan saat pendaftaran.';
            if (message.includes('Error sending confirmation email')) {
                message = 'Gagal mengirim email verifikasi. Akun mungkin sudah terbuat, tapi mohon tunggu beberapa saat (limit Supabase) atau cek folder Spam Anda.';
            } else if (message.includes('User already registered')) {
                message = 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.';
            }
            setError(message);
        } finally {
            setRegLoading(false);
        }
    };

    const toggleView = (target: 'login' | 'register') => {
        setView(target);
        setError('');
        setSuccessMessage('');
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
                    <img src="/LogoSekolah.png" className="auth-logo-top" alt="Logo Sekolah" />
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

                        {successMessage && (
                            <div className="auth-success">
                                <div className="success-icon">✓</div>
                                <div className="success-text">{successMessage}</div>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={identifier}
                            onChange={(e) => handleLoginChange('identifier', e.target.value)}
                            className={fieldErrors.identifier ? 'error' : ''}
                        />
                        {fieldErrors.identifier && <span className="field-error">{fieldErrors.identifier}</span>}

                        <div className="password-input-wrapper">
                            <input
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => handleLoginChange('password', e.target.value)}
                                className={fieldErrors.password ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}

                        <Link to="#" className="auth-link">Forgot password?</Link>

                        <button type="submit" disabled={loginLoading}>
                            {loginLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
                        </button>
                    </form>

                    {/* Register Form */}
                    <form className={`auth-form register ${view === 'register' ? 'active' : ''}`} onSubmit={handleRegister}>
                        <h2>Silahkan Melakukan Pendaftaran Akun Disini!</h2>

                        {successMessage && (
                            <div className="auth-success">
                                <div className="success-icon">✓</div>
                                <div className="success-text">{successMessage}</div>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <input
                            type="text"
                            name="fullName"
                            placeholder="Nama Lengkap"
                            value={formData.fullName}
                            onChange={handleRegChange}
                            className={regErrors.fullName ? 'error' : ''}
                        />
                        {regErrors.fullName && <span className="field-error">{regErrors.fullName}</span>}

                        <input
                            type="email"
                            name="email"
                            placeholder="Alamat Email"
                            value={formData.email}
                            onChange={handleRegChange}
                            className={regErrors.email ? 'error' : ''}
                        />
                        {regErrors.email && <span className="field-error">{regErrors.email}</span>}

                        <div className="password-input-wrapper">
                            <input
                                type={showRegisterPassword ? "text" : "password"}
                                name="password"
                                placeholder="Kata Sandi"
                                value={formData.password}
                                onChange={handleRegChange}
                                className={regErrors.password ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                                {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {regErrors.password && <span className="field-error">{regErrors.password}</span>}

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Nomor Telepon"
                            value={formData.phone}
                            onChange={handleRegChange}
                            className={regErrors.phone ? 'error' : ''}
                        />
                        {regErrors.phone && <span className="field-error">{regErrors.phone}</span>}

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
