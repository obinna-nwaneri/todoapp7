import { Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { ChangePasswordPage } from "./features/auth/ChangePasswordPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { TasksPage } from "./features/tasks/TasksPage";
import { HomePage } from "./pages/HomePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<TasksPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
