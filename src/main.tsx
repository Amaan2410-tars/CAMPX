import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./admin/admin-reset.css";

// Apply admin isolation as early as possible so global prototype CSS can't flash/break admin layout.
const path = window.location.pathname || "/";
const isAdmin =
  window.location.hostname.includes("admin") ||
  path.startsWith("/admin") ||
  path.startsWith("/auth/login");

async function disableServiceWorkerAndCaches(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    // ignore
  }

  if (!("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    // ignore
  }
}

// Only load the prototype/student page CSS for the student-facing app.
if (!isAdmin) {
  void import("./campx-pages.css");
  void import("./pwa-register");
}

if (isAdmin) {
  document.documentElement.classList.add("campx-admin");
  void disableServiceWorkerAndCaches();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
