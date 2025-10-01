import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import StatsCard from '../components/StatsCard'
import DataTable from '../components/DataTable'
import api from '../api/client'
import { useAuth, useAuthGuard } from '../hooks/useAuth'

const DashboardPage = () => {
  useAuthGuard()
  const { user } = useAuth()

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user) return null
      if (user.role === 'admin') {
        const { data } = await api.get('/admin/dashboard')
        return data.data
      }
      if (user.role === 'doctor') {
        const [{ data: appointments }, { data: doctor }] = await Promise.all([
          api.get(`/doctors/${user.doctorProfile?.id}/appointments`),
          api.get(`/doctors/${user.doctorProfile?.id}`),
        ])
        return { appointments: appointments.data, doctor: doctor.data }
      }
      const [{ data: appointments }, { data: records }] = await Promise.all([
        api.get(`/patients/${user.id}/appointments`),
        api.get(`/patients/${user.id}/records`),
      ])
      return { appointments: appointments.data, records: records.data }
    },
    enabled: Boolean(user),
  })

  if (!user) {
    return null
  }

  return (
    <Layout title={`Hello, ${user.name}`}> 
      {dashboardQuery.isLoading && <p>Loading dashboard…</p>}
      {dashboardQuery.error && <p className="form-error">Unable to load data.</p>}
      {dashboardQuery.data && (
        <div className="dashboard-grid">
          {user.role === 'admin' && dashboardQuery.data && (
            <>
              <section className="stats-grid">
                <StatsCard label="Total patients" value={dashboardQuery.data.patients} />
                <StatsCard label="Total doctors" value={dashboardQuery.data.doctors} />
                <StatsCard label="Appointments" value={dashboardQuery.data.appointments} />
                <StatsCard label="Revenue" value={`$${dashboardQuery.data.revenue.toFixed(2)}`} />
                <StatsCard label="Today" value={dashboardQuery.data.today} helper="Bookings today" />
                <StatsCard label="Pending approvals" value={dashboardQuery.data.pendingApprovals} />
              </section>
              <AdminReports />
            </>
          )}

          {user.role === 'doctor' && (
            <section>
              <h2 className="section-title">Upcoming appointments</h2>
              <DataTable
                data={dashboardQuery.data.appointments}
                columns={[
                  { header: 'Date', key: 'scheduledAt', render: (row: any) => new Date(row.scheduledAt).toLocaleString() },
                  { header: 'Patient', key: 'patient', render: (row: any) => row.patient?.name ?? 'Unknown' },
                  { header: 'Status', key: 'status' },
                  { header: 'Type', key: 'type' },
                ]}
                emptyMessage="No upcoming appointments"
              />
            </section>
          )}

          {user.role === 'patient' && (
            <section className="two-column">
              <div>
                <h2 className="section-title">Your appointments</h2>
                <DataTable
                  data={dashboardQuery.data.appointments}
                  columns={[
                    { header: 'Date', key: 'scheduledAt', render: (row: any) => new Date(row.scheduledAt).toLocaleString() },
                    { header: 'Doctor', key: 'doctor', render: (row: any) => row.doctor?.name ?? 'Unknown' },
                    { header: 'Status', key: 'status' },
                    { header: 'Type', key: 'type' },
                  ]}
                  emptyMessage="No appointments booked yet"
                />
              </div>
              <div>
                <h2 className="section-title">Medical records</h2>
                <DataTable
                  data={dashboardQuery.data.records}
                  columns={[
                    { header: 'Doctor', key: 'doctor', render: (row: any) => row.doctor?.name ?? 'Unknown' },
                    { header: 'Summary', key: 'summary' },
                    { header: 'Prescriptions', key: 'prescriptions' },
                  ]}
                  emptyMessage="Your prescriptions and visit notes will appear here."
                />
              </div>
            </section>
          )}
        </div>
      )}
    </Layout>
  )
}

const AdminReports = () => {
  const reportsQuery = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await api.get('/admin/reports')
      return data.data
    },
  })

  if (reportsQuery.isLoading) {
    return <p>Loading reports…</p>
  }

  if (reportsQuery.error) {
    return <p className="form-error">Unable to load reports.</p>
  }

  return (
    <section>
      <h2 className="section-title">Recent performance</h2>
      <div className="two-column">
        <div>
          <h3 className="section-subtitle">Appointment trends</h3>
          <DataTable
            data={reportsQuery.data.appointmentTrends}
            columns={[
              { header: 'Period', key: 'period' },
              { header: 'Appointments', key: 'total' },
            ]}
          />
        </div>
        <div>
          <h3 className="section-subtitle">Top doctors</h3>
          <DataTable
            data={reportsQuery.data.doctorPerformance}
            columns={[
              { header: 'Doctor ID', key: 'doctorId' },
              { header: 'Appointments', key: 'totalAppointments' },
              { header: 'Completed', key: 'completed' },
              { header: 'Cancelled', key: 'cancelled' },
            ]}
            emptyMessage="No appointment data yet."
          />
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
