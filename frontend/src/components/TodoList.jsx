import React, { useState } from 'react';
import TodoRow from './TodoRow.jsx';

const TodoList = ({ todos, onToggleComplete, onUpdate, onDelete, users }) => {
  const [expandedId, setExpandedId] = useState(null);

  const handleToggleDetails = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="card">
      <h2>Todos</h2>
      {todos.length === 0 ? (
        <p>No todos match the current filters.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              expanded={expandedId === todo.id}
              onToggleComplete={() => onToggleComplete(todo)}
              onToggleDetails={() => handleToggleDetails(todo.id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
              users={users}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
