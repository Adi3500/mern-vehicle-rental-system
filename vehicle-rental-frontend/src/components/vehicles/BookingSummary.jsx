import { calculateEstimate, formatCurrency } from '../../utils/format';

export default function BookingSummary({ vehicle, startDate, endDate }) {
    const estimate = calculateEstimate(vehicle, startDate, endDate);

    const rows = [
        { label: 'Daily rate', value: formatCurrency(vehicle?.pricePerDay), mono: true },
        { label: 'Trip length', value: `${estimate.days || 0} day(s)`, mono: true },
        { label: 'Subtotal', value: formatCurrency(estimate.subtotal), mono: true },
        { label: 'Service fee', value: formatCurrency(estimate.serviceFee), mono: true },
    ];

    return (<div className = "card"
        style = {
            {
                border: '1px solid var(--border-gold)',
                background: 'linear-gradient(160deg, var(--obsidian-800) 0%, var(--obsidian-900) 100%)',
            }
        }> { /* Header */ } <div style = {
            {
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
            }
        }><span style = {
            {
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
            }
        }> 🧾
        </span><h3 style = {
            {
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '1rem',
                color: 'var(--text-primary)',
            }
        }>
        Trip estimate </h3></div>

        { /* Rows */ } <div style = {
            { display: 'grid', gap: '0.5rem', marginBottom: '1rem' }
        }> {
            rows.map(({ label, value, mono }) => (<div key = { label }
                style = {
                    {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                    }
                }><span style = {
                    { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }
                }> { label } </span><strong style = {
                    {
                        fontSize: 'var(--font-size-sm)',
                        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
                        color: 'var(--text-secondary)',
                    }
                }> { value } </strong></div>
            ))
        } </div>

        { /* Total */ } <div style = {
            {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                marginBottom: '1rem',
            }
        }><span style = {
            {
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--chrome-300)',
                fontSize: 'var(--font-size-sm)',
            }
        }>
        Total estimate </span><strong style = {
            {
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-black)',
                fontSize: '1.4rem',
                color: 'var(--chrome-300)',
                letterSpacing: '-0.02em',
            }
        }> { formatCurrency(estimate.total) } </strong></div><p style = {
            {
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: 0,
            }
        }>
        Final pricing is calculated and enforced by the backend at booking creation. </p></div>
    );
}