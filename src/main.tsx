import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./campx-pages.css";
import "./admin/admin-reset.css";

// Apply admin isolation as early as possible so global prototype CSS can't flash/break admin layout.
if (window.location.hostname.includes("admin")) {
  document.documentElement.classList.add("campx-admin");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
