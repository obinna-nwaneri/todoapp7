import { useState } from 'react'
import { Card, Form, Button, Table, Badge } from 'react-bootstrap'

const emptyUser = { email: '', password: '', role: 'user' }

const UserManagement = ({ users = [], onCreate, onUpdate, onDelete }) => {
  const [newUser, setNewUser] = useState(emptyUser)
  const [editingUser, setEditingUser] = useState(null)
  const [editValues, setEditValues] = useState(emptyUser)

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target
    setter((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    await onCreate(newUser)
    setNewUser(emptyUser)
  }

  const startEdit = (user) => {
    setEditingUser(user.id)
    setEditValues({ email: user.email, password: '', role: user.role })
  }

  const submitEdit = async (event) => {
    event.preventDefault()
    await onUpdate(editingUser, editValues)
    setEditingUser(null)
    setEditValues(emptyUser)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditValues(emptyUser)
  }

  return (
    <div className="d-grid gap-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Create user</Card.Title>
          <Form className="row g-3" onSubmit={handleCreate}>
            <div className="col-md-4">
              <Form.Group controlId="create-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleChange(setNewUser)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group controlId="create-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange(setNewUser)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group controlId="create-role">
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" value={newUser.role} onChange={handleChange(setNewUser)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <Button type="submit" variant="primary" className="w-100">
                Add
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Manage existing users</Card.Title>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const tasksCount = Array.isArray(user.tasks)
                    ? user.tasks.length
                    : user.tasks?.data?.length ?? user.task_count
                  if (editingUser === user.id) {
                    return (
                      <tr key={user.id}>
                        <td colSpan={4}>
                          <Form className="row g-3" onSubmit={submitEdit}>
                            <div className="col-md-4">
                              <Form.Group controlId={`edit-email-${user.id}`}>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={editValues.email}
                                  onChange={handleChange(setEditValues)}
                                  required
                                />
                              </Form.Group>
                            </div>
                            <div className="col-md-3">
                              <Form.Group controlId={`edit-role-${user.id}`}>
                                <Form.Label>Role</Form.Label>
                                <Form.Select
                                  name="role"
                                  value={editValues.role}
                                  onChange={handleChange(setEditValues)}
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </Form.Select>
                              </Form.Group>
                            </div>
                            <div className="col-md-3">
                              <Form.Group controlId={`edit-password-${user.id}`}>
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                  type="password"
                                  name="password"
                                  value={editValues.password}
                                  onChange={handleChange(setEditValues)}
                                  placeholder="Leave blank to keep"
                                />
                              </Form.Group>
                            </div>
                            <div className="col-md-2 d-flex align-items-end gap-2">
                              <Button type="submit" variant="success">
                                Save
                              </Button>
                              <Button variant="outline-secondary" onClick={cancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          </Form>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'primary' : 'secondary'}>{user.role}</Badge>
                      </td>
                      <td>{tasksCount ?? 0}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDelete(user)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default UserManagement
