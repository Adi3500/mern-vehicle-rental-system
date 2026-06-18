import Modal from './Modal';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'primary',
  onClose,
  onConfirm,
  disabled = false,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={disabled ? () => {} : onClose}
      actions={
        <>
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={disabled}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`button button--${confirmTone}`}
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted-text" style={{ lineHeight: 1.7 }}>
        {message}
      </p>
    </Modal>
  );
}