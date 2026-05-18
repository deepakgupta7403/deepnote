import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink,
  onAuthStateChanged, signOut as fbSignOut,
} from 'firebase/auth'
import { auth, firebaseEnabled } from '../firebase.js'

const AuthContext = createContext(null)

// localStorage key — remembers the email between "send link" and "click link"
const PENDING_EMAIL_KEY = 'deepnote:pendingEmail'

/**
 * AuthProvider
 *
 * Wraps the app and exposes:
 *   - user            : current Firebase user (or null)
 *   - status          : 'idle' | 'loading' | 'sent' | 'verifying' | 'ready'
 *   - sendMagicLink(email)
 *   - signOut()
 *
 * If Firebase env vars aren't set, `firebaseEnabled` is false and the
 * provider is a no-op shim — the app simply runs offline-only.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(firebaseEnabled ? 'loading' : 'ready')
  const [error, setError] = useState(null)

  // Subscribe to auth state once on mount
  useEffect(() => {
    if (!firebaseEnabled) return
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)
      setStatus('ready')
    })
    return unsub
  }, [])

  // On load: if the URL is a sign-in link (clicked from email), finish login.
  useEffect(() => {
    if (!firebaseEnabled) return
    const url = window.location.href
    if (!isSignInWithEmailLink(auth, url)) return

    let email = window.localStorage.getItem(PENDING_EMAIL_KEY)
    if (!email) {
      // User opened the link on a different device — ask for email to confirm.
      email = window.prompt('Please confirm your email to complete sign-in:')
    }
    if (!email) return

    setStatus('verifying')
    signInWithEmailLink(auth, email, url)
      .then(() => {
        window.localStorage.removeItem(PENDING_EMAIL_KEY)
        // Strip the long auth params from the URL for cleanliness
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0])
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Sign-in failed')
        setStatus('ready')
      })
  }, [])

  const sendMagicLink = useCallback(async (email) => {
    if (!firebaseEnabled) {
      throw new Error('Cloud sync is not configured.')
    }
    setError(null)
    setStatus('loading')
    try {
      // After clicking the link, the user lands here:
      const continueUrl = window.location.origin + window.location.pathname
      await sendSignInLinkToEmail(auth, email, {
        url: continueUrl,
        handleCodeInApp: true,
      })
      window.localStorage.setItem(PENDING_EMAIL_KEY, email)
      setStatus('sent')
    } catch (err) {
      setError(err.message || 'Could not send link')
      setStatus('ready')
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!firebaseEnabled) return
    await fbSignOut(auth)
    setUser(null)
  }, [])

  const resetStatus = useCallback(() => {
    setStatus('ready')
    setError(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, status, error,
      sendMagicLink, signOut, resetStatus,
      firebaseEnabled,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
