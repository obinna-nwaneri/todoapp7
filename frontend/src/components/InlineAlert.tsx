interface InlineAlertProps {
  variant?: 'error' | 'success' | 'info'
  message: string
}

const styles = {
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
} as const

export function InlineAlert({ variant = 'info', message }: InlineAlertProps) {
  return <div className={`rounded-md border px-3 py-2 text-sm ${styles[variant]}`}>{message}</div>
}
