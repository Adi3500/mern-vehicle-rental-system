export default function Spinner({ label = 'Loading...', fullScreen = false }) {
  return (<div className={fullScreen ? 'spinner-page' : 'spinner-inline'} role="status" aria-live="polite"><span className="spinner" /><span>{label}</span></div>
  );
}
