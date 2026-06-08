import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { DataTable, LoadingSpinner, ConfirmDialog, SlideOver } from '@/components/shared'
import type { ApiResponse, Article, Categorie } from '@/types'

export default function ArticlesPage() {
  const [search, setSearch] = useState('')
  const [categorieId, setCategorieId] = useState('')
  const [slideOpen, setSlideOpen] = useState(false)
  const [editArticle, setEditArticle] = useState<Article | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<ApiResponse<Categorie[]>>('/categories')).data.data,
  })

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', search, categorieId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Article[]>>('/articles', { params: { search, id_categorie: categorieId || undefined } })
      return res.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Article>) =>
      editArticle ? api.put(`/articles/${editArticle.id_article}`, payload) : api.post('/articles', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setSlideOpen(false)
      setEditArticle(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setDeleteId(null)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    saveMutation.mutate({
      code: String(fd.get('code')),
      designation: String(fd.get('designation')),
      unite_mesure: String(fd.get('unite_mesure') || ''),
      id_categorie: fd.get('id_categorie') ? Number(fd.get('id_categorie')) : undefined,
      description: String(fd.get('description') || ''),
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories?.map((c) => <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>)}
        </Select>
        <Button onClick={() => { setEditArticle(null); setSlideOpen(true) }}><Plus className="h-4 w-4" /> Nouvel article</Button>
      </div>

      <DataTable
        data={(articles ?? []).map((a) => ({ ...a })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'designation', label: 'Désignation' },
          { key: 'categorie', label: 'Catégorie', render: (r) => (r.categorie as Categorie)?.nom ?? '-' },
          { key: 'unite_mesure', label: 'Unité' },
          { key: 'stock_total', label: 'Stock total' },
          {
            key: 'actions', label: 'Actions', render: (r) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditArticle(r as unknown as Article); setSlideOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(Number(r.id_article))}><Trash2 className="h-4 w-4 text-danger" /></Button>
              </div>
            ),
          },
        ]}
      />

      <SlideOver open={slideOpen} title={editArticle ? 'Modifier article' : 'Nouvel article'} onClose={() => setSlideOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Code</Label><Input name="code" defaultValue={editArticle?.code} required className="mt-1" /></div>
          <div><Label>Désignation</Label><Input name="designation" defaultValue={editArticle?.designation} required className="mt-1" /></div>
          <div><Label>Unité</Label><Input name="unite_mesure" defaultValue={editArticle?.unite_mesure} className="mt-1" /></div>
          <div>
            <Label>Catégorie</Label>
            <Select name="id_categorie" defaultValue={editArticle?.id_categorie ?? ''} className="mt-1">
              <option value="">—</option>
              {categories?.map((c) => <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>)}
            </Select>
          </div>
          <div><Label>Description</Label><Input name="description" defaultValue={editArticle?.description} className="mt-1" /></div>
          <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer l'article"
        message="Cette action est irréversible."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
