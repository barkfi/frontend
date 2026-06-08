import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/entrepots': 'Entrepôts',
  '/articles': 'Articles',
  '/categories': 'Catégories',
  '/stocks': 'Stocks',
  '/mouvements': 'Mouvements de stock',
  '/alertes': 'Alertes',
  '/rapports': 'Rapports',
  '/utilisateurs': 'Utilisateurs',
  '/audit': 'Journal d\'audit',
}

export function AppShell() {
  const path = window.location.pathname
  const title = Object.entries(titles).find(([key]) => key === path || (key !== '/' && path.startsWith(key)))?.[1] ?? 'StockFlow'

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
