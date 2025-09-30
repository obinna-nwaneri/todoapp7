import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter ? task.status === statusFilter : true;
      const priorityMatch = priorityFilter ? task.priority === priorityFilter : true;
      return statusMatch && priorityMatch;
    });
  }, [tasks, statusFilter, priorityFilter]);

  return (
    <div className="card">
      <div className="flex-between">
        <h2>My Tasks</h2>
        <button type="button" onClick={fetchTasks}>
          Refresh
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
              <td className={`priority-${task.priority.toLowerCase()}`}>{task.priority}</td>
              <td>
                <span className={`status-pill status-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
              </td>
              <td>{task.description}</td>
              <td>
                <Link to={`/tasks/${task.id}/edit`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredTasks.length === 0 && <p>No tasks found.</p>}
    </div>
  );
};

export default Tasks;
