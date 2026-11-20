import App from "./app";
import ReactDOM from "react-dom/client";
import React from "react";
import "./styles/index.css";
import "./styles/app.css";


import { ThemeProvider } from "./pages/settings/settingsTabs/themes/themeContext";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
