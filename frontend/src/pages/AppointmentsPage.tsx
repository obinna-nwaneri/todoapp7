import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import api from '../api/client'
import { useAuth, useAuthGuard } from '../hooks/useAuth'

const AppointmentsPage = () => {
  useAuthGuard()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', user?.id, statusFilter],
    queryFn: async () => {
      if (!user) return []
      if (user.role === 'admin') {
        const { data } = await api.get('/appointments', { params: { status: statusFilter || undefined } })
        return data.data
      }
      if (user.role === 'doctor') {
        const { data } = await api.get(`/doctors/${user.doctorProfile?.id}/appointments`, {
          params: { status: statusFilter || undefined },
        })
        return data.data
      }
      const { data } = await api.get(`/patients/${user.id}/appointments`, {
        params: { status: statusFilter || undefined },
      })
      return data.data
    },
    enabled: Boolean(user),
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/appointments/${id}/status`, { status })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/appointments/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  })

  const columns = (() => {
    const base: Array<{ header: string; key: string; render?: (row: any) => ReactNode }> = [
      { header: 'Date', key: 'scheduledAt', render: (row: any) => new Date(row.scheduledAt).toLocaleString() },
      { header: 'Status', key: 'status' },
      { header: 'Type', key: 'type' },
    ]

    if (user?.role === 'patient') {
      base.splice(1, 0, { header: 'Doctor', key: 'doctor', render: (row: any) => row.doctor?.name ?? 'Unknown' })
    }

    if (user?.role === 'doctor' || user?.role === 'admin') {
      base.splice(1, 0, { header: 'Patient', key: 'patient', render: (row: any) => row.patient?.name ?? 'Unknown' })
    }

    if (user?.role !== 'admin') {
      base.push({
        header: 'Actions',
        key: 'actions',
        render: (row: any) => (
          <div className="action-group">
            {user?.role === 'doctor' && row.status !== 'completed' && (
              <button onClick={() => statusMutation.mutate({ id: row.id, status: 'confirmed' })}>Confirm</button>
            )}
            {row.status !== 'cancelled' && (
              <button onClick={() => cancelMutation.mutate(row.id)}>Cancel</button>
            )}
          </div>
        ),
      })
    }

    return base
  })()

  return (
    <Layout title="Manage appointments">
      <form className="filter-row" onSubmit={(event: FormEvent) => event.preventDefault()}>
        <label>
          Status filter
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </form>
      {appointmentsQuery.isLoading && <p>Loading appointments…</p>}
      {appointmentsQuery.error && <p className="form-error">Unable to load appointments.</p>}
      <DataTable data={appointmentsQuery.data ?? []} columns={columns as any} emptyMessage="No appointments yet." />
    </Layout>
  )
}

export default AppointmentsPage
