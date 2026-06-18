import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, CreditCard, XCircle } from 'lucide-react';
import { adminBookingApi, bookingApi, hostBookingApi, reviewApi } from '../../api/endpoints';
import ConfirmModal from '../../components/common/ConfirmModal';
import ErrorState from '../../components/common/ErrorState';
import PromptModal from '../../components/common/PromptModal';
import Spinner from '../../components/common/Spinner';
import ReviewForm from '../../components/forms/ReviewForm';
import VehicleGallery from '../../components/vehicles/VehicleGallery';
import { useAppSelector } from '../../hooks/redux';
import { formatCurrency, formatDate, getApiError, getStatusTone } from '../../utils/format';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', textAlign: 'right' }}>{value}</span>
  </div>
);

const getEntityId = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }

  return String(value);
};

const getBookingApiProvider = (role) => {
  const normalizedRole = String(role || '').toLowerCase();

  if (normalizedRole === 'admin') {
    return adminBookingApi;
  }

  if (normalizedRole === 'host') {
    return hostBookingApi;
  }

  return bookingApi;
};

const getBookingBackPath = (role) => {
  const normalizedRole = String(role || '').toLowerCase();

  if (normalizedRole === 'admin') {
    return '/admin/bookings';
  }

  if (normalizedRole === 'host') {
    return '/host/bookings';
  }

  return '/bookings';
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [cancelReason, setCancelReason] = useState('Plans changed');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [responseDraft, setResponseDraft] = useState(null);
  const [pendingComplete, setPendingComplete] = useState(false);
  const [hostSubmitting, setHostSubmitting] = useState(false);
  const [pendingRefund, setPendingRefund] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadBooking = useCallback(async (role = user?.role) => {
    setLoading(true);
    setError('');

    try {
      const response = await getBookingApiProvider(role).getById(id);
      setBooking(response.data?.data?.booking || null);
    } catch (apiError) {
      setError(getApiError(apiError, 'We could not load this booking.'));
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => {
    if (user?.role) {
      loadBooking(user.role);
    }
  }, [loadBooking, user?.role]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      return;
    }

    setCancelSubmitting(true);

    try {
      await getBookingApiProvider(user?.role).cancel(id, cancelReason.trim());
      toast.success('Booking cancelled.');
      setCancelModalOpen(false);
      setCancelReason('Plans changed');
      loadBooking();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not cancel this booking.'));
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleHostRespond = async (event) => {
    event.preventDefault();

    if (!responseDraft?.nextStatus) {
      return;
    }

    setHostSubmitting(true);

    try {
      await hostBookingApi.respond(id, {
        status: responseDraft.nextStatus,
        hostNotes: responseDraft.hostNotes.trim() || undefined,
      });
      toast.success(`Booking ${responseDraft.nextStatus}.`);
      setResponseDraft(null);
      loadBooking();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not update this booking.'));
    } finally {
      setHostSubmitting(false);
    }
  };

  const handleHostComplete = async () => {
    setHostSubmitting(true);

    try {
      await hostBookingApi.complete(id);
      toast.success('Booking marked as completed.');
      setPendingComplete(false);
      loadBooking();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not complete this booking.'));
    } finally {
      setHostSubmitting(false);
    }
  };

  const handleAdminRefund = async () => {
    setAdminSubmitting(true);

    try {
      await adminBookingApi.refund(id);
      toast.success('Refund started successfully.');
      setPendingRefund(false);
      loadBooking();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not refund this booking.'));
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleReviewSubmit = async (payload) => {
    setReviewSubmitting(true);

    try {
      await reviewApi.create({ bookingId: booking._id, rating: payload.rating, comment: payload.comment });
      toast.success('Review submitted.');
      setBooking((prev) => ({ ...prev, isReviewed: true }));
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not save your review.'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen label="Loading booking..." />;
  }

  if (error || !booking) {
    return (
      <div className="page-container">
        <ErrorState
          title="Booking unavailable"
          description={error || 'We could not find the requested booking.'}
          action={<Link to={getBookingBackPath(user?.role)} className="button button--ghost"><ArrowLeft size={14} /> Back to bookings</Link>}
        />
      </div>
    );
  }

  const userId = getEntityId(user?._id);
  const isCustomer = getEntityId(booking.customer) === userId;
  const isHost = getEntityId(booking.host) === userId;
  const isAdmin = user?.role === 'admin';
  const canCancel = (isCustomer || isHost) && ['pending', 'confirmed'].includes(booking.bookingStatus);
  const canReview = isCustomer && booking.bookingStatus === 'completed' && !booking.isReviewed;
  const canCheckout = isCustomer && booking.paymentStatus === 'unpaid' && ['pending', 'confirmed'].includes(booking.bookingStatus);
  const canConfirmReject = isHost && booking.bookingStatus === 'pending';
  const canComplete = isHost && booking.bookingStatus === 'confirmed';
  const canRefund = isAdmin && booking.bookingStatus === 'cancelled' && booking.paymentStatus === 'paid';

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to={getBookingBackPath(user?.role)} className="button button--ghost button--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to bookings
        </Link>
      </div>

      <div className="page-header">
        <span className="page-eyebrow">Account</span>
        <h1>Booking Details</h1>
        <p>Review trip details, payment state, and next actions for this reservation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>{booking.vehicle?.title || 'Vehicle'}</h3>
            <VehicleGallery images={booking.vehicle?.images || []} title={booking.vehicle?.title || 'Vehicle'} />
          </div>

          <div className="card">
            <div className="card-header"><h3>Trip Summary</h3></div>
            <div>
              <InfoRow label="Start date" value={formatDate(booking.startDate)} />
              <InfoRow label="End date" value={formatDate(booking.endDate)} />
              <InfoRow label="Total days" value={`${booking.totalDays} day(s)`} />
              <InfoRow label="Daily rate" value={<span style={{ fontFamily: 'var(--font-mono)', color: 'var(--chrome-300)' }}>{formatCurrency(booking.pricePerDay)}</span>} />
              <InfoRow label="Subtotal" value={<span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(booking.subtotal)}</span>} />
              <InfoRow label="Service fee" value={<span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(booking.serviceFee)}</span>} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--chrome-300)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--font-weight-black)', fontSize: '1.25rem', color: 'var(--chrome-300)', letterSpacing: '-0.02em' }}>
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              {booking.customerNotes ? (
                <div style={{ marginTop: '0.875rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer notes</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{booking.customerNotes}</p>
                </div>
              ) : null}
              {booking.hostNotes ? (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--gold-dim)', border: '1px solid var(--border-gold)' }}>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--chrome-500)', marginBottom: '0.25rem', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Host note</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--chrome-300)' }}>{booking.hostNotes}</p>
                </div>
              ) : null}
              {booking.cancellationReason ? (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--rose-400)', marginBottom: '0.25rem', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cancellation reason</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--rose-300)' }}>{booking.cancellationReason}</p>
                </div>
              ) : null}
            </div>
          </div>

          {canReview ? (
            <div className="card">
              <div className="card-header"><h3>Leave a Review</h3></div>
              <ReviewForm onSubmit={handleReviewSubmit} submitting={reviewSubmitting} />
            </div>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header"><h3>Status</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>Booking</span>
                <span className={`badge status-badge--${getStatusTone(booking.bookingStatus)}`}>{booking.bookingStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>Payment</span>
                <span className={`badge status-badge--${getStatusTone(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Contacts</h3></div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <InfoRow label="Customer" value={booking.customer?.name} />
              <InfoRow label="Customer email" value={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{booking.customer?.email}</span>} />
              <InfoRow label="Host" value={booking.host?.name} />
              <InfoRow label="Host email" value={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{booking.host?.email}</span>} />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Actions</h3></div>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {canCheckout ? (
                <Link to={`/checkout/${booking._id}`} className="button button--primary">
                  <CreditCard size={15} /> Continue to Payment
                </Link>
              ) : null}
              {canCancel ? (
                <button type="button" className="button button--danger" onClick={() => setCancelModalOpen(true)}>
                  <XCircle size={15} /> Cancel Booking
                </button>
              ) : null}
              {canConfirmReject ? (
                <>
                  <button type="button" className="button button--success" onClick={() => setResponseDraft({ nextStatus: 'confirmed', hostNotes: '' })}>
                    <CheckCircle size={15} /> Confirm Booking
                  </button>
                  <button type="button" className="button button--danger" onClick={() => setResponseDraft({ nextStatus: 'rejected', hostNotes: '' })}>
                    <XCircle size={15} /> Reject Booking
                  </button>
                </>
              ) : null}
              {canComplete ? (
                <button type="button" className="button button--primary" onClick={() => setPendingComplete(true)}>
                  <CheckCircle size={15} /> Mark as Complete
                </button>
              ) : null}
              {canRefund ? (
                <button type="button" className="button button--danger" onClick={() => setPendingRefund(true)}>
                  Refund Payment
                </button>
              ) : null}
              <button type="button" className="button button--ghost" onClick={() => navigate(getBookingBackPath(user?.role))}>
                <ArrowLeft size={14} /> Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      <PromptModal
        open={cancelModalOpen}
        title="Cancel Booking"
        message="Share a short reason for the cancellation. The other party will be notified."
        label="Cancellation reason"
        value={cancelReason}
        onChange={setCancelReason}
        onClose={() => {
          if (cancelSubmitting) return;
          setCancelModalOpen(false);
          setCancelReason('Plans changed');
        }}
        onSubmit={(event) => {
          event.preventDefault();
          handleCancel();
        }}
        submitLabel={cancelSubmitting ? 'Cancelling...' : 'Cancel booking'}
        placeholder="Plans changed"
        disabled={cancelSubmitting}
        required
      />

      <PromptModal
        open={Boolean(responseDraft)}
        title={responseDraft?.nextStatus === 'confirmed' ? 'Confirm Booking' : 'Reject Booking'}
        message={`Add an optional note for this ${responseDraft?.nextStatus || 'booking'} action.`}
        label="Host note"
        value={responseDraft?.hostNotes || ''}
        onChange={(value) => setResponseDraft((prev) => (prev ? { ...prev, hostNotes: value } : prev))}
        onClose={() => {
          if (hostSubmitting) return;
          setResponseDraft(null);
        }}
        onSubmit={handleHostRespond}
        submitLabel={
          hostSubmitting
            ? responseDraft?.nextStatus === 'confirmed'
              ? 'Confirming...'
              : 'Rejecting...'
            : responseDraft?.nextStatus === 'confirmed'
              ? 'Confirm booking'
              : 'Reject booking'
        }
        placeholder="Optional message for the customer"
        disabled={hostSubmitting}
      />

      <ConfirmModal
        open={pendingComplete}
        title="Complete Booking"
        message="Mark this booking as completed?"
        confirmLabel="Complete booking"
        confirmTone="primary"
        onClose={() => setPendingComplete(false)}
        onConfirm={handleHostComplete}
        disabled={hostSubmitting}
      />

      <ConfirmModal
        open={pendingRefund}
        title="Refund Booking"
        message="Issue a refund for this cancelled booking?"
        confirmLabel="Start refund"
        confirmTone="danger"
        onClose={() => setPendingRefund(false)}
        onConfirm={handleAdminRefund}
        disabled={adminSubmitting}
      />
    </div>
  );
}
