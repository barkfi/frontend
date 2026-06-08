import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { DataTable, LoadingSpinner, SlideOver } from '@/components/shared'
import type { ApiResponse, Categorie } from '@/types'

export default function CategoriesPage() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<ApiResponse<Categorie[]>>('/categories')).data.data,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Categorie>) => api.post('/categories', payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setOpen(false) },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Nouvelle catégorie</Button>
      <DataTable
        data={(data ?? []).map((c) => ({ ...c })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'nom', label: 'Nom' },
          { key: 'description', label: 'Description' },
          { key: 'articles_count', label: 'Articles' },
        ]}
      />
      <SlideOver open={open} title="Nouvelle catégorie" onClose={() => setOpen(false)}>
        <form onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          createMutation.mutate({ nom: String(fd.get('nom')), description: String(fd.get('description') || '') })
        }} className="space-y-4">
          <div><Label>Nom</Label><Input name="nom" required className="mt-1" /></div>
          <div><Label>Description</Label><Input name="description" className="mt-1" /></div>
          <Button type="submit">Créer</Button>
        </form>
      </SlideOver>
    </div>
  )
}
