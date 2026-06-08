import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Utilisateur } from '@/types'

interface AuthState {
  user: Utilisateur | null
  token: string | null
  setAuth: (user: Utilisateur, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'stockflow-auth' }
  )
)
