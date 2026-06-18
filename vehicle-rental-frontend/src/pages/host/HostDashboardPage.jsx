import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Car, DollarSign, CalendarDays } from 'lucide-react';
import { earningsApi, hostBookingApi, hostVehicleApi } from '../../api/endpoints';
import ErrorState from '../../components/common/ErrorState';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, getApiError } from '../../utils/format';

const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (['confirmed', 'completed', 'active'].includes(s))
        return { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: 'var(--jade-300)' };
    if (['cancelled', 'rejected'].includes(s))
        return { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.22)', color: 'var(--rose-300)' };
    if (s === 'pending')
        return { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.22)', color: 'var(--amber-400)' };
    return { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' };
};

export default function HostDashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            setError('');
            try {
                const [vehiclesResponse, bookingsResponse, earningsResponse] = await Promise.all([
                    hostVehicleApi.list({ page: 1, limit: 5 }),
                    hostBookingApi.list({ page: 1, limit: 5 }),
                    earningsApi.get({ page: 1, limit: 5 }),
                ]);
                setDashboard({
                    vehicles: vehiclesResponse.data?.data || [],
                    bookings: bookingsResponse.data?.data || [],
                    summary: earningsResponse.data?.data?.summary || { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 },
                    earningsBookings: earningsResponse.data?.data?.bookings || [],
                });
            } catch (apiError) {
                setError(getApiError(apiError, 'We could not load the host dashboard.'));
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <Spinner fullScreen label = "Loading host dashboard..." /> ;

    if (error || !dashboard) {
        return (<div className = "page-container"><ErrorState title = "Dashboard unavailable"
            description = { error } /></div>
        );
    }

    const activeVehicles = dashboard.vehicles.filter((v) => v.status === 'active').length;
    const pendingBookings = dashboard.bookings.filter((b) => b.bookingStatus === 'pending').length;

    const statCards = [{
            label: 'Total Vehicles',
            value: dashboard.vehicles.length,
            hint: `${activeVehicles} active listings`,
            icon: <Car size = { 18 } />,
            accent: 'blue',
            link: '/host/vehicles',
        },
        {
            label: 'Recent Bookings',
            value: dashboard.bookings.length,
            hint: `${pendingBookings} pending responses`,
            icon: <CalendarDays size = { 18 } />,
            accent: 'gold',
            link: '/host/bookings',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(dashboard.summary.totalRevenue),
            hint: `${dashboard.summary.totalBookings} paid booking(s)`,
            icon: <DollarSign size = { 18 } />,
            accent: 'green',
            link: '/host/earnings',
        },
        {
            label: 'Avg Booking Value',
            value: formatCurrency(dashboard.summary.avgBookingValue),
            hint: 'Based on paid trips',
            icon: <BarChart2 size = { 18 } />,
            accent: 'blue',
            link: '/host/earnings',
        },
    ];

    const accentColors = {
        blue: { border: 'rgba(56,189,248,0.5)', bg: 'rgba(56,189,248,0.1)', color: 'var(--sky-300)' },
        green: { border: 'rgba(52,211,153,0.5)', bg: 'rgba(52,211,153,0.1)', color: 'var(--jade-300)' },
        gold: { border: 'var(--chrome-500)', bg: 'var(--gold-dim)', color: 'var(--chrome-400)' },
    };

    return (<div className = "page-container"><div className = "page-header"
        style = {
            { marginBottom: '1.5rem' }
        }><span className = "page-eyebrow"> Host workspace </span><h1> Host Dashboard </h1><p> High - level activity pulled from your vehicles, bookings, and earnings. </p></div>

        { /* Stat cards */ } <div className = "dashboard-grid"
        style = {
            { marginBottom: '1.5rem' }
        }> {
            statCards.map((card) => {
                const colors = accentColors[card.accent] || accentColors.blue;
                return (<div key = { card.label }
                    className = { `stat-card stat-card--${card.accent}` }
                    style = {
                        { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
                    }><span className = "stat-card-icon"
                    style = {
                        { background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color, marginBottom: '0.5rem' }
                    }> { card.icon } </span><div className = "stat-card__label"> { card.label } </div><strong className = "stat-card__value"> { card.value } </strong><span className = "stat-card__hint"> { card.hint } </span></div>
                );
            })
        } </div>

        { /* Two-column panels */ } <div style = {
            { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }
        }> { /* Vehicles */ } <div className = "card"><div className = "card-header"><div><h3> Your Vehicles </h3><p className = "muted-text"
        style = {
            { margin: 0 }
        }> Latest listings </p></div><Link to = "/host/vehicles"
        className = "button button--ghost button--sm"> Manage </Link></div><div style = {
            { display: 'grid', gap: '0.6rem' }
        }> {
            dashboard.vehicles.length === 0 ? (<p className = "muted-text"
                style = {
                    { fontSize: 'var(--font-size-sm)' }
                }> No vehicles yet. </p>
            ) : dashboard.vehicles.map((vehicle) => (<div key = { vehicle._id }
                style = {
                    {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid var(--border-subtle)',
                    }
                }><div><strong style = {
                    { display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }
                }> { vehicle.title } </strong><span style = {
                    { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }
                }> { vehicle.location?.city }, { vehicle.location?.country } </span></div><span style = {
                    {
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.65rem',
                        fontWeight: 'var(--font-weight-semibold)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        ...getStatusStyle(vehicle.status),
                    }
                }> { vehicle.status } </span></div>
            ))
        } </div></div>

        { /* Bookings */ } <div className = "card"><div className = "card-header"><div><h3> Booking Activity </h3><p className = "muted-text"
        style = {
            { margin: 0 }
        }> Most recent requests </p></div><Link to = "/host/bookings"
        className = "button button--ghost button--sm"> Open </Link></div><div style = {
            { display: 'grid', gap: '0.6rem' }
        }> {
            dashboard.bookings.length === 0 ? (<p className = "muted-text"
                style = {
                    { fontSize: 'var(--font-size-sm)' }
                }> No bookings yet. </p>
            ) : dashboard.bookings.map((booking) => (<div key = { booking._id }
                style = {
                    {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid var(--border-subtle)',
                    }
                }><div><strong style = {
                    { display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }
                }> { booking.vehicle?.title || 'Vehicle' } </strong><span style = {
                    { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }
                }> { booking.customer?.name || 'Customer' }· { formatDate(booking.startDate) } </span></div><span style = {
                    {
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.65rem',
                        fontWeight: 'var(--font-weight-semibold)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        ...getStatusStyle(booking.bookingStatus),
                    }
                }> { booking.bookingStatus } </span></div>
            ))
        } </div></div></div></div>
    );
}
