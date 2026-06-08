import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  darkMode: boolean
  toggleSidebar: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      darkMode: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      toggleDarkMode: () => {
        const next = !get().darkMode
        document.documentElement.classList.toggle('dark', next)
        set({ darkMode: next })
      },
    }),
    { name: 'stockflow-ui' }
  )
)
