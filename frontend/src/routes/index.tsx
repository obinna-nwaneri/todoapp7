import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { AdminRoute } from './admin-route';
import { LoginPage } from '../pages/auth/login';
import { RegisterPage } from '../pages/auth/register';
import { DashboardPage } from '../pages/app/dashboard';
import { TodosPage } from '../pages/app/todos';
import { TodoDetailPage } from '../pages/app/todo-detail';
import { ProjectsPage } from '../pages/app/projects';
import { ProjectDetailPage } from '../pages/app/project-detail';
import { UsersAdminPage } from '../pages/admin/users';
import { ActivityAdminPage } from '../pages/admin/activity';
import { NotFoundPage } from '../pages/not-found';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'todos', element: <TodosPage /> },
      { path: 'todos/:id', element: <TodoDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      { index: true, element: <UsersAdminPage /> },
      { path: 'users', element: <UsersAdminPage /> },
      { path: 'activity', element: <ActivityAdminPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
