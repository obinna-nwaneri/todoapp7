import { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import api from '../utils/api'

const UserDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', upcoming: false })

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.upcoming) params.upcoming = true
      const { data } = await api.get('/tasks', { params })
      setTasks(data?.data || data)
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load tasks.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.upcoming])

  const upcomingTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.due_date) return false
      const due = new Date(task.due_date)
      const now = new Date()
      return due >= now
    })
  }, [tasks])

  const handleCreate = async (values) => {
    setError('')
    try {
      await api.post('/tasks', values)
      setShowForm(false)
      await fetchTasks()
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Unable to create task.'
      setError(message)
    }
  }

  const handleUpdate = async (values) => {
    if (!editingTask) return
    setError('')
    try {
      await api.put(`/tasks/${editingTask.id}`, values)
      setEditingTask(null)
      await fetchTasks()
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Unable to update task.'
      setError(message)
    }
  }

  const handleDelete = async (task) => {
    if (window.confirm('Delete this task?')) {
      setError('')
      try {
        await api.delete(`/tasks/${task.id}`)
        await fetchTasks()
      } catch (err) {
        const message = err.response?.data?.message || 'Unable to delete task.'
        setError(message)
      }
    }
  }

  const onFilterChange = (event) => {
    const { name, value, checked, type } = event.target
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <Container className="pb-5">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="mb-1">Welcome back!</Card.Title>
                <Card.Text className="text-muted">
                  Manage your personal tasks, filter by status and keep track of priorities.
                </Card.Text>
              </div>
              <div className="text-end">
                <p className="mb-0 fw-semibold">Total tasks: {tasks.length}</p>
                <p className="mb-0 text-success">Upcoming: {upcomingTasks.length}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={4}>
          <Form.Group controlId="filter-status">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={filters.status} onChange={onFilterChange}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="filter-priority">
            <Form.Label>Priority</Form.Label>
            <Form.Select name="priority" value={filters.priority} onChange={onFilterChange}>
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="filter-upcoming"
            name="upcoming"
            label="Show upcoming tasks"
            checked={filters.upcoming}
            onChange={onFilterChange}
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col className="d-flex gap-2">
          <Button variant="primary" onClick={() => { setEditingTask(null); setShowForm((prev) => !prev) }}>
            {showForm ? 'Close form' : 'Add task'}
          </Button>
          {editingTask && (
            <Button variant="outline-secondary" onClick={() => setEditingTask(null)}>
              Cancel edit
            </Button>
          )}
        </Col>
      </Row>

      <Row className="g-4">
        {showForm && (
          <Col xs={12}>
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </Col>
        )}

        {editingTask && (
          <Col xs={12}>
            <TaskForm initialValues={editingTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />
          </Col>
        )}

        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Your tasks</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <TaskList tasks={tasks} onEdit={setEditingTask} onDelete={handleDelete} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default UserDashboard
