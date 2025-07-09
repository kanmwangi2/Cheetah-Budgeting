import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    return savedTheme || 'system'
  })

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = () => {
      root.classList.remove('light', 'dark')
      
      let shouldBeDark = false
      
      if (theme === 'system') {
        shouldBeDark = mediaQuery.matches
      } else {
        shouldBeDark = theme === 'dark'
      }
      
      setIsDark(shouldBeDark)
      root.classList.add(shouldBeDark ? 'dark' : 'light')
      
      // Update CSS custom properties for toast styling
      root.style.setProperty('--toast-bg', shouldBeDark ? '#374151' : '#ffffff')
      root.style.setProperty('--toast-color', shouldBeDark ? '#f9fafb' : '#111827')
    }

    updateTheme()

    const handleMediaQueryChange = () => {
      if (theme === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handleMediaQueryChange)
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange)
  }, [theme])

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}
