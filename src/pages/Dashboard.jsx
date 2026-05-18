import { Link } from 'react-router-dom'
import {
  FiCheckSquare, FiFileText, FiList, FiTrendingUp,
  FiPlus, FiArrowRight, FiClock,
} from 'react-icons/fi'
import { useApp } from '../context/AppContext.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { formatDate, timeAgo, isOverdue, PRIORITY_STYLES } from '../utils/helpers.js'

/**
 * Dashboard
 * - Hero greeting
 * - KPI tiles
 * - Upcoming tasks (pending, sorted by due date)
 * - Recent activity
 * - Quick actions
 */
export default function Dashboard() {
  const { tasks, notes, checklists, activity, stats } = useApp()

  // Greeting based on the time of day
  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Still up?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Upcoming = pending tasks sorted by (overdue first, then due asc, then created desc)
  const upcoming = [...tasks]
    .filter(t => !t.completed)
    .sort((a, b) => {
      const ad = a.due ? new Date(a.due).getTime() : Infinity
      const bd = b.due ? new Date(b.due).getTime() : Infinity
      if (ad !== bd) return ad - bd
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    .slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent-400/20 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight mt-2 text-balance">
            {greeting}. <span className="italic text-ink-500">Here’s where you are.</span>
          </h2>
          <p className="text-ink-500 dark:text-ink-400 mt-3 max-w-xl">
            {stats.pendingTasks > 0
              ? `You have ${stats.pendingTasks} task${stats.pendingTasks === 1 ? '' : 's'} waiting${stats.totalTasks > 0 ? ` — ${stats.completionRate}% done overall.` : '.'}`
              : 'No pending tasks. A perfect moment to capture a fresh idea.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/tasks" className="btn-primary">
              <FiPlus /> New task
            </Link>
            <Link to="/notes" className="btn-secondary">
              <FiFileText /> Open notes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Tasks"      value={stats.totalTasks}      sub={`${stats.completedTasks} completed`} icon={<FiCheckSquare />} />
        <StatCard label="Notes"      value={stats.totalNotes}      sub="Quiet thoughts kept"                  icon={<FiFileText />} />
        <StatCard label="Checklists" value={stats.totalChecklists} sub={`${stats.checklistItemsDone}/${stats.checklistItemsTotal} items`} icon={<FiList />} />
        <StatCard label="Done"       value={`${stats.completionRate}%`} sub="Completion rate"                 icon={<FiTrendingUp />} accent />
      </section>

      {/* Two-column section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Upcoming tasks */}
        <div className="lg:col-span-2 card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl tracking-tight">Up next</h3>
            <Link to="/tasks" className="text-xs text-ink-500 hover:text-ink-900 dark:hover:text-white inline-flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-10 text-center text-ink-400 text-sm italic">
              You’re all clear. Enjoy the quiet.
            </div>
          ) : (
            <ul className="divide-y divide-ink-200 dark:divide-ink-800">
              {upcoming.map(t => {
                const overdue = isOverdue(t.due)
                const prio = PRIORITY_STYLES[t.priority]
                return (
                  <li key={t.id} className="py-3 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${prio.dot}`} />
                    <p className="flex-1 text-[15px] truncate">{t.title}</p>
                    {t.due && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium
                        ${overdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                          : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'}`}>
                        {formatDate(t.due)}{overdue ? ' · overdue' : ''}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl tracking-tight">Recent activity</h3>
            <FiClock className="text-ink-400" />
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-ink-400 italic">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 7).map(a => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink-300 dark:bg-ink-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-700 dark:text-ink-200 leading-snug truncate">{a.text}</p>
                    <p className="text-[11px] text-ink-400">{timeAgo(a.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { to: '/tasks',      label: 'Tasks',      icon: <FiCheckSquare />, sub: 'Plan your day' },
          { to: '/notes',      label: 'Notes',      icon: <FiFileText />,    sub: 'Capture an idea' },
          { to: '/checklists', label: 'Checklists', icon: <FiList />,        sub: 'Build a process' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="card p-5 flex items-center gap-4 hover:shadow-glow hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-xl text-ink-600 dark:text-ink-300">
              {link.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium">{link.label}</p>
              <p className="text-xs text-ink-500">{link.sub}</p>
            </div>
            <FiArrowRight className="text-ink-400" />
          </Link>
        ))}
      </section>
    </div>
  )
}
