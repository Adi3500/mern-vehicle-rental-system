export default function RecentBookings({ bookings }) {
  const statusStyle = (status) => {
    const normalizedStatus = String(status || '').toLowerCase();

    if (['confirmed', 'completed', 'active'].includes(normalizedStatus)) {
      return {
        background: 'rgba(52,211,153,0.12)',
        border: '1px solid rgba(52,211,153,0.25)',
        color: 'var(--jade-300)',
      };
    }

    if (['cancelled', 'rejected'].includes(normalizedStatus)) {
      return {
        background: 'rgba(248,113,113,0.1)',
        border: '1px solid rgba(248,113,113,0.22)',
        color: 'var(--rose-300)',
      };
    }

    if (normalizedStatus === 'pending') {
      return {
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.22)',
        color: 'var(--amber-400)',
      };
    }

    return {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-secondary)',
    };
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Recent Bookings</h3>
      </div>

      {bookings && bookings.length > 0 ? (
        <div
          className="admin-table-wrap"
          style={{ border: 'none', background: 'transparent', boxShadow: 'none', borderRadius: 0 }}
        >
          <table className="table" style={{ minWidth: 'auto' }}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={index}>
                  <td
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {booking.customer}
                  </td>
                  <td>{booking.vehicle}</td>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    {booking.date}
                  </td>
                  <td className="table-value">{booking.amount}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        ...statusStyle(booking.status),
                      }}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p
          style={{
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '2rem',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          No bookings yet
        </p>
      )}
    </div>
  );
}
