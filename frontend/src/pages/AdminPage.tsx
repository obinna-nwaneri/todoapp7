import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import api from '../api/client'
import { useAuth, useAuthGuard } from '../hooks/useAuth'

const AdminPage = () => {
  useAuthGuard()
  const { user } = useAuth()

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users')
      return data.data
    },
    enabled: user?.role === 'admin',
  })

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <Layout title="Administration">
      {usersQuery.isLoading && <p>Loading users…</p>}
      {usersQuery.error && <p className="form-error">Unable to load user directory.</p>}
      <DataTable
        data={usersQuery.data ?? []}
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Role', key: 'role' },
          { header: 'Status', key: 'isActive', render: (row: any) => (row.isActive ? 'Active' : 'Inactive') },
        ]}
        emptyMessage="No users available."
      />
    </Layout>
  )
}

export default AdminPage
