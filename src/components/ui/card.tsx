import { cn } from '@/utils/cn'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>{children}</div>
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4 flex items-center justify-between', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>
}
