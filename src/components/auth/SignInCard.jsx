import { useState } from 'react'
import { FiMail, FiCheck, FiLogOut, FiCloud, FiCloudOff, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

/**
 * SignInCard — UI for magic-link auth in Settings.
 *
 * Three visual states:
 *   1. Firebase not configured  → friendly note, no inputs
 *   2. Signed-out               → email input + "Send magic link"
 *   3. Signed-in                → email, sync status, sign-out button
 */
export default function SignInCard() {
  const { user, status, error, sendMagicLink, signOut, resetStatus, firebaseEnabled } = useAuth()
  const { syncStatus } = useApp()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  // ─── Case 1: Firebase is NOT configured ───────────────────────────
  if (!firebaseEnabled) {
    return (
      <section className="card p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-500">
            <FiCloudOff />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl tracking-tight">Cloud sync</h3>
            <p className="text-sm text-ink-500 mt-1 leading-relaxed">
              Sync is <strong>not configured</strong>. The app is running in local-only mode —
              your data lives in this browser. To enable cross-device sync, add Firebase env
              vars in <code className="text-xs bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">.env</code> and redeploy.
              See the README for the 4-minute setup.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ─── Case 2: Signed in ────────────────────────────────────────────
  if (user) {
    const syncMeta = {
      synced:   { icon: <FiCheck />,         label: 'All changes synced', tone: 'text-emerald-600 dark:text-emerald-400' },
      syncing:  { icon: <FiCloud />,         label: 'Syncing…',            tone: 'text-ink-500' },
      error:    { icon: <FiAlertCircle />,   label: 'Sync error',          tone: 'text-rose-600 dark:text-rose-400' },
      idle:     { icon: <FiCloud />,         label: 'Idle',                tone: 'text-ink-500' },
      offline:  { icon: <FiCloudOff />,      label: 'Offline',             tone: 'text-ink-500' },
    }[syncStatus] || { icon: <FiCloud />, label: '—', tone: 'text-ink-500' }

    return (
      <section className="card p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 grid place-items-center text-emerald-600 dark:text-emerald-400">
            <FiCheck />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl tracking-tight">Signed in</h3>
            <p className="text-sm text-ink-500 mt-1 leading-relaxed">
              Your data syncs to every device you sign in on.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-200/70 dark:border-ink-700/70 flex items-center gap-3">
              <FiMail className="text-ink-400" />
              <span className="text-sm font-medium flex-1 truncate">{user.email}</span>
              <span className={`text-xs inline-flex items-center gap-1.5 ${syncMeta.tone}`}>
                {syncMeta.icon}
                {syncMeta.label}
              </span>
            </div>
            <div className="mt-4">
              <button
                onClick={async () => {
                  await signOut()
                  toast.success('Signed out')
                }}
                className="btn-secondary"
              >
                <FiLogOut /> Sign out of this device
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ─── Case 3: Signed out — magic-link form ─────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      await sendMagicLink(email.trim())
      toast.success('Magic link sent — check your inbox')
    } catch (err) {
      toast.error(err.message || 'Could not send link')
    } finally {
      setSending(false)
    }
  }

  if (status === 'sent') {
    return (
      <section className="card p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-500/15 grid place-items-center text-accent-600 dark:text-accent-300">
            <FiMail />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl tracking-tight">Check your inbox</h3>
            <p className="text-sm text-ink-500 mt-1 leading-relaxed">
              We sent a sign-in link to <strong>{email}</strong>. Open the email
              and tap the link — it’ll bring you right back here, signed in.
            </p>
            <p className="text-xs text-ink-400 mt-2">
              Didn’t arrive? Check spam, or{' '}
              <button onClick={resetStatus} className="underline hover:text-ink-700 dark:hover:text-ink-200">
                try again
              </button>
              .
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="card p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-500">
          <FiCloud />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-2xl tracking-tight">Sync across devices</h3>
          <p className="text-sm text-ink-500 mt-1 leading-relaxed">
            Sign in with your email to access your tasks, notes, and checklists from
            any device. No passwords — we’ll send a one-tap link to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input flex-1"
              disabled={sending}
            />
            <button type="submit" className="btn-primary" disabled={sending || !email.trim()}>
              <FiMail /> {sending ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
              <FiAlertCircle /> {error}
            </p>
          )}
          <p className="text-xs text-ink-400 mt-3">
            Local data stays on this device until you sign in.
          </p>
        </div>
      </div>
    </section>
  )
}
