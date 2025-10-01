import type { FC } from 'react'
import type { User } from '../types'

type Props = {
  users: User[]
  isLoading: boolean
  onSelectUser: (id: number | 'all') => void
  selectedUserId: number | 'all'
}

const UserFilter: FC<Props> = ({ users, isLoading, onSelectUser, selectedUserId }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Team Directory</h2>
        <p>Select a stakeholder to drill into their mission-critical items.</p>
      </div>
      <div className="panel-content">
        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <ul className="user-list">
            <li
              className={selectedUserId === 'all' ? 'active' : ''}
              onClick={() => onSelectUser('all')}
            >
              <div>
                <strong>All Contributors</strong>
                <span>View organization-wide progress</span>
              </div>
              <span className="badge">{users.length}</span>
            </li>
            {users.map((user) => (
              <li
                key={user.id}
                className={selectedUserId === user.id ? 'active' : ''}
                onClick={() => onSelectUser(user.id)}
              >
                <div>
                  <strong>{user.fullName}</strong>
                  <span>{user.role === 'admin' ? 'Enterprise Admin' : 'Team Member'}</span>
                </div>
                <span className="badge">{user.todos?.length ?? 0}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default UserFilter
