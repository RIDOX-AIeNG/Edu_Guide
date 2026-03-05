// FILE: src/context/ThemeContext.jsx
// 3 themes: forest | midnight | amber
// Persists to localStorage. Applies data-theme to <html> element.

import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = [
  {
    id:    'forest',
    name:  'Forest',
    desc:  'Fresh green — focus & growth',
    swatch: '#16a34a',
    bg:    '#06180d',
  },
  {
    id:    'midnight',
    name:  'Midnight',
    desc:  'Deep indigo — night focus mode',
    swatch: '#6366f1',
    bg:    '#070c1a',
  },
  {
    id:    'amber',
    name:  'Amber',
    desc:  'Warm gold — Nigerian energy',
    swatch: '#d97706',
    bg:    '#160800',
  },
]

const ThemeCtx = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState(() =>
    localStorage.getItem('eg_theme') || 'forest'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('eg_theme', theme)
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: setThemeRaw, themes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
