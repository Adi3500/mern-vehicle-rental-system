import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CalendarCheck } from 'lucide-react';
import { earningsApi } from '../../api/endpoints';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, getApiError } from '../../utils/format';

export default function HostEarningsPage() {
    const [summary, setSummary] = useState({ totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 });
    const [byMonth, setByMonth] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEarnings = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await earningsApi.get({...filters, page, limit: 10 });
                setSummary(response.data?.data?.summary || { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 });
                setByMonth(response.data?.data?.byMonth || []);
                setBookings(response.data?.data?.bookings || []);
                setPagination(response.data?.data?.pagination || null);
            } catch (apiError) {
                setError(getApiError(apiError, 'We could not load earnings.'));
            } finally {
                setLoading(false);
            }
        };
        loadEarnings();
    }, [filters, page]);

    const maxMonthRevenue = Math.max(...byMonth.map((m) => m.revenue || 0), 1);

    const statCards = [{
            label: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
            icon: <DollarSign size = { 18 } />,
            accent: 'green',
        },
        {
            label: 'Paid Bookings',
            value: summary.totalBookings,
            icon: <CalendarCheck size = { 18 } />,
            accent: 'blue',
        },
        {
            label: 'Avg Booking Value',
            value: formatCurrency(summary.avgBookingValue),
            icon: <TrendingUp size = { 18 } />,
            accent: 'gold',
        },
    ];

    const accentColors = {
        blue: { border: 'rgba(56,189,248,0.5)', bg: 'rgba(56,189,248,0.1)', color: 'var(--sky-300)' },
        green: { border: 'rgba(52,211,153,0.5)', bg: 'rgba(52,211,153,0.1)', color: 'var(--jade-300)' },
        gold: { border: 'var(--chrome-500)', bg: 'var(--gold-dim)', color: 'var(--chrome-400)' },
    };

    const fieldStyle = { display: 'grid', gap: '0.4rem' };
    const labelStyle = {
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
    };

    return (<div className = "page-container"><div className = "page-header"><span className = "page-eyebrow"> Host workspace </span><h1> Earnings </h1><p> Track paid bookings and host revenue from the backend earnings service. </p></div>

        { /* Date filter */ } <div className = "card admin-toolbar-card"
        style = {
            { marginBottom: '1.25rem' }
        }><div className = "toolbar-row"
        style = {
            { flexWrap: 'wrap', gap: '1rem' }
        }><label style = { fieldStyle }><span style = { labelStyle }> Start date </span><input type = "date"
        className = "form-control"
        value = { filters.startDate }
        onChange = {
            (event) => {
                setFilters((prev) => ({...prev, startDate: event.target.value }));
                setPage(1);
            }
        } /></label><label style = { fieldStyle }><span style = { labelStyle }> End date </span><input type = "date"
        className = "form-control"
        value = { filters.endDate }
        onChange = {
            (event) => {
                setFilters((prev) => ({...prev, endDate: event.target.value }));
                setPage(1);
            }
        } /></label> {
            (filters.startDate || filters.endDate) && (<div style = {
                    { display: 'flex', alignItems: 'flex-end' }
                }><button type = "button"
                className = "button button--ghost button--sm"
                onClick = {
                    () => {
                        setFilters({ startDate: '', endDate: '' });
                        setPage(1);
                    }
                }>
                Clear dates </button></div>
            )
        } </div></div>

        { loading ? <Spinner label = "Loading earnings..." /> : null } {
            error ? <ErrorState title = "Earnings unavailable"
            description = { error } /> : null}

            {
                !loading && !error ? (<>
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
                                }> { card.icon } </span><div className = "stat-card__label"> { card.label } </div><strong className = "stat-card__value"> { card.value } </strong></div>
                            );
                        })
                    } </div><div style = {
                        { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }
                    }> { /* Monthly revenue chart */ } <div className = "card"><div className = "card-header"><h3> Monthly Revenue </h3></div> {
                        byMonth.length === 0 ? (<p className = "muted-text"
                            style = {
                                { fontSize: 'var(--font-size-sm)' }
                            }> No monthly earnings yet. </p>
                        ) : (<div className = "admin-activity-list"
                            style = {
                                { display: 'grid', gap: '0.5rem' }
                            }> {
                                byMonth.map((item) => (<div key = { `${item._id.year}-${item._id.month}` }
                                    className = "admin-activity-row"><div className = "info-stack"><strong style = {
                                        { fontSize: 'var(--font-size-sm)' }
                                    }> {
                                        new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })
                                        .format(new Date(item._id.year, item._id.month - 1, 1))
                                    } </strong><p className = "muted-text"
                                    style = {
                                        { fontSize: 'var(--font-size-xs)' }
                                    }> { item.count || 0 }
                                    booking(s) </p></div><div className = "admin-activity-row__bar"><span className = "admin-activity-row__fill"
                                    style = {
                                        { width: `${((item.revenue || 0) / maxMonthRevenue) * 100}%` }
                                    } /></div><strong style = {
                                        { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--chrome-300)' }
                                    }> { formatCurrency(item.revenue) } </strong></div>
                                ))
                            } </div>
                        )
                    } </div>

                    { /* Paid bookings table */ } <div className = "card"><div className = "card-header"><h3> Paid Bookings </h3></div><div className = "admin-table-wrap"
                    style = {
                        { border: 'none', background: 'transparent', boxShadow: 'none', borderRadius: 0 }
                    }><table className = "table"
                    style = {
                        { minWidth: 'auto' }
                    }><thead><tr><th> Vehicle </th><th> Customer </th><th> Paid </th><th> Subtotal </th></tr></thead><tbody> {
                        bookings.length === 0 ? (<tr><td colSpan = { 4 }
                            style = {
                                { textAlign: 'center', color: 'var(--text-muted)' }
                            }>
                            No paid bookings yet. </td></tr>
                        ) : bookings.map((booking) => (<tr key = { booking._id }><td style = {
                                { fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }
                            }> { booking.vehicle?.title || 'Vehicle' } </td><td> { booking.customer?.name || 'Customer' } </td><td style = {
                                { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }
                            }> { formatDate(booking.paidAt) } </td><td className = "table-value"> { formatCurrency(booking.subtotal) } </td></tr>
                        ))
                    } </tbody></table></div><Pagination pagination = { pagination }
                    onPageChange = { setPage } /></div></div></>
                ) : null
            } </div>
        );
    }