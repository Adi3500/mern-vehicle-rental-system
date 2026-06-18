export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      {icon && (
        <span
          className="empty-state-icon"
          style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}
        >
          {icon}
        </span>
      )}
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
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