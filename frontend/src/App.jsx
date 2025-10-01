import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TodosPage from './pages/TodosPage.jsx';
import AdminRedirect from './pages/AdminRedirect.jsx';
import AppLayout from './components/AppLayout.jsx';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token || !user?.isAdmin) {
    return <Navigate to="/todos" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<AppLayout />}>
      <Route
        path="/todos"
        element={
          <PrivateRoute>
            <TodosPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminRedirect />
          </AdminRoute>
        }
      />
      <Route path="/" element={<Navigate to="/todos" replace />} />
    </Route>
    <Route path="*" element={<Navigate to="/todos" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
