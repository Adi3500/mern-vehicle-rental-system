import { useCallback, useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminBookingApi } from '../../api/endpoints';
import AdminSectionNav from '../../components/admin/AdminSectionNav';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, getApiError, getStatusTone } from '../../utils/format';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [pendingRefund, setPendingRefund] = useState(null);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminBookingApi.list({
        status: status || undefined,
        page,
        limit: 10,
      });

      setBookings(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (apiError) {
      setError(getApiError(apiError, 'We could not load admin bookings.'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const closePendingRefund = () => {
    if (processingId) return;
    setPendingRefund(null);
  };

  const confirmPendingRefund = async () => {
    if (!pendingRefund) {
      return;
    }

    setProcessingId(pendingRefund._id);

    try {
      await adminBookingApi.refund(pendingRefund._id);
      toast.success('Refund started successfully.');
      setPendingRefund(null);
      loadBookings();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not refund this booking.'));
    } finally {
      setProcessingId('');
    }
  };

  return (
    <div className="page-container page-container--admin">
      <div className="page-header page-header--admin">
        <span className="page-eyebrow">Trip oversight</span>
        <h1>Booking Management</h1>
        <p>Monitor trip lifecycle and issue refunds for cancelled, paid bookings when needed.</p>
      </div>

      <AdminSectionNav />

      <div className="card admin-toolbar-card">
        <div className="admin-toolbar">
          <label className="field" style={{ minWidth: '220px' }}>
            <span>Status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <div className="admin-toolbar__actions">
            <button type="button" className="button button--ghost" onClick={loadBookings}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner label="Loading admin bookings..." /> : null}
      {error ? <ErrorState title="Bookings unavailable" description={error} /> : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="No bookings match the current admin filters."
        />
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <div className="card">
          <div className="admin-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Host</th>
                  <th>Trip</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const busy = processingId === booking._id;
                  const canRefund = booking.bookingStatus === 'cancelled' && booking.paymentStatus === 'paid';

                  return (
                    <tr key={booking._id}>
                      <td>
                        <div className="info-stack">
                          <strong>{booking._id.slice(-8).toUpperCase()}</strong>
                          <span className={`badge badge-${getStatusTone(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td>{booking.vehicle?.title || 'Vehicle'}</td>
                      <td>{booking.customer?.name || 'Customer'}</td>
                      <td>{booking.host?.name || 'Host'}</td>
                      <td>{formatDate(booking.startDate)} to {formatDate(booking.endDate)}</td>
                      <td>
                        <span className={`badge badge-${getStatusTone(booking.bookingStatus)}`}>
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="table-value">{formatCurrency(booking.totalPrice)}</td>
                      <td>
                        <div className="inline-actions">
                          <Link
                            to={`/bookings/${booking._id}`}
                            className="inline-flex items-center justify-center text-slate-300 transition-colors hover:text-sky-300"
                            aria-label="View booking"
                            title="View"
                          >
                            <Eye size={18} strokeWidth={2.25} />
                          </Link>
                          {canRefund ? (
                            <button
                              type="button"
                              className="button button--danger"
                              onClick={() => setPendingRefund(booking)}
                              disabled={busy}
                            >
                              Refund
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(pendingRefund)}
        title="Refund Booking"
        message={`Issue a refund for booking ${pendingRefund?._id}?`}
        confirmLabel="Start refund"
        confirmTone="danger"
        onClose={closePendingRefund}
        onConfirm={confirmPendingRefund}
        disabled={Boolean(processingId)}
      />
    </div>
  );
}
