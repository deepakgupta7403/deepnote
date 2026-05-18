import { useRef, useState } from 'react'
import {
  FiDownload, FiUpload, FiTrash2, FiSun, FiMoon, FiGithub, FiHeart,
} from 'react-icons/fi'

import { useApp } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

/**
 * Settings — theme toggle, export / import JSON, clear data.
 */
export default function Settings() {
  const { exportData, importData, clearAll, stats } = useApp()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const fileRef = useRef(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // Trigger a JSON download of all user data
  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deepnote-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Exported as JSON')
    } catch {
      toast.error('Export failed')
    }
  }

  // Read user-picked JSON & merge in
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        importData(parsed)
        toast.success('Data imported')
      } catch {
        toast.error('Invalid file')
      } finally {
        if (fileRef.current) fileRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Appearance */}
      <section className="card p-6">
        <h3 className="font-display text-2xl tracking-tight mb-1">Appearance</h3>
        <p className="text-sm text-ink-500 mb-5">Choose a theme that suits your eyes.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 transition text-left
              ${theme === 'light' ? 'border-ink-900 dark:border-white' : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'}`}
          >
            <FiSun className="text-2xl mb-2" />
            <p className="font-medium">Light</p>
            <p className="text-xs text-ink-500">Bright, calm and clear.</p>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 transition text-left
              ${theme === 'dark' ? 'border-ink-900 dark:border-white' : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'}`}
          >
            <FiMoon className="text-2xl mb-2" />
            <p className="font-medium">Dark</p>
            <p className="text-xs text-ink-500">Easy on the eyes after dusk.</p>
          </button>
        </div>
      </section>

      {/* Data */}
      <section className="card p-6">
        <h3 className="font-display text-2xl tracking-tight mb-1">Your data</h3>
        <p className="text-sm text-ink-500 mb-5">
          Everything lives in your browser. You can export it, restore from a file, or wipe it clean.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Tasks', value: stats.totalTasks },
            { label: 'Notes', value: stats.totalNotes },
            { label: 'Checklists', value: stats.totalChecklists },
            { label: 'Items', value: stats.checklistItemsTotal },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-ink-100/70 dark:bg-ink-800/60">
              <p className="text-[11px] uppercase tracking-wider text-ink-500">{s.label}</p>
              <p className="font-display text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <FiDownload /> Export JSON
          </button>
          <label className="btn-secondary cursor-pointer">
            <FiUpload /> Import JSON
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button onClick={() => setConfirmClear(true)} className="btn-danger ml-auto">
            <FiTrash2 /> Clear all data
          </button>
        </div>
      </section>

      {/* About */}
      <section className="card p-6">
        <h3 className="font-display text-2xl tracking-tight mb-1">About deepnote</h3>
        <p className="text-sm text-ink-500 leading-relaxed">
          A small, local-first productivity workspace. No accounts. No tracking. No cloud.
          Just a quiet place for your tasks, notes and checklists.
        </p>
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <FiGithub /> Source on GitHub
          </a>
          <span className="inline-flex items-center gap-1 text-ink-500 ml-auto">
            Made with <FiHeart className="text-rose-500" /> &amp; localStorage
          </span>
        </div>
      </section>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll()
          toast.success('All data cleared')
        }}
        title="Erase everything?"
        message="All tasks, notes, checklists and activity will be permanently deleted from this browser. This cannot be undone."
        confirmLabel="Yes, erase all"
        destructive
      />
    </div>
  )
}
