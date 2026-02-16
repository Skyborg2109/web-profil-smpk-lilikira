import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router';
import { Loader2, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import '../../../styles/auth.css';

export function LoginPage() {
    const { login, logout, user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // View state: 'login', 'register', or 'forgot-password'
    const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
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
            if (hash.includes('type=recovery') || params.get('type') === 'recovery') {
                navigate('/reset-password' + window.location.hash);
            } else {
                setSuccessMessage('Akun Anda berhasil diverifikasi. Silakan login sekarang.');
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }, [location.pathname, navigate]);

    // Redirect if already authenticated (especially for OAuth callback)
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'student') {
                // If it's an OAuth login, we might want to show a specific message
                // We can check if the session was just created or if it's a redirect from OAuth
                const isOAuth = window.location.hash.includes('access_token') ||
                    window.location.search.includes('code=');

                if (isOAuth) {
                    showAlert.success('Login Berhasil', `Selamat datang, ${user.name}! Anda berhasil masuk menggunakan Google.`);
                }

                navigate('/');
            } else if (!authLoading) {
                // If admin logs in through student portal, show error but don't auto-redirect to admin to avoid confusion
                setError('Akun Anda terdaftar sebagai Admin. Silakan gunakan portal khusus Admin.');
            }
        }
    }, [isAuthenticated, user, authLoading, navigate]);

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

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/login`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Gagal login dengan Google.');
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

    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            setError('Silakan masukkan email Anda.');
            return;
        }

        setResetLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccessMessage('Link reset kata sandi telah dikirim ke email Anda.');
            setResetEmail('');
        } catch (err: any) {
            setError(err.message || 'Gagal mengirim email reset.');
        } finally {
            setResetLoading(false);
        }
    };

    const toggleView = (target: 'login' | 'register' | 'forgot-password') => {
        setView(target);
        setError('');
        setSuccessMessage('');
        setShowLoginPassword(false);
        setShowRegisterPassword(false);
        window.history.pushState({}, '', `/${target === 'forgot-password' ? 'login' : target}`);
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
                {(view === 'login' || view === 'register') && (
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
                )}

                {(view === 'forgot-password') && (
                    <div className="auth-hero">
                        <img src="/LogoSekolah.png" className="auth-logo-top" alt="Logo Sekolah" />
                        <div className="auth-hero-title">
                            <h3>Pemulihan Akun</h3>
                        </div>
                    </div>
                )}

                <div className={`auth-forms ${view !== 'login' ? 'view-register' : ''}`}>
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

                        <button type="button" className="auth-link" onClick={() => toggleView('forgot-password')}>Forgot password?</button>

                        <button type="submit" disabled={authLoading}>
                            {authLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
                        </button>

                        <div className="auth-divider">
                            <span>Atau masuk dengan</span>
                        </div>

                        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </form>

                    {/* Forgot Password Form */}
                    <form className={`auth-form forgot-password ${view === 'forgot-password' ? 'active' : ''}`} onSubmit={handleForgotPassword}>
                        <h2>Lupa Kata Sandi?</h2>
                        <p className="form-desc">Masukkan email Anda untuk menerima link pemulihan.</p>

                        {successMessage && (
                            <div className="auth-success">
                                <div className="success-icon">✓</div>
                                <div className="success-text">{successMessage}</div>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">{error}</div>
                        )}

                        <input
                            type="email"
                            placeholder="Alamat Email"
                            value={resetEmail}
                            onChange={(e) => {
                                setResetEmail(e.target.value);
                                setError('');
                                setSuccessMessage('');
                            }}
                        />

                        <button type="submit" disabled={resetLoading}>
                            {resetLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Kirim Link'}
                        </button>

                        <button type="button" className="auth-link" onClick={() => toggleView('login')}>
                            Kembali ke Login
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

                        <div className="auth-divider">
                            <span>Atau daftar dengan</span>
                        </div>

                        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
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
