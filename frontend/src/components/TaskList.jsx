import { Table, Button, Badge } from 'react-bootstrap'

const statusVariant = {
  Pending: 'warning',
  'In Progress': 'info',
  Completed: 'success'
}

const priorityVariant = {
  Low: 'secondary',
  Medium: 'primary',
  High: 'danger'
}

const TaskList = ({ tasks = [], onEdit, onDelete, showUser = false }) => {
  if (!tasks.length) {
    return <p className="text-muted">No tasks found.</p>
  }

  return (
    <Table responsive hover className="align-middle">
      <thead>
        <tr>
          <th>Title</th>
          {showUser && <th>Assigned To</th>}
          <th>Due Date</th>
          <th>Priority</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => {
          const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'
          return (
            <tr key={task.id}>
              <td>{task.title}</td>
              {showUser && (
                <td>{task.user?.email || task.user?.data?.email || task.user_email || '—'}</td>
              )}
              <td>{dueDate}</td>
              <td>
                <Badge bg={priorityVariant[task.priority] || 'secondary'}>{task.priority}</Badge>
              </td>
              <td>
                <Badge bg={statusVariant[task.status] || 'secondary'}>{task.status}</Badge>
              </td>
              <td className="text-end">
                {onEdit && (
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => onEdit(task)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(task)}>
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default TaskList
