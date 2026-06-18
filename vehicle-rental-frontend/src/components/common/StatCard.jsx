export default function StatCard({ label, value, hint, accent = 'blue' }) {
  return (<article className={`stat-card stat-card--${accent}`}><span className="stat-card__label">{label}</span><strong className="stat-card__value">{value}</strong>
      {hint ? <span className="stat-card__hint">{hint}</span> : null}
    </article>
  );
}
