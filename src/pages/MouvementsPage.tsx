import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { DataTable, LoadingSpinner, StatusBadge, SlideOver, formatDate } from '@/components/shared'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, Article, Entrepot, Mouvement } from '@/types'

export default function MouvementsPage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState('')
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ type: 'entree', id_article: '', id_entrepot_source: '', id_entrepot_destination: '', quantite: '', motif: '', reference_doc: '' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['mouvements', tab],
    queryFn: async () => (await api.get<ApiResponse<Mouvement[]>>('/mouvements', { params: { statut: tab || undefined } })).data.data,
  })

  const { data: articles } = useQuery({ queryKey: ['articles-list'], queryFn: async () => (await api.get<ApiResponse<Article[]>>('/articles')).data.data })
  const { data: entrepots } = useQuery({ queryKey: ['entrepots-list'], queryFn: async () => (await api.get<ApiResponse<Entrepot[]>>('/entrepots')).data.data })

  const createMutation = useMutation({
    mutationFn: () => api.post('/mouvements', {
      type: form.type,
      id_article: Number(form.id_article),
      id_entrepot_source: form.id_entrepot_source ? Number(form.id_entrepot_source) : null,
      id_entrepot_destination: form.id_entrepot_destination ? Number(form.id_entrepot_destination) : null,
      quantite: Number(form.quantite),
      motif: form.motif,
      reference_doc: form.reference_doc,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mouvements'] }); setOpen(false); setStep(1) },
  })

  const validateMutation = useMutation({
    mutationFn: (id: number) => api.put(`/mouvements/${id}/valider`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mouvements'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => api.put(`/mouvements/${id}/rejeter`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mouvements'] }),
  })

  const tabs = [
    { key: '', label: 'Tous' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'valide', label: 'Validés' },
    { key: 'rejete', label: 'Rejetés' },
  ]

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-3 py-1.5 text-sm ${tab === t.key ? 'bg-primary text-white' : 'bg-white ring-1 ring-slate-200 dark:bg-slate-900'}`}>{t.label}</button>
          ))}
        </div>
        {(user?.role === 'administrateur' || user?.role === 'operateur') && (
          <Button onClick={() => setOpen(true)}>Nouveau mouvement</Button>
        )}
      </div>

      <DataTable
        data={(data ?? []).map((m) => ({ ...m })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'horodatage', label: 'Date', render: (r) => formatDate(String(r.horodatage)) },
          { key: 'article', label: 'Article', render: (r) => (r.article as Mouvement['article'])?.designation },
          { key: 'type', label: 'Type', render: (r) => <StatusBadge value={String(r.type)} /> },
          { key: 'quantite', label: 'Quantité' },
          { key: 'statut', label: 'Statut', render: (r) => <StatusBadge value={String(r.statut)} /> },
          {
            key: 'actions', label: 'Actions', render: (r) => user?.role === 'administrateur' && r.statut === 'en_attente' ? (
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => validateMutation.mutate(Number(r.id_mouvement))}>Valider</Button>
                <Button size="sm" variant="danger" onClick={() => rejectMutation.mutate(Number(r.id_mouvement))}>Rejeter</Button>
              </div>
            ) : null,
          },
        ]}
      />

      <SlideOver open={open} title="Nouveau mouvement" onClose={() => setOpen(false)}>
        {step === 1 && (
          <div className="space-y-3">
            {['entree', 'sortie', 'transfert'].map((t) => (
              <button key={t} onClick={() => { setForm({ ...form, type: t }); setStep(2) }} className="w-full rounded-lg border p-4 text-left capitalize hover:bg-slate-50 dark:hover:bg-slate-800">{t}</button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div><Label>Article</Label><Select value={form.id_article} onChange={(e) => setForm({ ...form, id_article: e.target.value })} className="mt-1"><option value="">—</option>{articles?.map((a) => <option key={a.id_article} value={a.id_article}>{a.designation}</option>)}</Select></div>
            {(form.type === 'sortie' || form.type === 'transfert') && (
              <div><Label>Entrepôt source</Label><Select value={form.id_entrepot_source} onChange={(e) => setForm({ ...form, id_entrepot_source: e.target.value })} className="mt-1"><option value="">—</option>{entrepots?.map((e) => <option key={e.id_entrepot} value={e.id_entrepot}>{e.nom}</option>)}</Select></div>
            )}
            {(form.type === 'entree' || form.type === 'transfert') && (
              <div><Label>Entrepôt destination</Label><Select value={form.id_entrepot_destination} onChange={(e) => setForm({ ...form, id_entrepot_destination: e.target.value })} className="mt-1"><option value="">—</option>{entrepots?.map((e) => <option key={e.id_entrepot} value={e.id_entrepot}>{e.nom}</option>)}</Select></div>
            )}
            <Button onClick={() => setStep(3)}>Suivant</Button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div><Label>Quantité</Label><Input type="number" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} className="mt-1" /></div>
            <div><Label>Motif</Label><Input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className="mt-1" /></div>
            <div><Label>Réf. document</Label><Input value={form.reference_doc} onChange={(e) => setForm({ ...form, reference_doc: e.target.value })} className="mt-1" /></div>
            <Button onClick={() => setStep(4)}>Suivant</Button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm">Type: <strong>{form.type}</strong></p>
            <p className="text-sm">Quantité: <strong>{form.quantite}</strong></p>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Confirmer</Button>
          </div>
        )}
      </SlideOver>
    </div>
  )
}
