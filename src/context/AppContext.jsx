import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../utils/storage.js'
import { uid } from '../utils/helpers.js'
import { useAuth } from './AuthContext.jsx'
import { readRemote, writeRemote, subscribeRemote } from '../utils/sync.js'

const AppContext = createContext(null)

/**
 * AppProvider — single source of truth for app data.
 *
 * Storage strategy ("local-first with optional cloud"):
 *   1. Always read/write localStorage so the app works offline.
 *   2. If a Firebase user is signed in, ALSO sync to/from Firestore via
 *      a live snapshot subscription.
 *   3. Every local mutation is pushed to Firestore (debounced 700ms).
 */
export function AppProvider({ children }) {
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEYS.TASKS, [])
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.NOTES, [])
  const [checklists, setChecklists] = useLocalStorage(STORAGE_KEYS.CHECKLISTS, [])
  const [activity, setActivity] = useLocalStorage(STORAGE_KEYS.ACTIVITY, [])
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error | offline

  const { user, firebaseEnabled } = useAuth() || { user: null, firebaseEnabled: false }

  const remoteWriteTimer = useRef(null)
  const skipNextRemoteEcho = useRef(false) // ignore the next snapshot if it's our own write
  const hasInitialized = useRef(false)

  // ---------- Sync engine ----------
  useEffect(() => {
    if (!firebaseEnabled || !user) {
      setSyncStatus(firebaseEnabled ? 'offline' : 'idle')
      hasInitialized.current = false
      return
    }

    let unsub = () => {}
    let cancelled = false

    const init = async () => {
      setSyncStatus('syncing')
      try {
        const remote = await readRemote(user.uid)
        if (cancelled) return

        const localEmpty = !tasks.length && !notes.length && !checklists.length

        if (!remote) {
          // First sign-in: upload local snapshot.
          await writeRemote(user.uid, { tasks, notes, checklists, activity })
        } else {
          const remoteEmpty =
            !(remote.tasks?.length) && !(remote.notes?.length) && !(remote.checklists?.length)

          if (localEmpty && !remoteEmpty) {
            // Fresh device — pull remote.
            skipNextRemoteEcho.current = true
            setTasks(remote.tasks || [])
            setNotes(remote.notes || [])
            setChecklists(remote.checklists || [])
            setActivity(remote.activity || [])
          } else if (!localEmpty && remoteEmpty) {
            // Local has data, cloud is empty — push local.
            await writeRemote(user.uid, { tasks, notes, checklists, activity })
          } else {
            // Both have data — prefer remote so devices converge.
            skipNextRemoteEcho.current = true
            setTasks(remote.tasks || [])
            setNotes(remote.notes || [])
            setChecklists(remote.checklists || [])
            setActivity(remote.activity || [])
          }
        }

        hasInitialized.current = true
        setSyncStatus('synced')

        // Real-time subscription
        unsub = subscribeRemote(user.uid, (data) => {
          if (skipNextRemoteEcho.current) {
            skipNextRemoteEcho.current = false
            return
          }
          setTasks(data.tasks || [])
          setNotes(data.notes || [])
          setChecklists(data.checklists || [])
          setActivity(data.activity || [])
          setSyncStatus('synced')
        })
      } catch (err) {
        console.error('Sync init failed:', err)
        setSyncStatus('error')
      }
    }

    init()
    return () => { cancelled = true; unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, firebaseEnabled])

  // Debounced push of local changes to Firestore
  useEffect(() => {
    if (!firebaseEnabled || !user || !hasInitialized.current) return
    clearTimeout(remoteWriteTimer.current)
    remoteWriteTimer.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing')
        skipNextRemoteEcho.current = true
        await writeRemote(user.uid, { tasks, notes, checklists, activity })
        setSyncStatus('synced')
      } catch (err) {
        console.error('Remote write failed:', err)
        setSyncStatus('error')
      }
    }, 700)
    return () => clearTimeout(remoteWriteTimer.current)
  }, [tasks, notes, checklists, activity, user, firebaseEnabled])

  // ---------- Activity log ----------
  const log = useCallback((type, text) => {
    setActivity(prev => {
      const next = [{ id: uid(), type, text, at: new Date().toISOString() }, ...prev]
      return next.slice(0, 30)
    })
  }, [setActivity])

  // ---------- TASKS ----------
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

  const reorderTasks = useCallback((newList) => {
    setTasks(newList.map((t, i) => ({ ...t, order: i })))
  }, [setTasks])

  // ---------- NOTES ----------
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
    log('note', 'Created a note')
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

  // ---------- CHECKLISTS ----------
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

  // ---------- DATA OPS ----------
  const exportData = useCallback(() => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks, notes, checklists,
  }), [tasks, notes, checklists])

  const importData = useCallback((data) => {
    if (!data || typeof data !== 'object') throw new Error('Invalid file')
    if (Array.isArray(data.tasks)) setTasks(data.tasks)
    if (Array.isArray(data.notes)) setNotes(data.notes)
    if (Array.isArray(data.checklists)) setChecklists(data.checklists)
    log('info', 'Imported data')
  }, [setTasks, setNotes, setChecklists, log])

  const clearAll = useCallback(() => {
    setTasks([]); setNotes([]); setChecklists([]); setActivity([])
  }, [setTasks, setNotes, setChecklists, setActivity])

  // ---------- Derived stats ----------
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
    tasks, notes, checklists, activity, stats, syncStatus,
    addTask, updateTask, deleteTask, toggleTask, reorderTasks,
    addNote, updateNote, deleteNote,
    addChecklist, updateChecklist, deleteChecklist,
    addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem,
    exportData, importData, clearAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
