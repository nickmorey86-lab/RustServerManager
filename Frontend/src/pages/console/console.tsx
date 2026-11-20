/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./console.css";
import { useState } from "react";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

interface LogEntry {
  id: string;
  time: string;
  type: "info" | "warning" | "error";
  message: string;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function Console() {
  const [logs] = useState<LogEntry[]>([
    {
      id: "1",
      time: "12:01",
      type: "info",
      message: "Server started successfully."
    },
    {
      id: "2",
      time: "12:05",
      type: "warning",
      message: "High memory usage detected."
    },
    {
      id: "3",
      time: "12:10",
      type: "error",
      message: "Failed to load plugin: MonumentAI."
    }
  ]);

  return (
    <div className="console-page">
      <div className="console-header">
        <h2>Console</h2>
      </div>

      <div className="console-table">
        <div className="console-table-header">
          <div>Time</div>
          <div>Type</div>
          <div>Message</div>
        </div>

        <div className="console-table-body">
          {logs.map(log => (
            <div key={log.id} className="console-row">
              <div>{log.time}</div>

              <div
                className={`log-type ${log.type === "info"
                    ? "log-info"
                    : log.type === "warning"
                      ? "log-warning"
                      : "log-error"
                  }`}
              >
                {log.type}
              </div>

              <div>{log.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
