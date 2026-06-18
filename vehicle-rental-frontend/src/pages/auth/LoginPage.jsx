import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, LogIn, Shield, Star, Zap } from 'lucide-react';
import { loginUser } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import DriveLogo from '../../components/common/DriveLogo';

const FEATURES = [
    { icon: <Zap size={16} />, text: 'Instant booking confirmation' },
    { icon: <Shield size={16} />, text: 'Verified vehicles & hosts' },
    { icon: <Star size={16} />, text: '500+ premium vehicles' },
];

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useAppSelector((state) => state.auth);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await dispatch(loginUser(formData)).unwrap();
            toast.success('Welcome back!');
            const fallback =
                result?.user?.role === 'admin' ? '/admin'
                : result?.user?.role === 'host' ? '/host'
                : '/';
            navigate(location.state?.from || fallback, { replace: true });
        } catch (error) {
            toast.error(error.message || error || 'An error occurred');
        }
    };

    const handleGuestContinue = () => {
        navigate('/');
    };

    return (
        <div className="auth-split">
            {/* ── LEFT PANEL: Hero image ─────────────────── */}
            <div className="auth-split__panel">
                <img
                    src="/auth-hero.png"
                    alt="Luxury vehicle rental"
                    className="auth-split__bg"
                />
                <div className="auth-split__overlay" />

                {/* Brand */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <DriveLogo size={32} style={{ '--text-primary': '#ffffff', '--text-muted': 'rgba(255,255,255,0.55)', '--font-display': 'inherit', '--font-mono': 'inherit', '--font-weight-black': 900 }} />
                </Link>

                {/* Tagline */}
                <div className="auth-split__tagline">
                    <h1>Your ride,<br /><em>your rules.</em></h1>
                    <p>Premium vehicles at your fingertips. Book instantly, drive confidently.</p>
                    <div className="auth-split__features">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="auth-split__feature">
                                {f.icon}
                                <span>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL: Form ──────────────────────── */}
            <div className="auth-split__form-panel">
                {/* Top-right back link */}
                <div className="auth-split__topbar">
                    <Link to="/" className="auth-split__back">
                        ← Back to home
                    </Link>
                </div>

                <div className="auth-split__form-wrap">
                    {/* Header */}
                    <div className="auth-form__header">
                        <div className="auth-form__eyebrow">Welcome back</div>
                        <h2 className="auth-form__title">Sign in to DRIVE</h2>
                        <p className="auth-form__sub">Enter your credentials to access your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label htmlFor="login-email" className="auth-field__label">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                className="auth-field__input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password" className="auth-field__label">Password</label>
                            <div className="auth-field__password-wrap">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="auth-field__input auth-field__input--password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="auth-field__eye"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-btn auth-btn--primary"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? (
                                <span className="auth-btn__spinner" />
                            ) : (
                                <LogIn size={16} />
                            )}
                            {status === 'loading' ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    {/* Guest button */}
                    <button
                        type="button"
                        className="auth-btn auth-btn--ghost"
                        onClick={handleGuestContinue}
                    >
                        <ArrowRight size={16} />
                        Continue as Guest
                    </button>

                    {/* Footer link */}
                    <p className="auth-footer-link">
                        Don't have an account?{' '}
                        <Link to="/register">Create one for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
