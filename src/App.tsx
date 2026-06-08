import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EntrepotsPage from '@/pages/EntrepotsPage'
import EntrepotDetailPage from '@/pages/EntrepotDetailPage'
import ArticlesPage from '@/pages/ArticlesPage'
import CategoriesPage from '@/pages/CategoriesPage'
import StocksPage from '@/pages/StocksPage'
import MouvementsPage from '@/pages/MouvementsPage'
import AlertesPage from '@/pages/AlertesPage'
import RapportsPage from '@/pages/RapportsPage'
import UtilisateursPage from '@/pages/UtilisateursPage'
import AuditPage from '@/pages/AuditPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/entrepots" element={<EntrepotsPage />} />
              <Route path="/entrepots/:id" element={<EntrepotDetailPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/stocks" element={<StocksPage />} />
              <Route path="/mouvements" element={<MouvementsPage />} />
              <Route path="/alertes" element={<AlertesPage />} />
              <Route path="/rapports" element={<RapportsPage />} />
              <Route element={<ProtectedRoute roles={['administrateur']} />}>
                <Route path="/utilisateurs" element={<UtilisateursPage />} />
                <Route path="/audit" element={<AuditPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
