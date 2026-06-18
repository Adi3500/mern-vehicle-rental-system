import { useState } from 'react';
import { CreditCard, Lock, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { paymentApi } from '../../api/endpoints';
import { getApiError } from '../../utils/format';

const initialState = {
  cardHolderName: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
};

export default function CheckoutForm({ bookingId, onSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await paymentApi.process(bookingId, formData);
      toast.success(response.data?.message || 'Dummy payment completed successfully.');
      onSuccess(response.data);
    } catch (error) {
      toast.error(getApiError(error, 'We could not complete the dummy payment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyle = { display: 'grid', gap: '0.4rem' };
  const labelStyle = {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  return (
    <form
      className="card"
      onSubmit={handleSubmit}
      style={{
        border: '1px solid var(--border-gold)',
        background: 'linear-gradient(160deg, var(--obsidian-800) 0%, var(--obsidian-900) 100%)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gold-dim)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--chrome-400)',
          }}
        >
          <CreditCard size={14} />
        </span>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: '1rem',
            color: 'var(--text-primary)',
          }}
        >
          Complete dummy payment
        </h3>
      </div>

      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        Enter demo card details below. This will mark the booking as paid and generate a transaction record.
      </p>

      {/* Demo card notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.65rem 0.875rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(56,189,248,0.07)',
          border: '1px solid rgba(56,189,248,0.2)',
          marginBottom: '1.25rem',
        }}
      >
        <Shield size={13} style={{ color: 'var(--sky-300)', flexShrink: 0 }} />
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--sky-300)', margin: 0, lineHeight: 1.5 }}>
          Demo mode — use any values. No real charges will be made.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Card holder */}
        <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
          <span style={labelStyle}>Card holder name</span>
          <input
            className="form-control"
            name="cardHolderName"
            value={formData.cardHolderName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </label>

        {/* Card number */}
        <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
          <span style={labelStyle}>Card number</span>
          <input
            className="form-control"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="4242 4242 4242 4242"
            required
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
          />
        </label>

        {/* Expiry month */}
        <label style={fieldStyle}>
          <span style={labelStyle}>Expiry month</span>
          <input
            className="form-control"
            name="expiryMonth"
            value={formData.expiryMonth}
            onChange={handleChange}
            placeholder="12"
            required
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </label>

        {/* Expiry year */}
        <label style={fieldStyle}>
          <span style={labelStyle}>Expiry year</span>
          <input
            className="form-control"
            name="expiryYear"
            value={formData.expiryYear}
            onChange={handleChange}
            placeholder="2028"
            required
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </label>

        {/* CVV */}
        <label style={fieldStyle}>
          <span style={labelStyle}>CVV</span>
          <input
            className="form-control"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            placeholder="123"
            required
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </label>
      </div>

      <button
        className="button button--primary button--block"
        type="submit"
        disabled={isSubmitting}
        style={{ gap: '0.5rem' }}
      >
        <Lock size={14} />
        {isSubmitting ? 'Processing dummy payment…' : 'Pay now'}
      </button>
    </form>
  );
}