import { FiMenu, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useLocation } from 'react-router-dom'
import SyncBadge from './SyncBadge.jsx'

const TITLES = {
  '/':           { title: 'Dashboard',  sub: 'A bird’s-eye view of your day.' },
  '/tasks':      { title: 'Tasks',      sub: 'Capture what needs doing.' },
  '/notes':      { title: 'Notes',      sub: 'Quiet thinking, written down.' },
  '/checklists': { title: 'Checklists', sub: 'Step by step. Tick by tick.' },
  '/settings':   { title: 'Settings',   sub: 'Make deepnote yours.' },
}

/**
 * Topbar
 * - Mobile burger
 * - Contextual page title/subtitle (animated)
 * - Theme toggle
 */
export default function Topbar({ onOpenSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const meta = TITLES[pathname] || TITLES['/']

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-50/70 dark:bg-ink-950/60
                       border-b border-ink-200/70 dark:border-ink-800">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden btn-ghost p-2 rounded-lg"
          aria-label="Open sidebar"
        >
          <FiMenu className="text-lg" />
        </button>

        <div className="flex-1 min-w-0 animate-fade-in" key={pathname}>
          <h2 className="font-display text-2xl sm:text-3xl leading-none tracking-tight truncate">
            {meta.title}
          </h2>
          <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1 truncate">
            {meta.sub}
          </p>
        </div>

        <SyncBadge />

        <button
          onClick={toggleTheme}
          className="btn-ghost p-2.5 rounded-xl"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
        </button>
      </div>
    </header>
  )
}
