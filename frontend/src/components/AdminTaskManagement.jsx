import { useMemo, useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import TaskForm from './TaskForm'
import TaskList from './TaskList'

const AdminTaskManagement = ({ tasks = [], users = [], onCreate, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', user_id: '' })

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = filters.status ? task.status === filters.status : true
      const matchesPriority = filters.priority ? task.priority === filters.priority : true
      const matchesUser = filters.user_id ? String(task.user_id) === String(filters.user_id) : true
      return matchesStatus && matchesPriority && matchesUser
    })
  }, [tasks, filters])

  const normalizePayload = (values) => ({
    ...values,
    user_id: values.user_id ? Number(values.user_id) : undefined
  })

  const handleCreate = async (values) => {
    await onCreate(normalizePayload(values))
    setShowForm(false)
  }

  const handleUpdate = async (values) => {
    if (!editingTask) return
    await onUpdate(editingTask.id, normalizePayload(values))
    setEditingTask(null)
  }

  const handleDelete = async (task) => {
    if (window.confirm('Delete this task?')) {
      await onDelete(task.id)
    }
  }

  const onFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="shadow-sm">
      <Card.Body className="d-grid gap-4">
        <div className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Task management</Card.Title>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={() => setShowForm((prev) => !prev)}>
              {showForm ? 'Close form' : 'Create task'}
            </Button>
          </div>
        </div>

        <Form as={Row} className="g-3" onSubmit={(event) => event.preventDefault()}>
          <Col md={4}>
            <Form.Group controlId="admin-filter-status">
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
            <Form.Group controlId="admin-filter-priority">
              <Form.Label>Priority</Form.Label>
              <Form.Select name="priority" value={filters.priority} onChange={onFilterChange}>
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="admin-filter-user">
              <Form.Label>User</Form.Label>
              <Form.Select name="user_id" value={filters.user_id} onChange={onFilterChange}>
                <option value="">All</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Form>

        {showForm && (
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isAdmin
            users={users}
          />
        )}

        {editingTask && (
          <TaskForm
            initialValues={{ ...editingTask, user_id: editingTask.user_id?.toString() || editingTask.user_id }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            isAdmin
            users={users}
          />
        )}

        <TaskList
          tasks={filteredTasks}
          showUser
          onEdit={setEditingTask}
          onDelete={handleDelete}
        />
      </Card.Body>
    </Card>
  )
}

export default AdminTaskManagement
