import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { cn } from '@/utils/cn'
import { DataTable, LoadingSpinner, StatusBadge } from '@/components/shared'
import { Input } from '@/components/ui/input'
import type { ApiResponse, Entrepot, Stock } from '@/types'

export default function StocksPage() {
  const [entrepotId, setEntrepotId] = useState<number | null>(null)
  const [editing, setEditing] = useState<{ id: number; field: 'seuil_min' | 'seuil_max'; value: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: entrepots } = useQuery({
    queryKey: ['entrepots'],
    queryFn: async () => (await api.get<ApiResponse<Entrepot[]>>('/entrepots')).data.data,
  })

  const activeEntrepot = entrepotId ?? entrepots?.[0]?.id_entrepot

  const { data: stocks, isLoading } = useQuery({
    queryKey: ['stocks', activeEntrepot],
    enabled: !!activeEntrepot,
    queryFn: async () => (await api.get<ApiResponse<Stock[]>>(`/stocks/entrepot/${activeEntrepot}`)).data.data,
  })

  const updateSeuils = useMutation({
    mutationFn: ({ id, seuil_min, seuil_max }: { id: number; seuil_min?: number; seuil_max?: number }) =>
      api.put(`/stocks/${id}/seuils`, { seuil_min, seuil_max }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      setEditing(null)
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {entrepots?.map((e) => (
          <button
            key={e.id_entrepot}
            onClick={() => setEntrepotId(e.id_entrepot)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium',
              activeEntrepot === e.id_entrepot ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700'
            )}
          >
            {e.nom}
          </button>
        ))}
      </div>

      <DataTable
        data={(stocks ?? []).map((s) => ({ ...s })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'article', label: 'Article', render: (r) => (r.article as Stock['article'])?.designation },
          { key: 'quantite', label: 'Quantité', render: (r) => {
            const stock = r as unknown as Stock
            const low = stock.seuil_min != null && Number(stock.quantite) <= Number(stock.seuil_min)
            return <span className={cn(low && 'font-semibold text-danger')}>{String(stock.quantite)}</span>
          }},
          { key: 'seuil_min', label: 'Seuil min', render: (r) => {
            const stock = r as unknown as Stock
            if (editing?.id === stock.id_stock && editing.field === 'seuil_min') {
              return (
                <Input
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onBlur={() => updateSeuils.mutate({ id: stock.id_stock, seuil_min: Number(editing.value), seuil_max: stock.seuil_max ? Number(stock.seuil_max) : undefined })}
                  className="h-8 w-24"
                />
              )
            }
            return <button onClick={() => setEditing({ id: stock.id_stock, field: 'seuil_min', value: String(stock.seuil_min ?? '') })}>{stock.seuil_min ?? '—'}</button>
          }},
          { key: 'seuil_max', label: 'Seuil max', render: (r) => {
            const stock = r as unknown as Stock
            if (editing?.id === stock.id_stock && editing.field === 'seuil_max') {
              return (
                <Input
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onBlur={() => updateSeuils.mutate({ id: stock.id_stock, seuil_max: Number(editing.value), seuil_min: stock.seuil_min ? Number(stock.seuil_min) : undefined })}
                  className="h-8 w-24"
                />
              )
            }
            return <button onClick={() => setEditing({ id: stock.id_stock, field: 'seuil_max', value: String(stock.seuil_max ?? '') })}>{stock.seuil_max ?? '—'}</button>
          }},
          { key: 'statut', label: 'Statut', render: (r) => <StatusBadge value={String((r as unknown as Stock).statut_label ?? 'normal')} /> },
        ]}
      />
    </div>
  )
}
