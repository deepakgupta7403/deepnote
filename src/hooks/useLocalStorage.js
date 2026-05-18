import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../utils/storage.js'

/**
 * useLocalStorage — sync a React state value with localStorage.
 *
 * Behaves like useState but the value is persisted under `key`.
 * Reads once on mount, writes on every change.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadJSON(key, initialValue))

  useEffect(() => {
    saveJSON(key, value)
  }, [key, value])

  return [value, setValue]
}
