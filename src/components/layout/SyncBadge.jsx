import { FiCloud, FiCloudOff, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useApp } from '../../context/AppContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * SyncBadge — tiny status pill in the topbar.
 * Only renders when Firebase is configured.
 */
export default function SyncBadge() {
  const { syncStatus } = useApp()
  const { user, firebaseEnabled } = useAuth()

  if (!firebaseEnabled) return null

  let icon, label, tone
  if (!user) {
    icon = <FiCloudOff />
    label = 'Local'
    tone = 'text-ink-400'
  } else if (syncStatus === 'syncing') {
    icon = <FiCloud className="animate-pulse" />
    label = 'Syncing'
    tone = 'text-ink-500'
  } else if (syncStatus === 'synced') {
    icon = <FiCheck />
    label = 'Synced'
    tone = 'text-emerald-600 dark:text-emerald-400'
  } else if (syncStatus === 'error') {
    icon = <FiAlertCircle />
    label = 'Sync error'
    tone = 'text-rose-600 dark:text-rose-400'
  } else {
    icon = <FiCloud />
    label = 'Cloud'
    tone = 'text-ink-500'
  }

  return (
    <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg
                      bg-ink-100/70 dark:bg-ink-800/70 ${tone}`}
          title={user ? `${label} · ${user.email}` : label}>
      {icon}
      <span>{label}</span>
    </span>
  )
}
