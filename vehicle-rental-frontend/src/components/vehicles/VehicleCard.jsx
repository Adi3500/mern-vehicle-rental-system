import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, getPrimaryImage } from '../../utils/format';

export default function VehicleCard({ vehicle }) {
    return (<article className = "card"
        style = {
            {
                padding: 0,
                overflow: 'hidden',
                transition: 'transform 0.25s var(--ease-out-expo), border-color 0.25s, box-shadow 0.25s',
                cursor: 'default',
            }
        }
        onMouseEnter = {
            (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--border-gold)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
            }
        }
        onMouseLeave = {
            (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }
        }> { /* Image */ } <Link to = { `/vehicles/${vehicle._id}` }
        style = {
            { display: 'block', position: 'relative', overflow: 'hidden', aspectRatio: '16/10' }
        }><img src = { getPrimaryImage(vehicle.images) }
        alt = { vehicle.title }
        style = {
            {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.5s var(--ease-out-expo)',
            }
        }
        onMouseEnter = {
            (e) => { e.currentTarget.style.transform = 'scale(1.06)'; }
        }
        onMouseLeave = {
            (e) => { e.currentTarget.style.transform = 'scale(1)'; }
        } /> { /* Gradient overlay */ } <div style = {
            {
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, rgba(4,5,8,0.6) 100%)',
                pointerEvents: 'none',
            }
        } /></Link>

        { /* Body */ } <div style = {
            { padding: '1.1rem 1.25rem 1.25rem' }
        }> { /* Category + Rating */ } <div style = {
            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }
        }><span style = {
            {
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                color: 'var(--chrome-400)',
                fontSize: '0.7rem',
                fontWeight: 'var(--font-weight-semibold)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
            }
        }> { vehicle.category?.name || 'Vehicle' } </span><span style = {
            {
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--chrome-300)',
            }
        }><Star size = { 12 }
        fill = "currentColor" /> { vehicle.averageRating || 0 } </span></div>

        { /* Title */ } <Link to = { `/vehicles/${vehicle._id}` }
        style = {
            {
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                marginBottom: '0.35rem',
                lineHeight: 1.2,
                transition: 'color 0.15s',
            }
        }
        onMouseEnter = {
            (e) => { e.currentTarget.style.color = 'var(--chrome-200)'; }
        }
        onMouseLeave = {
            (e) => { e.currentTarget.style.color = 'var(--text-primary)'; }
        }> { vehicle.title } </Link>

        { /* Location */ } <p style = {
            {
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
            }
        }><MapPin size = { 11 } /> { vehicle.location?.city }, { vehicle.location?.country } </p>

        { /* Specs pills */ } <div style = {
            {
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
            }
        }> {
            [vehicle.make || 'Flexible', vehicle.transmission || 'Manual', `${vehicle.seats || 5} seats`].map((spec) => (<span key = { spec }
                style = {
                    {
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                    }
                }> { spec } </span>
            ))
        } </div>

        { /* Footer: price + CTA */ } <div style = {
            {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.875rem',
                borderTop: '1px solid var(--border-subtle)',
            }
        }><div style = {
            { lineHeight: 1.1 }
        }><strong style = {
            {
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-black)',
                fontSize: '1.3rem',
                color: 'var(--chrome-300)',
                letterSpacing: '-0.02em',
            }
        }> { formatCurrency(vehicle.pricePerDay) } </strong><span style = {
            { fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }
        }>
        / day </span></div><Link to = { `/vehicles/${vehicle._id}` }
        className = "button button--ghost button--sm">
        View details </Link></div></div></article>
    );
}
