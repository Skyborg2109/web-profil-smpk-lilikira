import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import '../../../styles/auth.css';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check if we have a recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // If no session and no hash, redirect to login
            if (!session && !window.location.hash) {
                navigate('/login');
            } else if (session) {
                setSuccessMessage('Token pemulihan diverifikasi. Silakan masukkan kata sandi baru Anda.');
            }
        };

        checkSession();

        // Listen for auth state changes (useful when token is in hash)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setSuccessMessage('Token pemulihan terdeteksi. Silakan perbarui kata sandi Anda.');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            setError('Kata sandi baru minimal 6 karakter.');
            return;
        }

        setResetLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            await showAlert.success('Berhasil', 'Kata sandi Anda telah diperbarui. Silakan login kembali.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Gagal memperbarui kata sandi.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Link to="/login" className="auth-back-button">
                <ArrowLeft />
                <span>Kembali ke Login</span>
            </Link>

            <img src="/auth/blob.svg" className="auth-blob" alt="" />
            <div className="auth-orbit"></div>

            <div className="auth-card">
                <div className="auth-hero">
                    <img src="/LogoSekolah.png" className="auth-logo-top" alt="Logo Sekolah" />
                    <div className="auth-hero-title">
                        <h3>Kata Sandi Baru</h3>
                    </div>
                </div>

                <div className="auth-forms view-register">
                    <form className="auth-form active" onSubmit={handleUpdatePassword}>
                        <h2>Reset Kata Sandi</h2>
                        <p className="form-desc">Pastikan kata sandi baru Anda kuat dan mudah diingat.</p>

                        {successMessage && (
                            <div className="auth-success">
                                <div className="success-icon">✓</div>
                                <div className="success-text">{successMessage}</div>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">{error}</div>
                        )}

                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Kata Sandi Baru"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError('');
                                }}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button type="submit" disabled={resetLoading}>
                            {resetLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Perbarui Kata Sandi'}
                        </button>
                    </form>
                </div>

                <p className="terms">
                    Demi keamanan, jangan pernah membagikan kata sandi Anda kepada siapa pun.
                </p>
            </div>
        </div>
    );
}
