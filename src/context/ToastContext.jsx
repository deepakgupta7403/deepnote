import { createContext, useCallback, useContext, useState } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'

const ToastContext = createContext(null)

/**
 * ToastProvider — fire-and-forget notifications.
 * Use anywhere with: const { toast } = useToast(); toast.success('Saved')
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, type, message }])
    // Auto-dismiss after 2.6s
    setTimeout(() => remove(id), 2600)
  }, [remove])

  const toast = {
    success: (m) => push('success', m),
    error:   (m) => push('error', m),
    info:    (m) => push('info', m),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport — bottom right on desktop, top on mobile */}
      <div className="pointer-events-none fixed z-[100] bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: <FiCheckCircle className="text-emerald-500" />,
    error:   <FiAlertCircle className="text-rose-500" />,
    info:    <FiInfo className="text-accent-500" />,
  }
  return (
    <div
      role="status"
      className="pointer-events-auto animate-slide-up glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[260px]"
    >
      <span className="text-lg">{icons[toast.type]}</span>
      <p className="text-sm text-ink-800 dark:text-ink-100 flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition"
        aria-label="Dismiss"
      >
        <FiX />
      </button>
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
