import { Bell, Moon, Sun, LogOut, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/api/client'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, Alerte } from '@/types'
import { formatDate } from '@/utils/cn'

export function TopBar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { darkMode, toggleDarkMode } = useUIStore()
  const navigate = useNavigate()

  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: alerts } = useQuery({
    queryKey: ['active-alertes'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Alerte[]>>('/alertes', { params: { statut: 'active' } })
      return data.data
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            {alerts && alerts.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-slate-200/50 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/95 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications ({alerts?.length ?? 0})</span>
                {alerts && alerts.length > 0 && (
                  <Link
                    to="/alertes"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Voir tout
                  </Link>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {alerts && alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <Link
                      key={alert.id_alerte}
                      to="/alertes"
                      onClick={() => setShowNotifications(false)}
                      className="flex gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {alert.type === 'rupture' ? (
                          <AlertCircle className="h-4 w-4 text-rose-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {alert.stock?.article?.designation} • {alert.stock?.entrepot?.nom}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {formatDate(alert.date_declenchement)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="rounded-full bg-slate-100 p-2.5 dark:bg-slate-800">
                      <Bell className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="mt-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      Aucune notification
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tous vos stocks sont dans les seuils normaux.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
