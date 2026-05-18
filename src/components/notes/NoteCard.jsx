import { FiTrash2 } from 'react-icons/fi'
import { getLabelColor, timeAgo } from '../../utils/helpers.js'

/**
 * NoteCard — preview tile shown in the notes grid.
 * Clicking opens the inline editor (parent handles selection).
 */
export default function NoteCard({ note, onOpen, onDelete, active }) {
  const labelColor = getLabelColor(note.label)
  const preview = (note.body || '').slice(0, 160)

  return (
    <article
      onClick={() => onOpen(note)}
      className={`group card p-5 cursor-pointer transition-all hover:shadow-glow hover:-translate-y-0.5
        ${active ? 'ring-2 ring-accent-400/60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full mt-2 ${labelColor.dot}`} />
        <h3 className="font-display text-xl tracking-tight flex-1 line-clamp-1">
          {note.title || <span className="text-ink-400 italic">Untitled</span>}
        </h3>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note) }}
          className="btn-ghost p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:text-rose-600 transition"
          aria-label="Delete note"
        >
          <FiTrash2 className="text-sm" />
        </button>
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed line-clamp-4 min-h-[4.5rem]">
        {preview || <span className="italic text-ink-400">No content yet…</span>}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-ink-400 mt-4">
        edited {timeAgo(note.updatedAt)}
      </p>
    </article>
  )
}
