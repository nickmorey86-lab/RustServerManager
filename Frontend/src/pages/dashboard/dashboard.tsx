/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./dashboard.css";
import { useState } from "react";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

interface StatCard {
  id: string;
  label: string;
  value: string | number;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function Dashboard() {
  const [stats] = useState<StatCard[]>([
    { id: "1", label: "Active Servers", value: 3 },
    { id: "2", label: "Online Players", value: 42 },
    { id: "3", label: "Total Plugins", value: 18 },
    { id: "4", label: "Warnings Today", value: 2 }
  ]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-grid">
        {stats.map(stat => (
          <div key={stat.id} className="dashboard-card">
            <div className="dashboard-card-label">{stat.label}</div>
            <div className="dashboard-card-value">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/*export function Dashboard() {
  return (
    <>
      <header className="main-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button className="primary-btn">Start All</button>
          <button className="secondary-btn">Stop All</button>
        </div>
      </header>

      <section className="main-grid">
        <div className="panel">
          <h2>Server Status</h2>
          <p>Placeholder for server status overview.</p>
        </div>

        <div className="panel">
          <h2>Active Players</h2>
          <p>Placeholder for player list / counts.</p>
        </div>

        <div className="panel">
          <h2>Recent Logs</h2>
          <p>Placeholder for recent log entries.</p>
        </div>

        <div className="panel">
          <h2>Resource Usage</h2>
          <p>Placeholder for CPU / RAM / network charts.</p>
        </div>
      </section>
    </>
  );
}*/