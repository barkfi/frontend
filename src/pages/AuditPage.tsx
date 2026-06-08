import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { Input, Select } from '@/components/ui/input'
import { DataTable, LoadingSpinner, formatDate } from '@/components/shared'
import type { ApiResponse, AuditLog } from '@/types'

export default function AuditPage() {
  const [action, setAction] = useState('')
  const [table, setTable] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', action, table],
    queryFn: async () => (await api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params: { action: action || undefined, table_cible: table || undefined } })).data.data,
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Toutes actions</option>
          {['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'REJECT'].map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Input placeholder="Table cible" value={table} onChange={(e) => setTable(e.target.value)} className="max-w-xs" />
      </div>

      <DataTable
        data={(data ?? []).map((l) => ({ ...l })) as Array<Record<string, unknown>>}
        columns={[
          { key: 'horodatage', label: 'Date', render: (r) => formatDate(String(r.horodatage)) },
          { key: 'utilisateur', label: 'Utilisateur', render: (r) => {
            const u = r.utilisateur as AuditLog['utilisateur']
            return u ? `${u.prenom} ${u.nom}` : '—'
          }},
          { key: 'action', label: 'Action' },
          { key: 'table_cible', label: 'Table' },
          { key: 'id_enregistrement', label: 'ID' },
          { key: 'ip_utilisateur', label: 'IP' },
          { key: 'details', label: 'Détails', render: (r) => (
            <details>
              <summary className="cursor-pointer text-primary">Voir diff</summary>
              <pre className="mt-2 max-w-md overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{JSON.stringify(r.details_json, null, 2)}</pre>
            </details>
          )},
        ]}
      />
    </div>
  )
}
