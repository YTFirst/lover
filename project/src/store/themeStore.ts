import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    return { isDark: newTheme }
  }),
  setTheme: (isDark: boolean) => set(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    return { isDark }
  }),
}))

// 初始化主题
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
  useThemeStore.getState().setTheme(true)
}