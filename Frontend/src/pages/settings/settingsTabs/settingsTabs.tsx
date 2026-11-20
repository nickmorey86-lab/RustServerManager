/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import { useState } from "react";
import "./settingsTabs.css";
import { GeneralSettings } from "./general/generalSettings";
import { Themes } from "./themes/themes";
import { ServerMessages } from "./serverMessages/serverMessages";
import { AdminWhitelist } from "./adminWhitelist/adminWhitelist";

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("general");
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedTab, setDisplayedTab] = useState("general");

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    setIsAnimating(true);

    setTimeout(() => {
      setDisplayedTab(tab);
      setIsAnimating(false);
    }, 200); // match CSS animation duration

    setActiveTab(tab);
  };

  return (
    <div className="settings-tabs">
      <div className="settings-tabs-sidebar">
        <button
          className={activeTab === "general" ? "tab-active" : ""}
          onClick={() => handleTabChange("general")}
        >
          General
        </button>

        <button
          className={activeTab === "serverMessages" ? "tab-active" : ""}
          onClick={() => handleTabChange("serverMessages")}
        >
          Server Messages
        </button>

        <button
          className={activeTab === "adminwhitelist" ? "tab-active" : ""}
          onClick={() => handleTabChange("adminwhitelist")}
        >
          Admin and Whitelist
        </button>

        <button
          className={activeTab === "themes" ? "tab-active" : ""}
          onClick={() => handleTabChange("themes")}
        >
          Themes
        </button>
      </div>

      <div className="settings-tabs-content">
        <div className={`tab-wrapper ${isAnimating ? "tab-exit" : "tab-enter"}`}>
          {displayedTab === "general" && <GeneralSettings />}
          {displayedTab === "serverMessages" && <ServerMessages />}
          {displayedTab === "adminwhitelist" && <AdminWhitelist />}
          {displayedTab === "themes" && <Themes />}
        </div>
      </div>
    </div>
  );
}
