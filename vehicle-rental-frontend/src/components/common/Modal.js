export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 id="modal-title">{title}</h3>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
            style={{ fontSize: '1.3rem', borderRadius: '50%', width: '2rem', height: '2rem' }}
          >
            &times;
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {actions ? <div className="modal__actions">{actions}</div> : null}
      </div>
    </div>
  );
}