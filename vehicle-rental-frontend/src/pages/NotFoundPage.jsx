import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (<div style = {
            {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                padding: '2rem',
                textAlign: 'center',
            }
        }> { /* Decorative number */ } <div style = {
            {
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(6rem, 20vw, 12rem)',
                fontWeight: 'var(--font-weight-black)',
                lineHeight: 1,
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, var(--obsidian-600) 0%, var(--obsidian-500) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.05em',
                userSelect: 'none',
            }
        }>
        404 </div>

        { /* Icon */ } <div style = {
            {
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-gold)',
            }
        }> 🚗
        </div><h1 style = {
            {
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-black)',
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                letterSpacing: '-0.03em',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)',
            }
        }>
        Page not found </h1><p style = {
            {
                color: 'var(--text-muted)',
                fontSize: 'var(--font-size-base)',
                maxWidth: '28rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
            }
        }>
        The road you were looking
        for doesn 't exist. Let'
        s get you back on track. </p><div style = {
            { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }
        }><Link to = "/"
        className = "button button--primary"> ←Back to home </Link><Link to = "/bookings"
        className = "button button--ghost">
        My Bookings </Link></div></div>
    );
}