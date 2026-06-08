import { Bell, Moon, Sun, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNavigate } from 'react-router-dom'
import api from '@/api/client'

export function TopBar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { darkMode, toggleDarkMode } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-500">Bienvenue, {user?.prenom}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <button onClick={toggleDarkMode} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Mode sombre">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button onClick={handleLogout} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Déconnexion">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
