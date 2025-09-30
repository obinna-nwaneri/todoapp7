import React, { useEffect, useState } from "react";

import api from "../utils/api";

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const DashboardPage = () => {
  const [summary, setSummary] = useState({ total_tasks: 0, by_status: {} });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("dashboard");
        setSummary(response.data);
      } catch (error) {
        console.error("Unable to fetch dashboard summary", error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <h2>Total Tasks</h2>
          <p>{summary.total_tasks}</p>
        </div>
        {Object.entries(statusLabels).map(([key, label]) => (
          <div className="card" key={key}>
            <h2>{label}</h2>
            <p>{summary.by_status?.[key] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
