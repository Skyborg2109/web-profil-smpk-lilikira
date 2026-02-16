import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { showAlert } from '../../../utils/sweetalert';
import '../../../styles/auth.css';

export function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                showAlert.success('Registrasi Berhasil', 'Akun Anda telah berhasil dibuat. Silakan login sekarang.')
                    .then(() => navigate('/login'));
            }
        } catch (error: any) {
            showAlert.error('Registrasi Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <img src="/auth/blob.svg" className="auth-blob" alt="" />
            <div className="auth-orbit"></div>

            <div className="auth-card">
                <div className="auth-hero">
                    <div className="auth-toggle">
                        <button type="button" onClick={() => navigate('/login')}>
                            <span> Login </span>
                        </button>
                        <button type="button">
                            <span> Sign Up</span>
                        </button>
                    </div>
                </div>

                <div className="auth-forms height-register">
                    <form className="auth-form register active" onSubmit={handleRegister}>
                        <h2>Daftar Sekarang!</h2>
                        <h3>SMP Katolik Renya Rosari</h3>

                        <input
                            required
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
                        </button>

                        <div style={{ marginTop: '10px' }}>
                            <Link to="/" className="auth-link" style={{ fontSize: '12px' }}>
                                &larr; Kembali ke Beranda
                            </Link>
                        </div>
                    </form>
                </div>

                <p className="terms">
                    Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami, kebijakan privasi, serta peraturan sekolah.
                </p>
            </div>
        </div>
    );
}
