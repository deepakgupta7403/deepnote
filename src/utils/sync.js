/**
 * Firestore sync helpers.
 *
 * Data shape in Firestore:
 *   users/{uid}/data/state  →  { tasks, notes, checklists, activity, updatedAt }
 *
 * We keep all four arrays inside a single document for simplicity & atomic
 * writes. Personal data is small (a few KB), so this works fine well past
 * thousands of items.
 */
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

const docRef = (uid) => doc(db, 'users', uid, 'data', 'state')

/** Read once. Returns the saved object or null if there's no remote doc yet. */
export async function readRemote(uid) {
  const snap = await getDoc(docRef(uid))
  if (!snap.exists()) return null
  return snap.data()
}

/** Write the whole state object. Last-write-wins. */
export async function writeRemote(uid, state) {
  await setDoc(docRef(uid), { ...state, updatedAt: serverTimestamp() })
}

/**
 * Live subscription to remote changes (for real-time cross-device sync).
 * Returns an unsubscribe function.
 */
export function subscribeRemote(uid, onChange) {
  return onSnapshot(docRef(uid), (snap) => {
    if (snap.exists()) onChange(snap.data())
  }, (err) => {
    console.error('Firestore subscribe error:', err)
  })
}
