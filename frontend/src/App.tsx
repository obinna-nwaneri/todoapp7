import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTodos, getUsers } from './lib/api'
import TodoList from './components/TodoList'
import UserFilter from './components/UserFilter'

function App() {
  const [selectedUserId, setSelectedUserId] = useState<number | 'all'>('all')

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const { data: todos = [], isLoading: isLoadingTodos } = useQuery({
    queryKey: ['todos', selectedUserId],
    queryFn: () => getTodos(selectedUserId === 'all' ? undefined : selectedUserId),
  })

  const headerCopy = useMemo(() => {
    const admin = users.find((user) => user.role === 'admin')
    return admin
      ? `Welcome back, ${admin.fullName}. Here's an overview of enterprise productivity.`
      : 'Enterprise Todo Dashboard'
  }, [users])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{headerCopy}</h1>
        <p>Manage mission-critical tasks with real-time visibility across teams.</p>
      </header>
      <main className="app-main">
        <section className="app-panel">
          <UserFilter
            users={users}
            isLoading={isLoadingUsers}
            onSelectUser={setSelectedUserId}
            selectedUserId={selectedUserId}
          />
        </section>
        <section className="app-panel">
          <TodoList todos={todos} isLoading={isLoadingTodos} />
        </section>
      </main>
    </div>
  )
}

export default App
