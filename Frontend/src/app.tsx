import { useState, useEffect } from "react";
import "./styles/app.css";
import { Sidebar } from "./components/sidebar/sidebar";
import { ServerList } from "./pages/serverinfo/serverList/serverList";
import { ServerDetails } from "./pages/serverinfo/serverDetails/serverDetails";
import { Dashboard } from "./pages/dashboard/dashboard";
import { Players } from "./pages/playeradmin/players";
import { Console } from "./pages/console/console";
import { Settings } from "./pages/settings/settings";
import { AddServerModal } from "./pages/serverinfo/serverList/modals/addServerModal";
import { DeleteServerModal } from "./pages/serverinfo/serverList/modals/deleteServerModal";
import { Carbon } from "./pages/carbonmod/carbon";
import { OxideInstaller } from "./pages/oxideinstaller/oxideinstaller";
import { PluginManager } from "./pages/pluginmanager/pluginManager";
import { ServerInstaller } from "./pages/serverinstaller/serverInstaller";
import type { Server } from "./types";



export default function App() {
  const [servers, setServers] = useState<Server[]>([
    {
      id: 1,
      name: "Main Rust Server",
      description: "The primary production Rust server instance.",
      status: "online"
    },
    {
      id: 2,
      name: "Test Server",
      description: "A secondary server used for plugin testing.",
      status: "offline"
    }
  ]);



  const [activePage, setActivePage] = useState("dashboard");
  const [activeServer, setActiveServer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  const [showAddModal, setShowAddModal] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<number | null>(null);

  const [newServerName, setNewServerName] = useState("");
  const [newServerDescription, setNewServerDescription] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev =>
        prev.map(server =>
          server.id === 1
            ? {
              ...server,
              status: server.status === "online" ? "offline" : "online"
            }
            : server
        )
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddServer = () => {
    if (!newServerName.trim()) return;

    setServers(prev => [
      ...prev,
      {
        id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1,
        name: newServerName,
        description: newServerDescription || "No description provided.",
        status: "offline"
      }
    ]);

    setNewServerName("");
    setNewServerDescription("");
    setShowAddModal(false);
  };

  return (
    <div className="app-root">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="main-content">

        <div key={activePage + "-" + activeServer} className="page-wrapper">
          {activePage === "servers" && activeServer === null && (
            <ServerList
              servers={servers}
              onSelectServer={setActiveServer}
              onDeleteServer={(id: number) => setServerToDelete(id)}
              onStartServer={id => window.servers.start(id)}
              onStopServer={id => window.servers.stop(id)}
              onRestartServer={id => window.servers.restart(id)}
              onAddServer={() => setShowAddModal(true)}
            />
          )}

          {activePage === "servers" && activeServer !== null && (
            <ServerDetails
              server={servers.find(s => s.id === activeServer)!}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onBack={() => setActiveServer(null)}
              onStart={id => window.servers.start(id)}
              onStop={id => window.servers.stop(id)}
              onRestart={id => window.servers.restart(id)}
            />
          )}

          {activePage === "dashboard" && <Dashboard />}
          {activePage === "players" && <Players />}
          {activePage === "carbon" && <Carbon />}
          {activePage === "oxideinstaller" && <OxideInstaller />}
          {activePage === "pluginmanager" && <PluginManager />}
          {activePage === "serverinstaller" && <ServerInstaller />}
          {activePage === "console" && <Console />}
          {activePage === "settings" && <Settings />}
        </div>

      </div>

      {showAddModal && (
        <AddServerModal
          name={newServerName}
          description={newServerDescription}
          onNameChange={setNewServerName}
          onDescriptionChange={setNewServerDescription}
          onCancel={() => setShowAddModal(false)}
          onSave={handleAddServer}
        />
      )}

      {serverToDelete !== null && (
        <DeleteServerModal
          onCancel={() => setServerToDelete(null)}
          onConfirm={() => {
            setServers(prev => prev.filter(s => s.id !== serverToDelete));
            setServerToDelete(null);
          }}
        />
      )}
    </div>
  );
}



