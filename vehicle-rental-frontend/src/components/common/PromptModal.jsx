import Modal from './Modal';

export default function PromptModal({
  open,
  title,
  message,
  label,
  value,
  onChange,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  placeholder = '',
  disabled = false,
  required = false,
  rows = 4,
}) {
  return (<Modal
      open={open}
      title={title}
      onClose={disabled ? () => {} : onClose}
      actions={(<><button type="button" className="button button--ghost" onClick={onClose} disabled={disabled}>
            {cancelLabel}
          </button><button type="submit" form="prompt-modal-form" className="button button--primary" disabled={disabled}>
            {submitLabel}
          </button></>
      )}><form id="prompt-modal-form" className="filters-panel filters-panel--compact" onSubmit={onSubmit}>
        {message ? <p className="muted-text">{message}</p> : null}
        <label className="field"><span>{label}</span><textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required} /></label></form></Modal>
  );
}
