import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/input'
import { DataTable, LoadingSpinner } from '@/components/shared'
import type { ApiResponse, Entrepot } from '@/types'

export default function RapportsPage() {
  const [tab, setTab] = useState<'stock' | 'mouvements' | 'inventaire'>('stock')
  const [entrepotId, setEntrepotId] = useState('')

  const { data: entrepots } = useQuery({
    queryKey: ['entrepots'],
    queryFn: async () => (await api.get<ApiResponse<Entrepot[]>>('/entrepots')).data.data,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['reports', tab, entrepotId],
    queryFn: async () => {
      const endpoint = tab === 'stock' ? '/reports/stock' : tab === 'mouvements' ? '/reports/mouvements' : '/reports/inventaire'
      const res = await api.get(endpoint, { params: { id_entrepot: entrepotId || undefined } })
      return res.data.data as Array<Record<string, unknown>>
    },
  })

  const exportFile = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams(entrepotId ? { id_entrepot: entrepotId } : {})
      const response = await api.get(`/reports/export/${format}/${tab}?${params.toString()}`, {
        responseType: 'blob',
      })
      
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const filename = `rapport-${tab}-${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'csv'}`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const columns = data?.[0]
    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
    : []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['stock', 'mouvements', 'inventaire'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm capitalize ${tab === t ? 'bg-primary text-white' : 'bg-white ring-1 ring-slate-200 dark:bg-slate-900'}`}>
            {t === 'stock' ? 'État du stock' : t === 'mouvements' ? 'Historique mouvements' : 'Inventaire'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={entrepotId} onChange={(e) => setEntrepotId(e.target.value)}>
          <option value="">Tous entrepôts</option>
          {entrepots?.map((e) => <option key={e.id_entrepot} value={e.id_entrepot}>{e.nom}</option>)}
        </Select>
        <Button variant="outline" onClick={() => exportFile('pdf')}>Exporter PDF</Button>
        <Button variant="outline" onClick={() => exportFile('excel')}>Exporter Excel</Button>
      </div>

      {isLoading ? <LoadingSpinner /> : <DataTable data={data ?? []} columns={columns} />}
    </div>
  )
}
