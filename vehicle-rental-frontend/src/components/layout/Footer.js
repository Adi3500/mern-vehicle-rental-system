import DriveLogo from '../common/DriveLogo';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(4,5,8,0.6) 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ marginBottom: '0.65rem' }}>
            <DriveLogo size={28} />
          </div>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'var(--font-size-xs)',
              maxWidth: '28rem',
              lineHeight: 1.65,
            }}
          >
            Premium vehicle rental — responsive bookings, clean host workflows, and a frontend tailored to your backend.
          </p>
        </div>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            alignItems: 'flex-end',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-faint)',
              letterSpacing: '0.04em',
            }}
          >
            API: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-faint)',
              letterSpacing: '0.04em',
            }}
          >
            CRA · Redux Toolkit · Axios · Stripe Elements
          </span>
          <span
            style={{
              marginTop: '0.25rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gold-dim)',
              border: '1px solid var(--border-gold)',
              color: 'var(--chrome-500)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
            }}
          >
            © {new Date().getFullYear()} DRIVE
          </span>
        </div>
      </div>
    </footer>
  );
}