import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import NavigationBar from "./components/NavigationBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div>
      <NavigationBar />
      <main className="container pb-5">{children}</main>
      {!user && (
        <footer className="bg-light py-3 mt-5 border-top">
          <div className="container text-center small text-muted">
            Manage your health effortlessly with MedicoPlus.
          </div>
        </footer>
      )}
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={<Navigate to="/login" replace />}
    />
    <Route
      path="/login"
      element={
        <Layout>
          <Login />
        </Layout>
      }
    />
    <Route
      path="/register"
      element={
        <Layout>
          <Register />
        </Layout>
      }
    />
    <Route
      path="/patient"
      element={
        <ProtectedRoute>
          <Layout>
            <PatientDashboard />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowAdmin>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
