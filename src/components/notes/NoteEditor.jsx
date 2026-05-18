import { useEffect, useRef, useState } from 'react'
import { FiX, FiTrash2, FiCheck } from 'react-icons/fi'
import useDebounce from '../../hooks/useDebounce.js'
import { LABEL_COLORS, getLabelColor, timeAgo } from '../../utils/helpers.js'

/**
 * NoteEditor — inline editor for a note.
 * Auto-saves on a 500ms debounce — no "save" button needed.
 *
 * Props:
 *   note: the active note object
 *   onChange(patch): called with diff to persist
 *   onDelete(): trigger deletion
 *   onClose(): close editor (mobile)
 */
export default function NoteEditor({ note, onChange, onDelete, onClose }) {
  const [title, setTitle] = useState(note?.title || '')
  const [body, setBody]   = useState(note?.body || '')
  const [label, setLabel] = useState(note?.label || 'slate')
  const [savedFlash, setSavedFlash] = useState(false)
  const lastSavedRef = useRef({ title, body, label })

  // Re-sync when switching to a different note
  useEffect(() => {
    setTitle(note?.title || '')
    setBody(note?.body || '')
    setLabel(note?.label || 'slate')
    lastSavedRef.current = {
      title: note?.title || '',
      body:  note?.body  || '',
      label: note?.label || 'slate',
    }
  }, [note?.id])

  const debouncedTitle = useDebounce(title, 400)
  const debouncedBody  = useDebounce(body,  400)
  const debouncedLabel = useDebounce(label, 200)

  // Auto-save when debounced values change and actually differ
  useEffect(() => {
    if (!note) return
    const prev = lastSavedRef.current
    if (prev.title === debouncedTitle && prev.body === debouncedBody && prev.label === debouncedLabel) return
    onChange({ title: debouncedTitle, body: debouncedBody, label: debouncedLabel })
    lastSavedRef.current = { title: debouncedTitle, body: debouncedBody, label: debouncedLabel }
    setSavedFlash(true)
    const t = setTimeout(() => setSavedFlash(false), 1100)
    return () => clearTimeout(t)
  }, [debouncedTitle, debouncedBody, debouncedLabel, note, onChange])

  if (!note) return null
  const labelColor = getLabelColor(label)

  return (
    <div className="card p-6 lg:p-8 flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${labelColor.dot}`} />
        <div className="flex-1 text-xs text-ink-400">
          {savedFlash ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <FiCheck /> saved
            </span>
          ) : (
            <span>edited {timeAgo(note.updatedAt)}</span>
          )}
        </div>
        <button onClick={onDelete} className="btn-ghost p-2 rounded-lg hover:text-rose-600" aria-label="Delete note">
          <FiTrash2 />
        </button>
        <button onClick={onClose} className="btn-ghost p-2 rounded-lg lg:hidden" aria-label="Close">
          <FiX />
        </button>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        className="w-full bg-transparent font-display text-3xl sm:text-4xl tracking-tight
                   outline-none placeholder-ink-300 dark:placeholder-ink-600 mb-4"
      />

      {/* Color labels */}
      <div className="flex flex-wrap gap-2 mb-4">
        {LABEL_COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => setLabel(c.id)}
            className={`w-6 h-6 rounded-full transition ring-offset-2 ring-offset-white dark:ring-offset-ink-900
              ${c.dot} ${label === c.id ? 'ring-2 ring-ink-900 dark:ring-white' : 'opacity-70 hover:opacity-100'}`}
            aria-label={`Set color ${c.name}`}
          />
        ))}
      </div>

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start writing your thoughts…"
        className="flex-1 min-h-[300px] w-full bg-transparent resize-none outline-none
                   text-[15px] leading-7 text-ink-700 dark:text-ink-200
                   placeholder-ink-300 dark:placeholder-ink-600"
      />
    </div>
  )
}
