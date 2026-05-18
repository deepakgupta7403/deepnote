/**
 * Firebase initialization
 *
 * Reads config from Vite env vars (VITE_FIREBASE_*).
 * If env vars are missing, `firebase` will be null — the app falls
 * back to local-only mode and never tries to hit the network.
 */
import { initializeApp } from 'firebase/app'
import {
  getAuth, setPersistence, browserLocalPersistence,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Detect whether the env is configured. If not, we go "offline only" mode.
export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app = null
let auth = null
let db = null

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  // Keep the user signed in forever (until they sign out / clear storage).
  setPersistence(auth, browserLocalPersistence).catch(() => {
    /* ignore — falls back to in-memory only */
  })
} else if (typeof window !== 'undefined') {
  // Helpful nudge for the developer
  console.info(
    '[deepnote] Running in local-only mode. ' +
    'Add Firebase env vars (.env) to enable sync across devices.'
  )
}

export { app, auth, db }
