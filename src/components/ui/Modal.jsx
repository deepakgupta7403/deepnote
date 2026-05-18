import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

/**
 * Modal — accessible-ish dialog.
 * Closes on ESC and overlay click. Locks body scroll while open.
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizes[size]} card animate-pop`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="font-display text-2xl tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="btn-ghost p-2 rounded-lg"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="px-6 pb-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-ink-200 dark:border-ink-800
                          flex items-center justify-end gap-2 rounded-b-2xl
                          bg-ink-50/60 dark:bg-ink-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
