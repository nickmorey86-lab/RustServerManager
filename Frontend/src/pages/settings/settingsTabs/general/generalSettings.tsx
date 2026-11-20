import { useState } from "react";
import "./generalSettings.css";
import { BulkSettings } from "./bulkSettings/bulkSettings";

export function GeneralSettings() {
  return (
    <div className="general-page">
      <div className="general-container">
        <BulkSettings />
      </div>
    </div>
  );
}