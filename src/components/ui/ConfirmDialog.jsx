import Modal from './Modal.jsx'

/**
 * ConfirmDialog — quick yes/no modal.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={isOpen}
 *     title="Delete task?"
 *     message="This action can't be undone."
 *     confirmLabel="Delete"
 *     destructive
 *     onConfirm={() => ...}
 *     onClose={() => setOpen(false)}
 *   />
 */
export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>{cancelLabel}</button>
          <button
            className={destructive ? 'btn-danger' : 'btn-primary'}
            onClick={() => { onConfirm?.(); onClose?.() }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-ink-600 dark:text-ink-300 text-sm leading-relaxed">{message}</p>
    </Modal>
  )
}
