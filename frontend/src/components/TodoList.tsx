import type { FC } from 'react'
import type { Todo } from '../types'

interface Props {
  todos: Todo[]
  isLoading: boolean
}

const TodoList: FC<Props> = ({ todos, isLoading }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Execution Backlog</h2>
        <p>Prioritized initiatives across enterprise portfolios.</p>
      </div>
      <div className="panel-content">
        {isLoading ? (
          <p>Loading actionable insights...</p>
        ) : todos.length === 0 ? (
          <p>No initiatives found for this filter.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={`todo-card status-${todo.status}`}>
                <header>
                  <span className="todo-status">{todo.status.replace('_', ' ')}</span>
                  <strong>{todo.title}</strong>
                </header>
                <p>{todo.description}</p>
                {todo.user && (
                  <footer>
                    <span>Owner:</span>
                    <strong>{todo.user.fullName}</strong>
                  </footer>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default TodoList
