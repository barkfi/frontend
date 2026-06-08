import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, ArrowLeftRight, AlertTriangle, Warehouse } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import api from '@/api/client'
import { StatsCard, StatusBadge, LoadingSpinner, DataTable, formatDate } from '@/components/shared'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ApiResponse, DashboardData, Mouvement } from '@/types'

const COLORS = ['#4F46E5', '#F43F5E', '#8B5CF6']

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardData>>('/dashboard')
      return res.data.data
    },
  })

  const resolveAlert = useMutation({
    mutationFn: (id: number) => api.put(`/alertes/${id}/resoudre`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  })

  if (isLoading || !data) return <LoadingSpinner />

  const breakdown = Object.entries(data.movement_breakdown ?? {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total articles en stock" value={data.kpis.total_articles_stock} icon={Package} accent="primary" />
        <StatsCard title="Mouvements actifs aujourd'hui" value={data.kpis.active_movements_today} icon={ArrowLeftRight} accent="warning" />
        <StatsCard title="Alertes actives" value={data.kpis.active_alerts} icon={AlertTriangle} accent="danger" />
        <StatsCard title="Entrepôts actifs" value={data.kpis.total_warehouses} icon={Warehouse} accent="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Évolution du stock (30 jours)</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.stock_evolution}>
              <XAxis dataKey="date" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="net" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader><CardTitle>Répartition des mouvements</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top 10 articles les plus mouvementés</CardTitle></CardHeader>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.top_articles}>
            <XAxis dataKey="article" hide /><YAxis /><Tooltip />
            <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Mouvements récents</CardTitle></CardHeader>
          <DataTable
            data={(data.recent_movements as Mouvement[]).map((m) => ({ ...m })) as Array<Record<string, unknown>>}
            columns={[
              { key: 'horodatage', label: 'Date', render: (r) => formatDate(String(r.horodatage)) },
              { key: 'type', label: 'Type', render: (r) => <StatusBadge value={String(r.type)} /> },
              { key: 'statut', label: 'Statut', render: (r) => <StatusBadge value={String(r.statut)} /> },
            ]}
          />
        </Card>
        <Card>
          <CardHeader><CardTitle>Alertes actives</CardTitle></CardHeader>
          <div className="space-y-3">
            {data.active_alerts.map((alert) => (
              <div key={alert.id_alerte} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div>
                  <StatusBadge value={alert.type} />
                  <p className="mt-1 text-sm">{alert.message}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveAlert.mutate(alert.id_alerte)}>Résoudre</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
