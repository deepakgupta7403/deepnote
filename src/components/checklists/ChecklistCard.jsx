import { useState } from 'react'
import {
  FiPlus, FiTrash2, FiCheck, FiEdit3, FiX,
} from 'react-icons/fi'
import { getLabelColor, LABEL_COLORS } from '../../utils/helpers.js'

/**
 * ChecklistCard — a single checklist with editable title + items.
 *
 * Visual style: large bold title, items stacked below with circular checkboxes,
 * a simple progress bar, and a quick-add input at the bottom.
 */
export default function ChecklistCard({
  checklist,
  onTitleChange,
  onLabelChange,
  onDelete,
  onAddItem,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
}) {
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(checklist.title)
  const [newItem, setNewItem] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [itemDraft, setItemDraft] = useState('')

  const labelColor = getLabelColor(checklist.label)
  const done  = checklist.items.filter(i => i.done).length
  const total = checklist.items.length
  const pct   = total ? Math.round((done / total) * 100) : 0

  const commitTitle = () => {
    const t = titleDraft.trim() || 'Untitled'
    onTitleChange(t)
    setTitleEditing(false)
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    onAddItem(newItem.trim())
    setNewItem('')
  }

  const startEditItem = (item) => {
    setEditingItemId(item.id)
    setItemDraft(item.text)
  }
  const commitEditItem = () => {
    if (itemDraft.trim()) onUpdateItem(editingItemId, itemDraft.trim())
    setEditingItemId(null)
  }

  return (
    <article className="card p-5 flex flex-col gap-4 transition hover:shadow-glow">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className={`w-2.5 h-2.5 rounded-full mt-2 ${labelColor.dot}`} />
        <div className="flex-1 min-w-0">
          {titleEditing ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle()
                if (e.key === 'Escape') { setTitleDraft(checklist.title); setTitleEditing(false) }
              }}
              className="font-display text-xl tracking-tight bg-transparent outline-none w-full
                         border-b border-ink-300 dark:border-ink-600 focus:border-accent-500 transition"
            />
          ) : (
            <h3
              onClick={() => { setTitleDraft(checklist.title); setTitleEditing(true) }}
              className="font-display text-xl tracking-tight cursor-text leading-snug"
              title="Click to rename"
            >
              {checklist.title}
            </h3>
          )}
          <p className="text-[11px] uppercase tracking-wider text-ink-400 mt-1">
            {done}/{total} done
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => { setTitleDraft(checklist.title); setTitleEditing(true) }}
            className="btn-ghost p-2 rounded-lg"
            aria-label="Rename"
            title="Rename"
          >
            <FiEdit3 className="text-sm" />
          </button>
          <button
            onClick={onDelete}
            className="btn-ghost p-2 rounded-lg hover:text-rose-600"
            aria-label="Delete checklist"
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
        <div
          className="h-full bg-ink-900 dark:bg-white transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Color picker */}
      <div className="flex flex-wrap gap-1.5">
        {LABEL_COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => onLabelChange(c.id)}
            className={`w-4 h-4 rounded-full transition ${c.dot}
              ${checklist.label === c.id ? 'ring-2 ring-ink-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-ink-900' : 'opacity-60 hover:opacity-100'}`}
            aria-label={`Color ${c.name}`}
          />
        ))}
      </div>

      {/* Items */}
      <ul className="space-y-1">
        {checklist.items.length === 0 && (
          <li className="text-sm text-ink-400 italic py-2">No items yet — add one below.</li>
        )}
        {checklist.items.map(item => (
          <li key={item.id} className="group flex items-center gap-2.5 py-1.5">
            <button
              onClick={() => onToggleItem(item.id)}
              className={`shrink-0 w-5 h-5 rounded-full border-2 transition grid place-items-center
                ${item.done
                  ? 'bg-ink-900 border-ink-900 dark:bg-white dark:border-white'
                  : 'border-ink-300 dark:border-ink-600 hover:border-ink-500'}`}
              aria-label={item.done ? 'Mark not done' : 'Mark done'}
            >
              {item.done && <FiCheck className="text-white dark:text-ink-900 text-[10px] stroke-[3]" />}
            </button>

            {editingItemId === item.id ? (
              <input
                autoFocus
                value={itemDraft}
                onChange={(e) => setItemDraft(e.target.value)}
                onBlur={commitEditItem}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEditItem()
                  if (e.key === 'Escape') setEditingItemId(null)
                }}
                className="flex-1 bg-transparent outline-none text-[14px]
                           border-b border-ink-300 dark:border-ink-600 focus:border-accent-500"
              />
            ) : (
              <span
                onClick={() => startEditItem(item)}
                className={`flex-1 text-[14px] cursor-text leading-snug ${
                  item.done ? 'line-through text-ink-400' : 'text-ink-800 dark:text-ink-100'
                }`}
              >
                {item.text}
              </span>
            )}

            <button
              onClick={() => onDeleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 rounded-md hover:text-rose-600 transition"
              aria-label="Remove item"
            >
              <FiX className="text-sm" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add item */}
      <form onSubmit={handleAddItem} className="flex gap-2 items-center pt-1
                                                 border-t border-ink-200/60 dark:border-ink-800">
        <FiPlus className="text-ink-400 ml-1" />
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item…"
          className="flex-1 bg-transparent outline-none text-sm py-2 placeholder-ink-400"
        />
        {newItem.trim() && (
          <button type="submit" className="btn-primary text-xs px-3 py-1.5">
            Add
          </button>
        )}
      </form>
    </article>
  )
}
