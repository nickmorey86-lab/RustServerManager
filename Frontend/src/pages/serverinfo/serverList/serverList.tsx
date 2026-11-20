/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./serverList.css";
import type { Server } from "../../../types";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

interface ServerListProps {
  servers: Server[];
  onSelectServer: (id: number) => void;
  onDeleteServer: (id: number) => void;
  onStartServer: (id: number) => void;
  onStopServer: (id: number) => void;
  onRestartServer: (id: number) => void;
  onAddServer: () => void;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function ServerList({
  servers,
  onSelectServer,
  onDeleteServer,
  onStartServer,
  onStopServer,
  onRestartServer,
  onAddServer
}: ServerListProps) {
  return (
    <div className="server-list-page">
      <div className="server-list-header">
        <h2>Servers</h2>
        <button className="primary-btn" onClick={onAddServer}>
          Add Server
        </button>
      </div>

      <div className="server-list-table">
        <div className="server-list-table-header">
          <div>Name</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        <div className="server-list-table-body">
          {servers.map(server => (
            <div key={server.id} className="server-row">
              <div
                className="server-name"
                onClick={() => onSelectServer(server.id)}
              >
                {server.name}
              </div>

              <div className={`server-status ${server.status}`}>
                {server.status}
              </div>

              <div className="server-actions">
                {server.status === "online" ? (
                  <button onClick={() => onStopServer(server.id)}>Stop</button>
                ) : (
                  <button onClick={() => onStartServer(server.id)}>Start</button>
                )}

                <button onClick={() => onRestartServer(server.id)}>
                  Restart
                </button>

                <button
                  className="danger-btn"
                  onClick={() => onDeleteServer(server.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



/*import type { Server } from "../../../../types";

interface ServerListProps {
  servers: Server[];
  onSelectServer: (id: number) => void;
  onDeleteServer: (id: number) => void;
  onStartServer: (id: number) => void;
  onStopServer: (id: number) => void;
  onRestartServer: (id: number) => void;
  onAddServer: () => void;
}

export function ServerList({
  servers,
  onSelectServer,
  onDeleteServer,
  onStartServer,
  onStopServer,
  onRestartServer,
  onAddServer,
}: ServerListProps) {
  return (
    <>
      <header className="main-header">
        <h1>Servers</h1>
        <button className="primary-btn" onClick={onAddServer}>
          Add Server
        </button>
      </header>

      <div className="server-list">
        {servers.map((server) => (
          <div
            key={server.id}
            className="server-card"
            onClick={() => onSelectServer(server.id)}
          >
            <div className="server-header">
              <h2>{server.name}</h2>
              <span className={`status ${server.status}`}>
                {server.status === "online" ? "Online" : "Offline"}
              </span>
            </div>

            <p className="server-description">{server.description}</p>

            <div className="server-actions">
              {server.status === "online" && (
                <>
                  <button
                    className="secondary-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestartServer(server.id);
                    }}
                  >
                    Restart
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStopServer(server.id);
                    }}
                  >
                    Stop
                  </button>
                </>
              )}

              {server.status === "offline" && (
                <button
                  className="primary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartServer(server.id);
                  }}
                >
                  Start
                </button>
              )}

              <button
                className="danger-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteServer(server.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}*/