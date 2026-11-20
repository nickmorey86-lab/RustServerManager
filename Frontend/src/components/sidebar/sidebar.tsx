import "./sidebar.css";
import { useTheme } from "../../pages/settings/settingsTabs/themes/themeContext";

interface SidebarProps {
  collapsed: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
  onToggleCollapse: () => void;
}

function themeVar(name: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value.length > 0 ? value : undefined;
}


export function Sidebar({
  collapsed,
  activePage,
  onNavigate,
  onToggleCollapse
}: SidebarProps) {
  const { activeTheme } = useTheme();

  // Fallback theme object to avoid crashes before load
  const theme = activeTheme ?? {
    name: "",
    logo: null,
    icons: {
      dashboard: null,
      servers: null,
      players: null,
      carbon: null,
      oxide: null,
      pluginmanager: null,
      serverinstaller: null,
      console: null,
      settings: null
    }
  };

  const icons: {
    dashboard: string | null;
    servers: string | null;
    players: string | null;
    carbon: string | null;
    oxide: string | null;
    pluginmanager: string | null;
    serverinstaller: string | null;
    console: string | null;
    settings: string | null;
  } = theme.icons ?? {
    dashboard: null,
    servers: null,
    players: null,
    carbon: null,
    oxide: null,
    pluginmanager: null,
    serverinstaller: null,
    console: null,
    settings: null
  };


  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <div className="sidebar-title">Rust Server Manager</div>

        {theme.logo && (
          <img
            src={themeVar("--theme-logo")}
            alt={theme.name}
            className="sidebar-logo"
          />

        )}
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => onNavigate("dashboard")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Dashboard</span>
            {icons.dashboard && (
              <img
                src={themeVar("--theme-icons-dashboard")}
                className="sidebar-icon"
                alt=""
              />

            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "servers" ? "active" : ""}
          onClick={() => onNavigate("servers")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Server Info</span>
            {icons.servers && (
              <img
                src={themeVar("--theme-icons-servers")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "players" ? "active" : ""}
          onClick={() => onNavigate("players")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Player Admin</span>
            {icons.players && (
              <img
                src={themeVar("--theme-icons-players")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "carbon" ? "active" : ""}
          onClick={() => onNavigate("carbon")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Carbon Installer</span>
            {icons.carbon && (
              <img
                src={themeVar("--theme-icons-carbon")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>


        <button
          type="button"
          className={activePage === "oxide" ? "active" : ""}
          onClick={() => onNavigate("oxide")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Oxide/Umod Installer</span>
            {icons.oxide && (
              <img
                src={themeVar("--theme-icons-oxide")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "serverinstaller" ? "active" : ""}
          onClick={() => onNavigate("serverinstaller")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Server Installer</span>
            {icons.serverinstaller && (
              <img
                src={themeVar("--theme-icons-serverinstaller")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "pluginmanager" ? "active" : ""}
          onClick={() => onNavigate("pluginmanager")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Plugin Manager</span>
            {icons.pluginmanager && (
              <img
                src={themeVar("--theme-icons-pluginmanager")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "console" ? "active" : ""}
          onClick={() => onNavigate("console")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Console</span>
            {icons.console && (
              <img
                src={themeVar("--theme-icons-console")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>

        <button
          type="button"
          className={activePage === "settings" ? "active" : ""}
          onClick={() => onNavigate("settings")}
        >
          <div className="sidebar-item-inner">
            <span className="label">Settings</span>
            {icons.settings && (
              <img
                src={themeVar("--theme-icons-settings")}
                className="sidebar-icon"
                alt=""
              />
            )}
          </div>
        </button>
      </nav>

      <button type="button" className="collapse-btn" onClick={onToggleCollapse}>
        <span>→</span>
      </button>
    </aside>
  );
}
