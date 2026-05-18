import { useMemo, useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { FiPlus, FiSearch, FiCheckSquare } from 'react-icons/fi'

import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import TaskItem from '../components/tasks/TaskItem.jsx'
import TaskForm from '../components/tasks/TaskForm.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

/**
 * Tasks page
 * - Search input
 * - Filter pills (All / Pending / Completed)
 * - Sortable list with dnd-kit
 * - Create / Edit modal
 * - Delete confirmation
 */
export default function Tasks() {
  const {
    tasks, addTask, updateTask, deleteTask, toggleTask, reorderTasks,
  } = useApp()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | pending | done
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)   // null | task
  const [pendingDelete, setPendingDelete] = useState(null)

  // Visible tasks: filtered + searched, but keep stable user-defined order
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...tasks]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter(t => {
        if (filter === 'pending' && t.completed) return false
        if (filter === 'done' && !t.completed) return false
        if (!q) return true
        return (t.title + ' ' + (t.notes || '')).toLowerCase().includes(q)
      })
  }, [tasks, query, filter])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    // Reorder within the FULL list (not just visible) so order stays meaningful
    const full = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const oldIndex = full.findIndex(t => t.id === active.id)
    const newIndex = full.findIndex(t => t.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderTasks(arrayMove(full, oldIndex, newIndex))
  }

  const openCreate = () => { setEditing(null); setEditorOpen(true) }
  const openEdit   = (t) => { setEditing(t);   setEditorOpen(true) }

  const handleSubmit = (data) => {
    if (editing) {
      updateTask(editing.id, data)
      toast.success('Task updated')
    } else {
      addTask(data)
      toast.success('Task added')
    }
    setEditorOpen(false)
    setEditing(null)
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
            placeholder="Search tasks…"
            className="input pl-10"
          />
        </div>

        <div className="inline-flex p-1 rounded-xl bg-ink-100 dark:bg-ink-800 self-start">
          {[
            { id: 'all',     label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'done',    label: 'Done' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition
                ${filter === f.id
                  ? 'bg-white dark:bg-ink-700 shadow-soft text-ink-900 dark:text-white'
                  : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={openCreate} className="btn-primary">
          <FiPlus /> New task
        </button>
      </div>

      {/* List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<FiCheckSquare />}
          title="No tasks yet"
          description="Capture what’s on your mind. A simple list is often the calmest one."
          action={<button onClick={openCreate} className="btn-primary"><FiPlus /> Add your first task</button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FiSearch />}
          title="Nothing matches"
          description="Try a different search or filter."
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visible.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {visible.map(t => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={toggleTask}
                  onEdit={openEdit}
                  onDelete={(task) => setPendingDelete(task)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Editor modal */}
      <Modal
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null) }}
        title={editing ? 'Edit task' : 'New task'}
      >
        <TaskForm
          initial={editing}
          submitLabel={editing ? 'Save changes' : 'Add task'}
          onSubmit={handleSubmit}
          onCancel={() => { setEditorOpen(false); setEditing(null) }}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteTask(pendingDelete.id)
            toast.success('Task deleted')
          }
        }}
        title="Delete this task?"
        message={`“${pendingDelete?.title}” will be removed permanently.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
