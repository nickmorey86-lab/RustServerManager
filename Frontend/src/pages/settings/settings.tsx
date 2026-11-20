/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./settings.css";
import { SettingsTabs } from "./settingsTabs/settingsTabs";

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function Settings() {
  return (
    <div className="settings-page">
      <div className="settings-container">
        <SettingsTabs />
      </div>
    </div>
  );
}
