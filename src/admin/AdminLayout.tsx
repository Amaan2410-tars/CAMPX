import React, { useEffect } from "react";
import AdminShell from "./AdminShell";

export default function AdminLayout() {
  useEffect(() => {
    // `main.tsx` adds this early; keep as safety for client-side navigations.
    document.documentElement.classList.add("campx-admin");
    return () => {
      document.documentElement.classList.remove("campx-admin");
    };
  }, []);

  return <AdminShell />;
}
