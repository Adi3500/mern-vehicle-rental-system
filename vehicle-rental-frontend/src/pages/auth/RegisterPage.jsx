import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Shield, Star, UserPlus, Zap } from 'lucide-react';
import { registerUser } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import DriveLogo from '../../components/common/DriveLogo';

const FEATURES = [
    { icon: <Zap size={16} />, text: 'Instant booking confirmation' },
    { icon: <Shield size={16} />, text: 'Verified vehicles & hosts' },
    { icon: <Star size={16} />, text: '500+ premium vehicles' },
];

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { status } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        try {
            const response = await dispatch(registerUser(formData)).unwrap();
            toast.success(response?.message || 'Account created! Please sign in.');
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error(error.message || error || 'An error occurred');
        }
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
                    <DriveLogo size={32} style={{ '--text-primary': '#ffffff', '--text-muted': 'rgba(255,255,255,0.55)' }} />
                </Link>

                {/* Tagline */}
                <div className="auth-split__tagline">
                    <h1>Join the<br /><em>experience.</em></h1>
                    <p>Create your account in seconds and start booking premium vehicles today.</p>
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
                        <div className="auth-form__eyebrow">Get started free</div>
                        <h2 className="auth-form__title">Create your account</h2>
                        <p className="auth-form__sub">Join thousands booking their perfect ride</p>
                    </div>

                    {/* Role selector tabs */}
                    <div className="auth-role-tabs">
                        <button
                            type="button"
                            className={`auth-role-tab ${formData.role === 'customer' ? 'is-active' : ''}`}
                            onClick={() => setFormData((p) => ({ ...p, role: 'customer' }))}
                        >
                            🧑‍💼 Customer
                        </button>
                        <button
                            type="button"
                            className={`auth-role-tab ${formData.role === 'host' ? 'is-active' : ''}`}
                            onClick={() => setFormData((p) => ({ ...p, role: 'host' }))}
                        >
                            🏠 Host
                        </button>
                    </div>

                    {formData.role === 'host' && (
                        <div className="auth-notice">
                            ⚠️ Host accounts require admin approval before you can list vehicles.
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-form__row">
                            <div className="auth-field">
                                <label htmlFor="reg-name" className="auth-field__label">Full name</label>
                                <input
                                    id="reg-name"
                                    type="text"
                                    name="name"
                                    className="auth-field__input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="auth-field">
                                <label htmlFor="reg-phone" className="auth-field__label">Phone <span className="auth-field__optional">(optional)</span></label>
                                <input
                                    id="reg-phone"
                                    type="tel"
                                    name="phone"
                                    className="auth-field__input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 555 123 4567"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="reg-email" className="auth-field__label">Email address</label>
                            <input
                                id="reg-email"
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

                        <div className="auth-form__row">
                            <div className="auth-field">
                                <label htmlFor="reg-password" className="auth-field__label">Password</label>
                                <div className="auth-field__password-wrap">
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="auth-field__input auth-field__input--password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="auth-field__eye" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="auth-field">
                                <label htmlFor="reg-confirm" className="auth-field__label">Confirm password</label>
                                <div className="auth-field__password-wrap">
                                    <input
                                        id="reg-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        className="auth-field__input auth-field__input--password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="auth-field__eye" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-btn auth-btn--primary"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? <span className="auth-btn__spinner" /> : <UserPlus size={16} />}
                            {status === 'loading' ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-footer-link">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}