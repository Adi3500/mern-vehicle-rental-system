import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  KeyRound,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { changePassword, logoutUser } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import DriveLogo from '../common/DriveLogo';
import Modal from '../common/Modal';

const guestLinks = [{ to: '/', label: 'Explore' }];

const customerLinks = [
  { to: '/', label: 'Explore' },
  { to: '/bookings', label: 'My Bookings' },
];

const hostLinks = [
  { to: '/host', label: 'Dashboard', end: true },
  { to: '/host/vehicles', label: 'Vehicles' },
  { to: '/host/bookings', label: 'Bookings' },
  { to: '/host/earnings', label: 'Earnings' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/vehicles', label: 'Vehicles' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/categories', label: 'Categories' },
];

const initialPasswordState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState(initialPasswordState);
  const [scrolled, setScrolled] = useState(false);
  const accountMenuRef = useRef(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, status } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = !isAuthenticated
    ? guestLinks
    : user?.role === 'admin'
      ? adminLinks
      : user?.role === 'host'
        ? hostLinks
        : customerLinks;

  const showMobileToggle = isAuthenticated || links.length > 1;
  const navIsOpen = showMobileToggle ? mobileOpen : true;

  const resetPasswordForm = () => setPasswordData(initialPasswordState);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    setLogoutModalOpen(false);
    toast.success('You have been logged out.');
    navigate('/');
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    try {
      const message = await dispatch(changePassword(passwordData)).unwrap();
      resetPasswordForm();
      setPasswordModalOpen(false);
      toast.success(message);
      navigate('/login');
    } catch (error) {
      toast.error(error.message || error || 'An error occurred');
    }
  };

  const roleLabel = user?.role
    ? { admin: 'Admin', host: 'Host', customer: 'Member' }[user.role] || user.role
    : null;

  return (
    <>
      <header
        className="site-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'var(--bg-surface)' : 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled
            ? '1px solid var(--border-default)'
            : '1px solid var(--border-subtle)',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div
          className="container site-header__inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 clamp(1rem, 3vw, 2.5rem)',
            height: '3.75rem',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = '0.82';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = '1';
            }}
          >
            <DriveLogo size={34} />
          </Link>

          {showMobileToggle ? (
            <button
              className="icon-button site-header__toggle"
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              style={{ marginLeft: 'auto' }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          ) : null}

          <nav
            className={`site-nav ${navIsOpen ? 'is-open' : ''}`}
            aria-label="Main navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginLeft: 'auto',
            }}
          >
            <div
              className="site-nav__links"
              style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}
            >
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end ?? link.to === '/'}
                  style={({ isActive }) => ({
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive
                      ? 'var(--font-weight-semibold)'
                      : 'var(--font-weight-normal)',
                    color: isActive ? 'var(--chrome-300)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--gold-dim)' : 'transparent',
                    border: isActive
                      ? '1px solid var(--border-gold)'
                      : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div
              className="site-nav__actions"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <button
                id="theme-toggle-btn"
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
                }
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '50%',
                  border: '1px solid var(--border-gold)',
                  background: 'var(--gold-dim)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                  overflow: 'hidden',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'rgba(201,184,50,0.25)';
                  event.currentTarget.style.transform = 'scale(1.1)';
                  event.currentTarget.style.boxShadow = '0 0 16px rgba(201,184,50,0.35)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'var(--gold-dim)';
                  event.currentTarget.style.transform = 'scale(1)';
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                {theme === 'dark' ? (
                  <Sun
                    size={16}
                    style={{
                      color: '#f59e0b',
                      transition: 'all 0.25s ease',
                      filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))',
                    }}
                  />
                ) : (
                  <Moon
                    size={16}
                    style={{
                      color: 'var(--chrome-400)',
                      transition: 'all 0.25s ease',
                      filter: 'drop-shadow(0 0 6px rgba(201,184,50,0.4))',
                    }}
                  />
                )}
              </button>

              {isAuthenticated && user ? (
                <div ref={accountMenuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    aria-expanded={accountMenuOpen}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.75rem 0.4rem 0.4rem',
                      background: accountMenuOpen
                        ? 'var(--obsidian-700)'
                        : 'var(--obsidian-800)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '50%',
                        background: 'var(--gold-dim)',
                        border: '1px solid var(--border-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--chrome-400)',
                        flexShrink: 0,
                      }}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <User size={13} />
                      )}
                    </span>

                    <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text-primary)',
                          maxWidth: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.name}
                      </span>

                      {roleLabel ? (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.65rem',
                            color: 'var(--chrome-500)',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {roleLabel}
                        </span>
                      ) : null}
                    </div>

                    <ChevronDown
                      size={14}
                      style={{
                        color: 'var(--text-muted)',
                        transform: accountMenuOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>

                  {accountMenuOpen ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        minWidth: '180px',
                        background:
                          'linear-gradient(160deg, var(--obsidian-700), var(--obsidian-800))',
                        border: '1px solid var(--border-gold)',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-xl), var(--shadow-gold)',
                        overflow: 'hidden',
                        zIndex: 200,
                        animation: 'slideUp 0.2s var(--ease-out-expo)',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {user.email}
                        </p>
                      </div>

                      <div style={{ padding: '0.4rem' }}>
                        <Link
                          to="/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            event.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'transparent';
                            event.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <User size={14} />
                          Profile
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setPasswordModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            event.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'transparent';
                            event.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <KeyRound size={14} />
                          Change Password
                        </button>
                      </div>

                      <div
                        style={{
                          padding: '0.4rem',
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setLogoutModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--rose-400)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link to="/login" className="button button--primary" style={{ gap: '0.4rem' }}>
                  <LogIn size={15} />
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <Modal
        open={logoutModalOpen}
        title="Sign Out"
        onClose={() => setLogoutModalOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setLogoutModalOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="button button--danger" onClick={handleLogout}>
              <LogOut size={15} />
              Sign out
            </button>
          </>
        }
      >
        <p className="muted-text" style={{ lineHeight: 1.7 }}>
          Are you sure you want to sign out of your account? You&apos;ll need to log in again to
          access your dashboard.
        </p>
      </Modal>

      <Modal
        open={passwordModalOpen}
        title="Change Password"
        onClose={() => {
          setPasswordModalOpen(false);
          resetPasswordForm();
        }}
        actions={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setPasswordModalOpen(false);
                resetPasswordForm();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="navbar-change-password-form"
              className="button button--primary"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </>
        }
      >
        <form
          id="navbar-change-password-form"
          onSubmit={handlePasswordSubmit}
          style={{ display: 'grid', gap: '1rem' }}
        >
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field, index) => (
            <label
              key={field}
              className="field"
              style={{ display: 'grid', gap: '0.4rem' }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-secondary)',
                }}
              >
                {['Old password', 'New password', 'Confirm password'][index]}
              </span>
              <input
                type="password"
                name={field}
                value={passwordData[field]}
                onChange={handlePasswordChange}
                required
                className="form-control"
              />
            </label>
          ))}
        </form>
      </Modal>
    </>
  );
}
