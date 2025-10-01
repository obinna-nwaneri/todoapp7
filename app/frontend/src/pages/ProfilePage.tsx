import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
      <div className="rounded bg-white p-4 shadow">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="text-lg font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="text-gray-700">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="text-gray-700">{user.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
