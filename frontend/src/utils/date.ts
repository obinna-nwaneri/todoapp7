export function formatDate(date: string | null) {
  if (!date) return 'No due date'
  return new Date(date).toLocaleDateString()
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString()
}
