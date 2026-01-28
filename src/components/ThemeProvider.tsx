'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'dark'
  resolvedTheme: 'dark'
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always dark theme for streaming style
  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
