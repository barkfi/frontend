import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { Card, CardTitle } from '@/components/ui/card'
import { DataTable, LoadingSpinner, StatusBadge } from '@/components/shared'
import type { ApiResponse, Entrepot, Stock } from '@/types'

export default function EntrepotDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['entrepot', id],
    queryFn: async () => (await api.get<ApiResponse<Entrepot>>(`/entrepots/${id}`)).data.data,
  })

  if (isLoading || !data) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>{data.nom}</CardTitle>
        <p className="text-sm text-slate-500">{data.adresse}, {data.ville}</p>
        <p className="text-sm">Responsable: {data.responsable}</p>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold">Emplacements</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {data.emplacements?.map((e) => (
            <Card key={e.id_emplacement}><CardTitle className="text-base">{e.libelle}</CardTitle><p className="text-sm text-slate-500">{e.description}</p></Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Stock actuel</h3>
        <DataTable
          data={(data.stocks ?? []).map((s) => ({ ...s })) as Array<Record<string, unknown>>}
          columns={[
            { key: 'article', label: 'Article', render: (r) => (r.article as Stock['article'])?.designation },
            { key: 'quantite', label: 'Quantité' },
            { key: 'statut', label: 'Statut', render: (r) => <StatusBadge value={String((r as unknown as Stock).statut_label ?? 'normal')} /> },
          ]}
        />
      </div>
    </div>
  )
}
