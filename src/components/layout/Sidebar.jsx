import { NavLink } from 'react-router-dom'
import {
  FiGrid, FiCheckSquare, FiFileText, FiList, FiSettings, FiX,
} from 'react-icons/fi'
import { useApp } from '../../context/AppContext.jsx'

const NAV = [
  { to: '/',           label: 'Dashboard',  icon: FiGrid },
  { to: '/tasks',      label: 'Tasks',      icon: FiCheckSquare },
  { to: '/notes',      label: 'Notes',      icon: FiFileText },
  { to: '/checklists', label: 'Checklists', icon: FiList },
  { to: '/settings',   label: 'Settings',   icon: FiSettings },
]

/**
 * Sidebar
 * - Slides in on mobile (controlled by parent)
 * - Always visible on lg+ screens
 */
export default function Sidebar({ open, onClose }) {
  const { stats } = useApp()

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 shrink-0
          glass lg:bg-transparent lg:backdrop-blur-none lg:border-r lg:border-ink-200/70 dark:lg:border-ink-800
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full p-5">
          {/* Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-ink-900 dark:bg-white grid place-items-center">
                <span className="font-display italic text-white dark:text-ink-900 text-xl leading-none">d</span>
              </div>
              <div>
                <h1 className="font-display text-xl leading-none tracking-tight">
                  deepnote
                </h1>
                <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400 mt-1">
                  a quiet workspace
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden btn-ghost p-2 rounded-lg"
              aria-label="Close sidebar"
            >
              <FiX />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900 shadow-soft'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800/60'
                  }`
                }
              >
                <Icon className="text-base" />
                <span>{label}</span>
                {to === '/tasks' && stats.pendingTasks > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                                   bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100">
                    {stats.pendingTasks}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer card */}
          <div className="mt-4 p-4 rounded-2xl border border-ink-200/80 dark:border-ink-800
                          bg-gradient-to-br from-ink-50 to-white dark:from-ink-900 dark:to-ink-900/40">
            <p className="font-display italic text-lg leading-tight text-ink-800 dark:text-ink-100">
              “Small steps, every day.”
            </p>
            <p className="text-xs text-ink-500 mt-2">
              {stats.completedTasks} of {stats.totalTasks || 0} tasks done
              {stats.totalTasks > 0 && ` · ${stats.completionRate}%`}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-ink-200 dark:bg-ink-800 overflow-hidden">
              <div
                className="h-full bg-ink-900 dark:bg-white transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
