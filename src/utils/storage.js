/**
 * Tiny safe wrapper around localStorage.
 * Why: LS calls can throw (private mode, quota, JSON parse) — we want a
 * single try/catch surface so callers stay clean.
 */

export const STORAGE_KEYS = {
  TASKS: 'deepnote:tasks',
  NOTES: 'deepnote:notes',
  CHECKLISTS: 'deepnote:checklists',
  ACTIVITY: 'deepnote:activity',
  THEME: 'deepnote:theme',
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* no-op */
  }
}
