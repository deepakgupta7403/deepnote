import { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../utils/storage.js'
import { uid } from '../utils/helpers.js'

const AppContext = createContext(null)

/**
 * AppProvider — the single source of truth for app data.
 *
 * Holds:
 *  - tasks      : [{ id, title, notes, priority, due, completed, label, createdAt, completedAt, order }]
 *  - notes      : [{ id, title, body, label, updatedAt, createdAt }]
 *  - checklists : [{ id, title, label, items: [{ id, text, done }], updatedAt, createdAt }]
 *  - activity   : recent log of actions for the dashboard
 *
 * All persisted via useLocalStorage so refreshes are lossless.
 */
export function AppProvider({ children }) {
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEYS.TASKS, [])
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.NOTES, [])
  const [checklists, setChecklists] = useLocalStorage(STORAGE_KEYS.CHECKLISTS, [])
  const [activity, setActivity] = useLocalStorage(STORAGE_KEYS.ACTIVITY, [])

  // -------- Activity log (cap at 30 entries) --------
  const log = useCallback((type, text) => {
    setActivity(prev => {
      const next = [{ id: uid(), type, text, at: new Date().toISOString() }, ...prev]
      return next.slice(0, 30)
    })
  }, [setActivity])

  // -------- TASKS --------
  const addTask = useCallback((partial) => {
    const task = {
      id: uid(),
      title: partial.title?.trim() || 'Untitled task',
      notes: partial.notes || '',
      priority: partial.priority || 'medium',
      due: partial.due || '',
      label: partial.label || 'slate',
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: Date.now(),
    }
    setTasks(prev => [task, ...prev])
    log('task', `Created task "${task.title}"`)
    return task
  }, [setTasks, log])

  const updateTask = useCallback((id, patch) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)))
  }, [setTasks])

  const deleteTask = useCallback((id) => {
    setTasks(prev => {
      const found = prev.find(t => t.id === id)
      if (found) log('task', `Deleted task "${found.title}"`)
      return prev.filter(t => t.id !== id)
    })
  }, [setTasks, log])

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const completed = !t.completed
      if (completed) log('task', `Completed "${t.title}"`)
      return { ...t, completed, completedAt: completed ? new Date().toISOString() : null }
    }))
  }, [setTasks, log])

  // Reorder tasks: receives a new array (used by drag-and-drop)
  const reorderTasks = useCallback((newList) => {
    // Re-stamp `order` based on new index so it persists meaningfully
    setTasks(newList.map((t, i) => ({ ...t, order: i })))
  }, [setTasks])

  // -------- NOTES --------
  const addNote = useCallback((partial = {}) => {
    const note = {
      id: uid(),
      title: partial.title || '',
      body: partial.body || '',
      label: partial.label || 'slate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes(prev => [note, ...prev])
    log('note', `Created a note`)
    return note
  }, [setNotes, log])

  const updateNote = useCallback((id, patch) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
    ))
  }, [setNotes])

  const deleteNote = useCallback((id) => {
    setNotes(prev => {
      const found = prev.find(n => n.id === id)
      if (found) log('note', `Deleted note "${found.title || 'Untitled'}"`)
      return prev.filter(n => n.id !== id)
    })
  }, [setNotes, log])

  // -------- CHECKLISTS --------
  const addChecklist = useCallback((partial = {}) => {
    const cl = {
      id: uid(),
      title: partial.title || 'New checklist',
      label: partial.label || 'slate',
      items: partial.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setChecklists(prev => [cl, ...prev])
    log('checklist', `Created checklist "${cl.title}"`)
    return cl
  }, [setChecklists, log])

  const updateChecklist = useCallback((id, patch) => {
    setChecklists(prev => prev.map(c =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
    ))
  }, [setChecklists])

  const deleteChecklist = useCallback((id) => {
    setChecklists(prev => {
      const found = prev.find(c => c.id === id)
      if (found) log('checklist', `Deleted checklist "${found.title}"`)
      return prev.filter(c => c.id !== id)
    })
  }, [setChecklists, log])

  const addChecklistItem = useCallback((checklistId, text) => {
    const t = (text || '').trim()
    if (!t) return
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c
      return {
        ...c,
        items: [...c.items, { id: uid(), text: t, done: false }],
        updatedAt: new Date().toISOString(),
      }
    }))
  }, [setChecklists])

  const toggleChecklistItem = useCallback((checklistId, itemId) => {
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c
      return {
        ...c,
        items: c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i),
        updatedAt: new Date().toISOString(),
      }
    }))
  }, [setChecklists])

  const updateChecklistItem = useCallback((checklistId, itemId, text) => {
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c
      return {
        ...c,
        items: c.items.map(i => i.id === itemId ? { ...i, text } : i),
        updatedAt: new Date().toISOString(),
      }
    }))
  }, [setChecklists])

  const deleteChecklistItem = useCallback((checklistId, itemId) => {
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c
      return {
        ...c,
        items: c.items.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      }
    }))
  }, [setChecklists])

  // -------- DATA OPS --------
  const exportData = useCallback(() => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks, notes, checklists,
    }
  }, [tasks, notes, checklists])

  const importData = useCallback((data) => {
    if (!data || typeof data !== 'object') throw new Error('Invalid file')
    // Be permissive — accept partial imports.
    if (Array.isArray(data.tasks)) setTasks(data.tasks)
    if (Array.isArray(data.notes)) setNotes(data.notes)
    if (Array.isArray(data.checklists)) setChecklists(data.checklists)
    log('info', 'Imported data')
  }, [setTasks, setNotes, setChecklists, log])

  const clearAll = useCallback(() => {
    setTasks([]); setNotes([]); setChecklists([]); setActivity([])
  }, [setTasks, setNotes, setChecklists, setActivity])

  // -------- Derived stats --------
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length
    const pending = tasks.length - completed
    const checklistItemsTotal = checklists.reduce((s, c) => s + c.items.length, 0)
    const checklistItemsDone = checklists.reduce(
      (s, c) => s + c.items.filter(i => i.done).length, 0
    )
    return {
      totalTasks: tasks.length,
      completedTasks: completed,
      pendingTasks: pending,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      totalNotes: notes.length,
      totalChecklists: checklists.length,
      checklistItemsTotal,
      checklistItemsDone,
    }
  }, [tasks, notes, checklists])

  const value = {
    // data
    tasks, notes, checklists, activity, stats,
    // tasks
    addTask, updateTask, deleteTask, toggleTask, reorderTasks,
    // notes
    addNote, updateNote, deleteNote,
    // checklists
    addChecklist, updateChecklist, deleteChecklist,
    addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem,
    // data ops
    exportData, importData, clearAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
