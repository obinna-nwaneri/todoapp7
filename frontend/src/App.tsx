import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicRoute from '@/routes/PublicRoute'
import DashboardLayout from '@/components/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import CreateTodoPage from '@/pages/CreateTodoPage'
import EditTodoPage from '@/pages/EditTodoPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="todos/new" element={<CreateTodoPage />} />
            <Route path="todos/:id/edit" element={<EditTodoPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
