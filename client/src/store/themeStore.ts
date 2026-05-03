import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
}

const getInitialTheme = (): boolean => {
  const saved = localStorage.getItem('theme')
  if (saved) return saved === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

const useThemeStore = create<ThemeStore>((set) => {
  const isDark = getInitialTheme()
  applyTheme(isDark)

  return {
    isDark,
    toggleTheme: () => {
      set((state) => {
        const newIsDark = !state.isDark
        applyTheme(newIsDark)
        return { isDark: newIsDark }
      })
    },
  }
})

export default useThemeStore