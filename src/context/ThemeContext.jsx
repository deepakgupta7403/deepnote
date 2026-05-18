import { createContext, useContext, useEffect, useState } from 'react'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage.js'

const ThemeContext = createContext(null)

/**
 * ThemeProvider — handles dark/light mode.
 * - Persists choice in localStorage
 * - Defaults to user's system preference on first load
 * - Adds/removes `dark` class on <html> (Tailwind darkMode: 'class')
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = loadJSON(STORAGE_KEYS.THEME, null)
    if (saved === 'light' || saved === 'dark') return saved
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    saveJSON(STORAGE_KEYS.THEME, theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
