/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./players.css";
import { useState } from "react";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

interface PlayerInfo {
  id: string;
  name: string;
  status: "online" | "offline";
  ping: number;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function Players() {
  const [players] = useState<PlayerInfo[]>([
    { id: "1", name: "PlayerOne", status: "online", ping: 42 },
    { id: "2", name: "PlayerTwo", status: "offline", ping: 0 },
    { id: "3", name: "RustAdmin", status: "online", ping: 18 }
  ]);

  return (
    <div className="players-page">
      <div className="players-header">
        <h2>Players</h2>
      </div>

      <div className="players-table">
        <div className="players-table-header">
          <div>Name</div>
          <div>Status</div>
          <div>Ping</div>
        </div>

        <div className="players-table-body">
          {players.map(player => (
            <div key={player.id} className="players-row">
              <div>{player.name}</div>

              <div
                className={`player-status ${
                  player.status === "online"
                    ? "status-online"
                    : "status-offline"
                }`}
              >
                {player.status}
              </div>

              <div>{player.ping}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
