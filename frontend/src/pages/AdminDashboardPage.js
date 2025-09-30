import React, { useEffect, useState } from "react";

import api from "../utils/api";

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState({ total_users: 0, total_tasks: 0, tasks_by_status: {} });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, usersResponse] = await Promise.all([
          api.get("admin/summary"),
          api.get("admin/users"),
        ]);
        setSummary(summaryResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Unable to load admin dashboard", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <h2>Total Users</h2>
          <p>{summary.total_users}</p>
        </div>
        <div className="card">
          <h2>Total Tasks</h2>
          <p>{summary.total_tasks}</p>
        </div>
        <div className="card">
          <h2>Tasks by Status</h2>
          <ul>
            {Object.entries(summary.tasks_by_status || {}).map(([status, count]) => (
              <li key={status}>
                {status.replace("_", " ")}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <section style={{ marginTop: "2rem" }}>
        <h2>Users</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Is Staff</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email || "—"}</td>
                <td>{user.is_staff ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
