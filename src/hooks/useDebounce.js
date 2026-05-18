import { useEffect, useState } from 'react'

/**
 * useDebounce — returns a debounced version of `value`.
 * Used for auto-save (we don't want to write on every keystroke).
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
