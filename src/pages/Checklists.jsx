import { useMemo, useState } from 'react'
import { FiPlus, FiSearch, FiList } from 'react-icons/fi'

import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import ChecklistCard from '../components/checklists/ChecklistCard.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

/**
 * Checklists
 * Masonry-ish grid of checklist cards. Each is independently editable.
 */
export default function Checklists() {
  const {
    checklists, addChecklist, updateChecklist, deleteChecklist,
    addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem,
  } = useApp()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...checklists]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .filter(c => {
        if (!q) return true
        if (c.title.toLowerCase().includes(q)) return true
        return c.items.some(i => i.text.toLowerCase().includes(q))
      })
  }, [checklists, query])

  const handleCreate = () => {
    addChecklist({ title: 'New checklist' })
    toast.success('Checklist created')
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search checklists or items…"
            className="input pl-10"
          />
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <FiPlus /> New checklist
        </button>
      </div>

      {checklists.length === 0 ? (
        <EmptyState
          icon={<FiList />}
          title="No checklists yet"
          description="Perfect for packing lists, weekly rituals, project steps — anything you’d rather not keep in your head."
          action={<button onClick={handleCreate} className="btn-primary"><FiPlus /> Create your first checklist</button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={<FiSearch />} title="No matches" description="Try a different search." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(c => (
            <ChecklistCard
              key={c.id}
              checklist={c}
              onTitleChange={(title) => updateChecklist(c.id, { title })}
              onLabelChange={(label) => updateChecklist(c.id, { label })}
              onDelete={() => setPendingDelete(c)}
              onAddItem={(text) => addChecklistItem(c.id, text)}
              onToggleItem={(id) => toggleChecklistItem(c.id, id)}
              onUpdateItem={(id, text) => updateChecklistItem(c.id, id, text)}
              onDeleteItem={(id) => deleteChecklistItem(c.id, id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteChecklist(pendingDelete.id)
            toast.success('Checklist deleted')
          }
        }}
        title="Delete this checklist?"
        message={`“${pendingDelete?.title}” and all its items will be removed.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
