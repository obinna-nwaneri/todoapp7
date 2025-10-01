import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import api from '../utils/api'
import UserManagement from '../components/UserManagement'
import AdminTaskManagement from '../components/AdminTaskManagement'

const COLORS = ['#0d6efd', '#6610f2', '#198754', '#ffc107', '#dc3545']

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState({ totalUsers: 0, totalTasks: 0, tasksByStatus: [], tasksPerUser: [] })
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [overviewResponse, usersResponse, tasksResponse] = await Promise.all([
        api.get('/admin/dashboard/overview'),
        api.get('/admin/users'),
        api.get('/admin/tasks')
      ])
      setOverview(overviewResponse.data)
      setUsers(usersResponse.data?.data || usersResponse.data)
      setTasks(tasksResponse.data?.data || tasksResponse.data)
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load admin data.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateUser = async (values) => {
    try {
      setError('')
      await api.post('/admin/users', values)
      await loadData()
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Unable to create user.'
      setError(message)
    }
  }

  const handleUpdateUser = async (id, values) => {
    try {
      setError('')
      await api.put(`/admin/users/${id}`, values)
      await loadData()
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Unable to update user.'
      setError(message)
    }
  }

  const handleDeleteUser = async (user) => {
    if (window.confirm('Delete this user? All their tasks will also be removed.')) {
      try {
        setError('')
        await api.delete(`/admin/users/${user.id}`)
        await loadData()
      } catch (err) {
        const message = err.response?.data?.message || 'Unable to delete user.'
        setError(message)
      }
    }
  }

  const handleCreateTask = async (values) => {
    try {
      setError('')
      await api.post('/admin/tasks', values)
      await loadData()
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Unable to create task.'
      setError(message)
    }
  }

  const handleUpdateTask = async (id, values) => {
    try {
      setError('')
      await api.put(`/admin/tasks/${id}`, values)
      await loadData()
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Unable to update task.'
      setError(message)
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      setError('')
      await api.delete(`/admin/tasks/${id}`)
      await loadData()
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to delete task.'
      setError(message)
    }
  }

  return (
    <Container className="pb-5">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-0">Administrator overview</Card.Title>
              <Card.Text className="text-muted">Manage users, tasks and get insights into productivity.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Total users</Card.Title>
                  <p className="display-6 mb-0">{overview.totalUsers}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Total tasks</Card.Title>
                  <p className="display-6 mb-0">{overview.totalTasks}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Completion rate</Card.Title>
                  <p className="display-6 mb-0">
                    {overview.totalTasks
                      ? Math.round(
                          (overview.tasksByStatus.find((s) => s.status === 'Completed')?.count || 0) * 100 /
                            overview.totalTasks
                        )
                      : 0}
                    %
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Tasks by status</Card.Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={overview.tasksByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={4}
                      >
                        {overview.tasksByStatus.map((entry, index) => (
                          <Cell key={`cell-${entry.status}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Tasks per user</Card.Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overview.tasksPerUser}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="email" hide={false} angle={-15} textAnchor="end" height={60} interval={0} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d6efd" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={5}>
              <UserManagement
                users={users}
                onCreate={handleCreateUser}
                onUpdate={handleUpdateUser}
                onDelete={handleDeleteUser}
              />
            </Col>
            <Col lg={7}>
              <AdminTaskManagement
                tasks={tasks}
                users={users}
                onCreate={handleCreateTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default AdminDashboard
