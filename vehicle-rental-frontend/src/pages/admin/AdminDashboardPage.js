import { useEffect, useState } from 'react';
import { Calendar, DollarSign, Layers3, Truck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminDashboardApi } from '../../api/endpoints';
import AdminSectionNav from '../../components/admin/AdminSectionNav';
import ErrorState from '../../components/common/ErrorState';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, getApiError } from '../../utils/format';

const dashboardCards = (dashboard) => [
  {
    label: 'Users',
    value: dashboard.users?.total || 0,
    hint: `${dashboard.users?.hosts || 0} hosts / ${dashboard.users?.customers || 0} customers`,
    icon: <Users size={18} />,
  },
  {
    label: 'Pending Hosts',
    value: dashboard.users?.pendingHosts || 0,
    hint: 'Accounts awaiting approval',
    icon: <Layers3 size={18} />,
  },
  {
    label: 'Vehicles',
    value: dashboard.vehicles?.total || 0,
    hint: `${dashboard.vehicles?.active || 0} active listings`,
    icon: <Truck size={18} />,
  },
  {
    label: 'Bookings',
    value: dashboard.bookings?.total || 0,
    hint: `${dashboard.bookings?.completed || 0} completed / ${dashboard.bookings?.cancelled || 0} cancelled`,
    icon: <Calendar size={18} />,
  },
  {
    label: 'Revenue',
    value: formatCurrency(dashboard.revenue?.total || 0),
    hint: `Fees ${formatCurrency(dashboard.revenue?.platformFees || 0)} / Host payouts ${formatCurrency(dashboard.revenue?.hostPayouts || 0)}`,
    icon: <DollarSign size={18} />,
  },
];

const formatMonthLabel = (entry) => {
  const year = entry?._id?.year;
  const month = entry?._id?.month;

  if (!year || !month) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await adminDashboardApi.get();
        setDashboard(response.data?.data || null);
      } catch (apiError) {
        setError(getApiError(apiError, 'We could not load the admin dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Spinner fullScreen label="Loading admin dashboard..." />;
  }

  if (error || !dashboard) {
    return (
      <div className="page-container page-container--admin">
        <ErrorState title="Dashboard unavailable" description={error} />
      </div>
    );
  }

  const monthlyActivity = dashboard.bookingsByMonth || [];
  const maxMonthlyBookings = Math.max(...monthlyActivity.map((entry) => entry.count || 0), 1);

  return (
    <div className="page-container page-container--admin">
      <div className="page-header page-header--admin">
        <span className="page-eyebrow">Admin control center</span>
        <h1>Admin Dashboard</h1>
        <p>Track platform-wide activity across users, inventory, bookings, and revenue.</p>
      </div>

      <AdminSectionNav />

      <div className="dashboard-grid">
        {dashboardCards(dashboard).map((card) => (
          <div key={card.label} className="card admin-metric-card">
            <span className="admin-metric-card__icon">{card.icon}</span>
            <div className="admin-metric-card__content">
              <p className="admin-metric-card__label">{card.label}</p>
              <h2 className="admin-metric-card__value">{card.value}</h2>
              <p className="admin-metric-card__hint">{card.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel-grid">
        <div className="card">
          <div className="section-heading__content" style={{ marginBottom: '1rem' }}>
            <h3>Management Shortcuts</h3>
            <p className="muted-text">Jump into the areas that need the most attention.</p>
          </div>
          <div className="admin-shortcuts">
            <Link to="/admin/users" className="button button--primary">Review users</Link>
            <Link to="/admin/vehicles" className="button button--ghost">Audit vehicles</Link>
            <Link to="/admin/bookings" className="button button--ghost">Monitor bookings</Link>
            <Link to="/admin/categories" className="button button--ghost">Manage categories</Link>
          </div>
        </div>

        <div className="card">
          <div className="section-heading__content" style={{ marginBottom: '1rem' }}>
            <h3>Platform Snapshot</h3>
            <p className="muted-text">A quick operational breakdown for the current admin session.</p>
          </div>
          <div className="admin-summary-list">
            <div className="admin-summary-row">
              <span>Pending host approvals</span>
              <span className="badge badge-warning">{dashboard.users?.pendingHosts || 0}</span>
            </div>
            <div className="admin-summary-row">
              <span>Active vehicles</span>
              <span className="badge badge-success">{dashboard.vehicles?.active || 0}</span>
            </div>
            <div className="admin-summary-row">
              <span>Completed bookings</span>
              <span className="badge badge-success">{dashboard.bookings?.completed || 0}</span>
            </div>
            <div className="admin-summary-row">
              <span>Cancelled bookings</span>
              <span className="badge badge-danger">{dashboard.bookings?.cancelled || 0}</span>
            </div>
            <div className="admin-summary-row">
              <span>Platform fees collected</span>
              <strong>{formatCurrency(dashboard.revenue?.platformFees || 0)}</strong>
            </div>
            <div className="admin-summary-row">
              <span>Host payouts earned</span>
              <strong>{formatCurrency(dashboard.revenue?.hostPayouts || 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-heading__content" style={{ marginBottom: '1rem' }}>
          <h3>Booking Activity by Month</h3>
          <p className="muted-text">Latest six months returned from the admin analytics endpoint.</p>
        </div>

        {monthlyActivity.length === 0 ? (
          <p className="muted-text">No booking activity is available yet.</p>
        ) : (
          <div className="admin-activity-list">
            {monthlyActivity.map((entry) => (
              <div key={`${entry._id?.year}-${entry._id?.month}`} className="admin-activity-row">
                <div className="info-stack">
                  <strong>{formatMonthLabel(entry)}</strong>
                  <p className="muted-text">{entry.count || 0} booking(s)</p>
                </div>
                <div className="admin-activity-row__bar">
                  <span
                    className="admin-activity-row__fill"
                    style={{ width: `${((entry.count || 0) / maxMonthlyBookings) * 100}%` }}
                  />
                </div>
                <strong>{formatCurrency(entry.revenue || 0)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
