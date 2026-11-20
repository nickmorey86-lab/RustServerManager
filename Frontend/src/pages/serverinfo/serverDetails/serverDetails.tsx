/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./serverDetails.css";
import type { Server } from "../../../types";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

interface ServerDetailsProps {
  server: Server;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onBack: () => void;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
  onRestart: (id: number) => void;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function ServerDetails({
  server,
  activeTab,
  onChangeTab,
  onBack,
  onStart,
  onStop,
  onRestart
}: ServerDetailsProps) {
  return (
    <div className="server-details-page">
      <div className="server-details-header">
        <button className="secondary-btn" onClick={onBack}>
          ← Back
        </button>

        <h2>{server.name}</h2>

        <div className="server-details-actions">
          {server.status === "online" ? (
            <button onClick={() => onStop(server.id)}>Stop</button>
          ) : (
            <button onClick={() => onStart(server.id)}>Start</button>
          )}

          <button onClick={() => onRestart(server.id)}>Restart</button>
        </div>
      </div>

      <div className="server-details-tabs">
        <button
          className={activeTab === "info" ? "active" : ""}
          onClick={() => onChangeTab("info")}
        >
          Info
        </button>

        <button
          className={activeTab === "console" ? "active" : ""}
          onClick={() => onChangeTab("console")}
        >
          Console
        </button>

        <button
          className={activeTab === "plugins" ? "active" : ""}
          onClick={() => onChangeTab("plugins")}
        >
          Plugins
        </button>
      </div>

      <div className="server-details-content">
        {activeTab === "info" && (
          <div>
            <p>{server.description}</p>
          </div>
        )}

        {activeTab === "console" && (
          <div>Console output coming soon…</div>
        )}

        {activeTab === "plugins" && (
          <div>Plugin list coming soon…</div>
        )}
      </div>
    </div>
  );
}



/*import type { Server } from "../../../../types";

interface ServerDetailsProps {
  server: Server;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onBack: () => void;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
  onRestart: (id: number) => void;
}

export function ServerDetails({
  server,
  activeTab,
  onChangeTab,
  onBack,
  onStart,
  onStop,
  onRestart,
}: ServerDetailsProps) {
  return (
    <div className="server-details expanded">
      <header className="main-header">
        <div className="header-left">
          <button className="secondary-btn" onClick={onBack}>
            ← Back
          </button>

          <nav className="breadcrumb">
            <span onClick={onBack}>Servers</span>
            <span> / </span>
            <span className="active">{server.name}</span>
          </nav>
        </div>

        <div className="header-actions">
          {server.status === "online" && (
            <>
              <button
                className="secondary-btn"
                onClick={() => onRestart(server.id)}
              >
                Restart
              </button>
              <button
                className="secondary-btn"
                onClick={() => onStop(server.id)}
              >
                Stop
              </button>
            </>
          )}

          {server.status === "offline" && (
            <button
              className="primary-btn"
              onClick={() => onStart(server.id)}
            >
              Start
            </button>
          )}
        </div>
      </header>

      <div className="details-tabs">
        <button
          className={activeTab === "info" ? "tab active" : "tab"}
          onClick={() => onChangeTab("info")}
        >
          Info
        </button>

        <button
          className={activeTab === "players" ? "tab active" : "tab"}
          onClick={() => onChangeTab("players")}
        >
          Players
        </button>

        <button
          className={activeTab === "logs" ? "tab active" : "tab"}
          onClick={() => onChangeTab("logs")}
        >
          Logs
        </button>

        <button
          className={activeTab === "config" ? "tab active" : "tab"}
          onClick={() => onChangeTab("config")}
        >
          Config
        </button>
      </div>

      <div className="details-content">
        {activeTab === "info" && (
          <div className="panel">
            <h2>Server Info</h2>
            <p>{server.description}</p>
          </div>
        )}

        {activeTab === "players" && (
          <div className="panel">
            <h2>Players</h2>
            <p>Player list will go here.</p>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="panel">
            <h2>Logs</h2>
            <p>Recent logs will go here.</p>
          </div>
        )}

        {activeTab === "config" && (
          <div className="panel">
            <h2>Configuration</h2>
            <p>Config summary will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
}*/