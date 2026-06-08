import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/api/client'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { LoadingSpinner, SlideOver, StatusBadge } from '@/components/shared'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, Entrepot } from '@/types'

export default function EntrepotsPage() {
  const user = useAuthStore((s) => s.user)
  const [slideOpen, setSlideOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['entrepots'],
    queryFn: async () => (await api.get<ApiResponse<Entrepot[]>>('/entrepots')).data.data,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Entrepot>) => api.post('/entrepots', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] })
      setSlideOpen(false)
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {user?.role === 'administrateur' && (
        <Button onClick={() => setSlideOpen(true)}>Nouvel entrepôt</Button>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((e) => (
          <Link key={e.id_entrepot} to={`/entrepots/${e.id_entrepot}`}>
            <Card className="transition hover:shadow-md">
              <CardTitle>{e.nom}</CardTitle>
              <p className="mt-2 text-sm text-slate-500">{e.ville}</p>
              <p className="text-sm">Responsable: {e.responsable}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge value={e.statut ? 'valide' : 'rejete'} />
                <span className="text-sm text-slate-500">{e.stocks_count ?? 0} stocks</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <SlideOver open={slideOpen} title="Nouvel entrepôt" onClose={() => setSlideOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            createMutation.mutate({
              nom: String(fd.get('nom')),
              ville: String(fd.get('ville') || ''),
              adresse: String(fd.get('adresse') || ''),
              responsable: String(fd.get('responsable') || ''),
              statut: true,
            })
          }}
          className="space-y-4"
        >
          <div><Label>Nom</Label><Input name="nom" required className="mt-1" /></div>
          <div><Label>Ville</Label><Input name="ville" className="mt-1" /></div>
          <div><Label>Adresse</Label><Input name="adresse" className="mt-1" /></div>
          <div><Label>Responsable</Label><Input name="responsable" className="mt-1" /></div>
          <Button type="submit">Créer</Button>
        </form>
      </SlideOver>
    </div>
  )
}
