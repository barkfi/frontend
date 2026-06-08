import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Warehouse, Package, Tags, ArrowLeftRight, AlertTriangle,
  FileText, Users, ScrollText, ChevronLeft, Boxes,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import type { ApiResponse } from '@/types'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/entrepots', icon: Warehouse, label: 'Entrepôts' },
  { to: '/articles', icon: Package, label: 'Articles' },
  { to: '/categories', icon: Tags, label: 'Catégories' },
  { to: '/stocks', icon: Boxes, label: 'Stocks' },
  { to: '/mouvements', icon: ArrowLeftRight, label: 'Mouvements' },
  { to: '/alertes', icon: AlertTriangle, label: 'Alertes', badge: true },
  { to: '/rapports', icon: FileText, label: 'Rapports' },
  { to: '/utilisateurs', icon: Users, label: 'Utilisateurs', adminOnly: true },
  { to: '/audit', icon: ScrollText, label: 'Journal d\'audit', adminOnly: true },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const { data: alertCount } = useQuery({
    queryKey: ['alertes-count'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ count: number }>>('/alertes/count')
      return data.data.count
    },
    refetchInterval: 30000,
  })

  return (
    <aside className={cn('flex h-screen flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900', collapsed ? 'w-16' : 'w-60')}>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        {!collapsed && (
          <div>
            <p className="text-lg font-bold text-primary">StockFlow</p>
            <p className="text-xs text-slate-500">Gestion multi-entrepôts</p>
          </div>
        )}
        <button onClick={toggleSidebar} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.filter((item) => !item.adminOnly || user?.role === 'administrateur').map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-indigo-50 text-primary dark:bg-indigo-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && alertCount ? (
                  <span className="rounded-full bg-danger px-2 py-0.5 text-xs text-white">{alertCount}</span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user && !collapsed && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="font-medium">{user.prenom} {user.nom}</p>
          <p className="text-xs capitalize text-slate-500">{user.role}</p>
        </div>
      )}
    </aside>
  )
}
