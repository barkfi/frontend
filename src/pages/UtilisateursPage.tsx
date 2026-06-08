import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { DataTable, LoadingSpinner, StatusBadge, SlideOver, formatDate } from '@/components/shared'
import type { ApiResponse, Utilisateur } from '@/types'

export default function UtilisateursPage() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<ApiResponse<Utilisateur[]>>('/users')).data.data,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/users', payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setOpen(false) },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: boolean }) => api.put(`/users/${id}`, { statut }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Nouvel utilisateur</Button>
      <DataTable
        data={(data ?? []).map((u) => ({ ...u })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'nom', label: 'Nom', render: (r) => `${r.prenom} ${r.nom}` },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rôle', render: (r) => <StatusBadge value={String(r.role)} /> },
          { key: 'statut', label: 'Statut', render: (r) => (
            <button onClick={() => toggleMutation.mutate({ id: Number(r.id_utilisateur), statut: !r.statut })}>
              <StatusBadge value={r.statut ? 'valide' : 'rejete'} />
            </button>
          )},
          { key: 'derniere_connexion', label: 'Dernière connexion', render: (r) => r.derniere_connexion ? formatDate(String(r.derniere_connexion)) : '—' },
        ]}
      />

      <SlideOver open={open} title="Nouvel utilisateur" onClose={() => setOpen(false)}>
        <form onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          createMutation.mutate({
            nom: fd.get('nom'),
            prenom: fd.get('prenom'),
            email: fd.get('email'),
            mot_de_passe: fd.get('mot_de_passe'),
            role: fd.get('role'),
            statut: true,
          })
        }} className="space-y-4">
          <div><Label>Prénom</Label><Input name="prenom" required className="mt-1" /></div>
          <div><Label>Nom</Label><Input name="nom" required className="mt-1" /></div>
          <div><Label>Email</Label><Input name="email" type="email" required className="mt-1" /></div>
          <div><Label>Mot de passe</Label><Input name="mot_de_passe" type="password" required className="mt-1" /></div>
          <div><Label>Rôle</Label><Select name="role" className="mt-1"><option value="operateur">Opérateur</option><option value="consultant">Consultant</option><option value="administrateur">Administrateur</option></Select></div>
          <Button type="submit">Créer</Button>
        </form>
      </SlideOver>
    </div>
  )
}
