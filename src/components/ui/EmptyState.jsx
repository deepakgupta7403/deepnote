/**
 * EmptyState — soft, illustrative empty placeholder.
 *
 * Usage:
 *   <EmptyState
 *     icon={<FiCheckSquare />}
 *     title="No tasks yet"
 *     description="Capture your first task to get started."
 *     action={<button className="btn-primary">New task</button>}
 *   />
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card p-10 text-center animate-fade-in">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-ink-100 dark:bg-ink-800
                      grid place-items-center text-2xl text-ink-500 mb-4">
        {icon}
      </div>
      <h3 className="font-display text-2xl tracking-tight mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 dark:text-ink-400 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
