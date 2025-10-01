import { useEffect, useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'

const defaultValues = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Pending',
  user_id: ''
}

const TaskForm = ({ onSubmit, onCancel, initialValues = {}, isAdmin = false, users = [] }) => {
  const normalizeValues = (values) => ({
    ...defaultValues,
    ...values,
    due_date: values.due_date ? values.due_date.slice(0, 10) : ''
  })

  const [formValues, setFormValues] = useState(normalizeValues(initialValues))

  useEffect(() => {
    setFormValues(normalizeValues(initialValues))
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = { ...formValues }
    if (!payload.due_date) {
      delete payload.due_date
    }
    if (!isAdmin) {
      delete payload.user_id
    }
    onSubmit(payload)
  }

  return (
    <Form onSubmit={handleSubmit} className="p-3 bg-light rounded shadow-sm">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="task-title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              value={formValues.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="task-due-date">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              name="due_date"
              value={formValues.due_date || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="task-priority">
            <Form.Label>Priority</Form.Label>
            <Form.Select name="priority" value={formValues.priority} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="task-status">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formValues.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="task-description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Add task details"
            />
          </Form.Group>
        </Col>
        {isAdmin && (
          <Col md={6}>
            <Form.Group controlId="task-user">
              <Form.Label>Assigned User</Form.Label>
              <Form.Select name="user_id" value={formValues.user_id} onChange={handleChange} required>
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}
        <Col xs={12} className="d-flex gap-2 justify-content-end">
          {onCancel && (
            <Button variant="outline-secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary">
            Save Task
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default TaskForm
