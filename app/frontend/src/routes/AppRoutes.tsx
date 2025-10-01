import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import TasksPage from '../pages/TasksPage';
import UsersPage from '../pages/UsersPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import ProfilePage from '../pages/ProfilePage';
import Layout from '../components/Layout';

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'ADMIN' }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute role="ADMIN">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute role="ADMIN">
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
