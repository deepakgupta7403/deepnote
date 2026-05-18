import { useState, useEffect } from 'react'
import { LABEL_COLORS } from '../../utils/helpers.js'

const PRIORITIES = [
  { id: 'low',    label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high',   label: 'High' },
]

/**
 * TaskForm — controlled form used by the "New task" / "Edit task" modal.
 *
 * Pass initial values via `initial` to pre-fill (edit mode).
 */
export default function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Add task' }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  const [due, setDue] = useState(initial?.due || '')
  const [label, setLabel] = useState(initial?.label || 'slate')

  // If initial changes (e.g., switching between tasks), re-sync.
  useEffect(() => {
    setTitle(initial?.title || '')
    setNotes(initial?.notes || '')
    setPriority(initial?.priority || 'medium')
    setDue(initial?.due || '')
    setLabel(initial?.label || 'slate')
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), notes, priority, due, label })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-ink-500 mb-1.5 uppercase tracking-wider">
          Title
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="input"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-500 mb-1.5 uppercase tracking-wider">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details, context, links…"
          rows={3}
          className="input resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1.5 uppercase tracking-wider">
            Priority
          </label>
          <div className="flex gap-1.5">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition border
                ${priority === p.id
                  ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900 dark:border-white'
                  : 'bg-transparent border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1.5 uppercase tracking-wider">
            Due date
          </label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-500 mb-1.5 uppercase tracking-wider">
          Color label
        </label>
        <div className="flex flex-wrap gap-2">
          {LABEL_COLORS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setLabel(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border flex items-center gap-1.5
              ${label === c.id
                ? 'border-ink-900 dark:border-white'
                : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={!title.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
