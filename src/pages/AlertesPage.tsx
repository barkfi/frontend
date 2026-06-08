import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/input'
import { DataTable, LoadingSpinner, StatusBadge, ConfirmDialog, formatDate } from '@/components/shared'
import type { ApiResponse, Alerte } from '@/types'

export default function AlertesPage() {
  const [type, setType] = useState('')
  const [statut, setStatut] = useState('active')
  const [resolveId, setResolveId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['alertes', type, statut],
    queryFn: async () => (await api.get<ApiResponse<Alerte[]>>('/alertes', { params: { type: type || undefined, statut: statut || undefined } })).data.data,
    refetchInterval: 30000,
  })

  const resolveMutation = useMutation({
    mutationFn: (id: number) => api.put(`/alertes/${id}/resoudre`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['alertes'] })
      const previous = queryClient.getQueryData(['alertes', type, statut])
      queryClient.setQueryData(['alertes', type, statut], (old: Alerte[] | undefined) =>
        old?.map((a) => (a.id_alerte === id ? { ...a, statut: 'resolue' as const } : a))
      )
      return { previous }
    },
    onError: (_e, _id, ctx) => queryClient.setQueryData(['alertes', type, statut], ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alertes'] }),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous types</option>
          <option value="rupture">Rupture</option>
          <option value="seuil_min">Seuil min</option>
          <option value="seuil_max">Seuil max</option>
        </Select>
        <Select value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="active">Actives</option>
          <option value="resolue">Résolues</option>
        </Select>
      </div>

      <DataTable
        data={(data ?? []).map((a) => ({ ...a })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'type', label: 'Type', render: (r) => <StatusBadge value={String(r.type)} /> },
          { key: 'message', label: 'Message' },
          { key: 'article', label: 'Article', render: (r) => (r.stock as Alerte['stock'])?.article?.designation },
          { key: 'entrepot', label: 'Entrepôt', render: (r) => (r.stock as Alerte['stock'])?.entrepot?.nom },
          { key: 'date_declenchement', label: 'Date', render: (r) => formatDate(String(r.date_declenchement)) },
          {
            key: 'actions', label: 'Actions', render: (r) => r.statut === 'active' ? (
              <Button size="sm" variant="outline" onClick={() => setResolveId(Number(r.id_alerte))}>Résoudre</Button>
            ) : <StatusBadge value="resolue" />,
          },
        ]}
      />

      <ConfirmDialog
        open={!!resolveId}
        title="Résoudre l'alerte"
        message="Marquer cette alerte comme résolue ?"
        onCancel={() => setResolveId(null)}
        onConfirm={() => resolveId && resolveMutation.mutate(resolveId)}
        loading={resolveMutation.isPending}
      />
    </div>
  )
}
