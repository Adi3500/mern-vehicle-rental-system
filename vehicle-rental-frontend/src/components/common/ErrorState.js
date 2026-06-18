export default function ErrorState({
  title = 'Unable to load this section.',
  description,
  action,
}) {
  return (
    <div className="error-state card" role="alert" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
      <div
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          fontSize: '1.4rem',
        }}
      >
        &#9888;
      </div>
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      {description && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--font-size-sm)',
            maxWidth: '28rem',
            margin: '0 auto 1.25rem',
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}