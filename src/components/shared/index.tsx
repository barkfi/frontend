import { cn, formatDate } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'

const typeMap: Record<string, { label: string; variant: 'primary' | 'danger' | 'purple' | 'success' | 'warning' | 'default' }> = {
  entree: { label: 'Entrée', variant: 'primary' },
  sortie: { label: 'Sortie', variant: 'danger' },
  transfert: { label: 'Transfert', variant: 'purple' },
  en_attente: { label: 'En attente', variant: 'warning' },
  valide: { label: 'Validé', variant: 'success' },
  rejete: { label: 'Rejeté', variant: 'danger' },
  rupture: { label: 'Rupture', variant: 'danger' },
  seuil_min: { label: 'Seuil min', variant: 'warning' },
  seuil_max: { label: 'Seuil max', variant: 'warning' },
  normal: { label: 'Normal', variant: 'success' },
  administrateur: { label: 'Admin', variant: 'primary' },
  operateur: { label: 'Opérateur', variant: 'success' },
  consultant: { label: 'Consultant', variant: 'purple' },
  active: { label: 'Active', variant: 'danger' },
  resolue: { label: 'Résolue', variant: 'success' },
}

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const config = typeMap[value] ?? { label: value, variant: 'default' as const }
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>
}

export function StatsCard({ title, value, icon: Icon, trend, accent = 'primary' }: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  accent?: 'primary' | 'success' | 'warning' | 'danger'
}) {
  const accents = {
    primary: 'text-primary bg-indigo-50 dark:bg-indigo-950',
    success: 'text-success bg-emerald-50 dark:bg-emerald-950',
    warning: 'text-warning bg-amber-50 dark:bg-amber-950',
    danger: 'text-danger bg-rose-50 dark:bg-rose-950',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
        </div>
        <div className={cn('rounded-lg p-3', accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <div className={cn('h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent', className)} />
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Annuler</button>
          <button onClick={onConfirm} disabled={loading} className="rounded-lg bg-danger px-4 py-2 text-sm text-white hover:bg-rose-600 disabled:opacity-50">
            {loading ? '...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SlideOver({ open, title, onClose, children }: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-lg dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function DataTable({ columns, data, emptyMessage = 'Aucune donnée' }: {
  columns: Array<{ key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }>
  data: Array<Record<string, unknown>>
  emptyMessage?: string
}) {
  if (!data.length) return <EmptyState title={emptyMessage} />

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { formatDate }
