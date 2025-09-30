import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>To-Do App</h2>
          <p>Hi, {user?.username}</p>
        </div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
          <NavLink to="/tasks/new">Add Task</NavLink>
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <button className="button secondary" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
