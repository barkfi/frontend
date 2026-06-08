import { cn } from '@/utils/cn'

const variants: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: keyof typeof variants; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
