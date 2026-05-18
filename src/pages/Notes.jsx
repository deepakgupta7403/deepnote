import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiSearch, FiFileText, FiArrowLeft } from 'react-icons/fi'

import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import NoteCard from '../components/notes/NoteCard.jsx'
import NoteEditor from '../components/notes/NoteEditor.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

/**
 * Notes
 * Two-pane layout (list + editor) on lg+, full-screen editor on mobile.
 * Notes auto-save via NoteEditor.
 */
export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useApp()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(notes[0]?.id || null)
  const [pendingDelete, setPendingDelete] = useState(null)

  // Sort newest-updated first; apply search filter
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .filter(n => {
        if (!q) return true
        return (n.title + ' ' + n.body).toLowerCase().includes(q)
      })
  }, [notes, query])

  // Make sure we always have a sensible active note if possible
  useEffect(() => {
    if (activeId && !notes.find(n => n.id === activeId)) {
      setActiveId(notes[0]?.id || null)
    }
  }, [notes, activeId])

  const active = notes.find(n => n.id === activeId)

  const handleCreate = () => {
    const n = addNote({ title: '', body: '' })
    setActiveId(n.id)
    toast.success('Note created')
  }

  const handleDelete = (note) => setPendingDelete(note)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="input pl-10"
          />
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <FiPlus /> New note
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<FiFileText />}
          title="A blank page is a fresh start"
          description="Write down a thought, a quote, a half-formed idea. It'll be safer here than in your head."
          action={<button onClick={handleCreate} className="btn-primary"><FiPlus /> Write your first note</button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* List */}
          <div className={`lg:col-span-2 ${active ? 'hidden lg:block' : ''}`}>
            {visible.length === 0 ? (
              <EmptyState icon={<FiSearch />} title="No notes match" description="Try a different search." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {visible.map(n => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    active={n.id === activeId}
                    onOpen={(note) => setActiveId(note.id)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className={`lg:col-span-3 ${active ? '' : 'hidden lg:block'}`}>
            {active ? (
              <>
                {/* Mobile back */}
                <button
                  onClick={() => setActiveId(null)}
                  className="btn-ghost mb-3 lg:hidden"
                >
                  <FiArrowLeft /> Back to notes
                </button>
                <NoteEditor
                  note={active}
                  onChange={(patch) => updateNote(active.id, patch)}
                  onDelete={() => handleDelete(active)}
                  onClose={() => setActiveId(null)}
                />
              </>
            ) : (
              <div className="card p-10 text-center text-ink-400 hidden lg:block h-full grid-place-items-center">
                <p className="font-display text-2xl italic mb-1">Pick a note</p>
                <p className="text-sm">…or start a new one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteNote(pendingDelete.id)
            if (pendingDelete.id === activeId) setActiveId(null)
            toast.success('Note deleted')
          }
        }}
        title="Delete this note?"
        message={`“${pendingDelete?.title || 'Untitled'}” will be removed permanently.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
