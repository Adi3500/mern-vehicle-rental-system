import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bookingApi, paymentApi } from '../../api/endpoints';
import ErrorState from '../../components/common/ErrorState';
import Spinner from '../../components/common/Spinner';
import CheckoutForm from '../../components/payments/CheckoutForm';
import { formatCurrency, formatDate, formatDateTime, getApiError, getStatusTone } from '../../utils/format';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>{value}</span>
  </div>
);

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [paymentSetup, setPaymentSetup] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCheckout = async () => {
      setLoading(true);
      setError('');
      try {
        const bookingResponse = await bookingApi.getById(bookingId);
        const nextBooking = bookingResponse.data?.data?.booking || null;
        setBooking(nextBooking);
        if (!nextBooking) { setError('Booking not found.'); return; }
        const paymentResponse = await paymentApi.createIntent(bookingId);
        setPaymentSetup(paymentResponse.data?.data || null);
        setTransaction(paymentResponse.data?.data?.transaction || null);
      } catch (apiError) {
        setError(getApiError(apiError, 'We could not prepare checkout.'));
      } finally {
        setLoading(false);
      }
    };
    loadCheckout();
  }, [bookingId]);

  const handleSuccess = (payload) => {
    setBooking(payload?.booking || booking);
    setTransaction(payload?.transaction || null);
    toast.success(payload?.message || 'Payment completed successfully.');
  };

  if (loading) return <Spinner fullScreen label="Preparing checkout..." />;

  if (error || !booking) {
    return (
      <div className="page-container">
        <ErrorState
          title="Checkout unavailable"
          description={error || 'We could not prepare checkout for this booking.'}
          action={<Link to="/bookings" className="button button--ghost"><ArrowLeft size={14} /> Back to bookings</Link>}
        />
      </div>
    );
  }

  const isPaid = booking.paymentStatus === 'paid';

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/bookings/${booking._id}`} className="button button--ghost button--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to booking
        </Link>
      </div>

      <div className="page-header">
        <span className="page-eyebrow">Account</span>
        <h1>Checkout</h1>
        <p>Complete payment for your vehicle booking using the demo card form.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left: form or success */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Booking summary */}
          <div className="card">
            <div className="card-header"><h3>Booking Summary</h3></div>
            <InfoRow label="Vehicle" value={<strong style={{ color: 'var(--text-primary)' }}>{booking.vehicle?.title || 'Vehicle'}</strong>} />
            <InfoRow label="Trip" value={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>} />
            <InfoRow label="Booking status" value={<span className={`badge status-badge--${getStatusTone(booking.bookingStatus)}`}>{booking.bookingStatus}</span>} />
            <InfoRow label="Payment" value={<span className={`badge status-badge--${getStatusTone(booking.paymentStatus)}`}>{booking.paymentStatus}</span>} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', marginTop: '0.25rem' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--chrome-300)' }}>Total due</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--font-weight-black)', fontSize: '1.3rem', color: 'var(--chrome-300)', letterSpacing: '-0.02em' }}>
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Payment completed */}
          {isPaid && transaction ? (
            <div className="card" style={{ border: '1px solid rgba(52,211,153,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jade-400)', flexShrink: 0 }}>
                  <CheckCircle size={15} />
                </span>
                <h3 style={{ margin: 0 }}>Payment Confirmed</h3>
              </div>
              <InfoRow label="Reference" value={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{transaction.metadata?.reference || transaction._id}</span>} />
              <InfoRow label="Amount" value={<span style={{ fontFamily: 'var(--font-mono)', color: 'var(--jade-300)' }}>{formatCurrency(transaction.amount)}</span>} />
              <InfoRow label="Status" value={<span className={`badge status-badge--${getStatusTone(transaction.status)}`}>{transaction.status}</span>} />
              <InfoRow label="Card" value={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>Demo ···· {transaction.metadata?.cardLast4 || '----'}</span>} />
              <InfoRow label="Card holder" value={transaction.metadata?.cardHolderName || 'N/A'} />
              <InfoRow label="Paid at" value={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{formatDateTime(booking.paidAt || transaction.createdAt)}</span>} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <Link to={`/bookings/${booking._id}`} className="button button--primary">View Booking</Link>
                <button type="button" className="button button--ghost" onClick={() => navigate(`/bookings/${bookingId}`, { replace: true })}>
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <CheckoutForm bookingId={bookingId} onSuccess={handleSuccess} />
          )}
        </div>

        {/* Right: helpers */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card" style={{ border: '1px solid rgba(56,189,248,0.2)', background: 'linear-gradient(160deg, rgba(56,189,248,0.04) 0%, var(--obsidian-900) 100%)' }}>
            <h3 style={{ marginBottom: '0.875rem', fontSize: '0.95rem' }}>Demo Instructions</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                'Any numeric card number works.',
                'Example: 4242 4242 4242 4242',
                'Any future expiry and 3-digit CVV.',
                'This marks the booking paid and creates a transaction in your DB.',
              ].map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--sky-400)', fontSize: '0.7rem', marginTop: '0.2rem', flexShrink: 0 }}>✦</span>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '0.875rem', fontSize: '0.95rem' }}>Quick Links</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <Link to={`/bookings/${booking._id}`} className="button button--ghost button--sm">← Back to booking</Link>
              <Link to="/" className="button button--ghost button--sm">Browse more vehicles</Link>
            </div>
          </div>

          {paymentSetup ? (
            <div className="card">
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Mode: <span style={{ color: 'var(--chrome-500)' }}>{paymentSetup.mode || 'dummy'}</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}