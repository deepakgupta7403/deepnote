/**
 * Small utility helpers used across the app.
 */

// Generate a short, sortable ID (timestamp + random suffix).
export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

// Format an ISO date string -> "Mar 12" / "Today" / "Tomorrow" / "Yesterday"
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target - today) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Relative time: "5m ago", "2h ago", "3d ago"
export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const dys = Math.floor(h / 24)
  if (dys < 30) return `${dys}d ago`
  const mo = Math.floor(dys / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

// Priority -> colors used by chips & dots
export const PRIORITY_STYLES = {
  low:    { dot: 'bg-emerald-400',  chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  medium: { dot: 'bg-amber-400',    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  high:   { dot: 'bg-rose-500',     chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
}

// Color label palette (used for tasks/notes/checklist categories)
export const LABEL_COLORS = [
  { id: 'slate',   name: 'Slate',   bg: 'bg-slate-200',   text: 'text-slate-700',   dot: 'bg-slate-400' },
  { id: 'rose',    name: 'Rose',    bg: 'bg-rose-200',    text: 'text-rose-700',    dot: 'bg-rose-400' },
  { id: 'amber',   name: 'Amber',   bg: 'bg-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  { id: 'sky',     name: 'Sky',     bg: 'bg-sky-200',     text: 'text-sky-700',     dot: 'bg-sky-400' },
  { id: 'violet',  name: 'Violet',  bg: 'bg-violet-200',  text: 'text-violet-700',  dot: 'bg-violet-400' },
]

export function getLabelColor(id) {
  return LABEL_COLORS.find(c => c.id === id) || LABEL_COLORS[0]
}

// Tiny "is overdue" check that ignores time of day
export function isOverdue(iso) {
  if (!iso) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d < today
}
