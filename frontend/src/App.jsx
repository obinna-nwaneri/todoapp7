import { Navigate, Route, Routes } from "react-router-dom";
import AppNavbar from "./components/AppNavbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

const App = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? (user.is_staff ? "/admin" : "/appointments") : "/"} replace />}
          />
        </Routes>
      </main>
      <footer className="bg-light py-3 text-center text-muted">
        &copy; {new Date().getFullYear()} DocConnect. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
