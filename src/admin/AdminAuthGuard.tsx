import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { fetchUserRoles, isStaff } from "@/lib/rbac";

export default function AdminAuthGuard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Timeout for auto-logout after 2 hours of inactivity
    const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000;
    let timeout: number;

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    const handleLogout = async () => {
      if (isSupabaseConfigured()) {
        const sb = getSupabase();
        await sb?.auth.signOut();
      }
      setIsAuthorized(false);
      window.location.href = "/auth/login";
    };

    // Activity listeners
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("keydown", resetTimeout);
    window.addEventListener("scroll", resetTimeout);
    resetTimeout();

    const checkAuth = async () => {
      if (!isSupabaseConfigured()) {
        // Fallback or demo bypass
        const demoRole = localStorage.getItem("campx_admin_role");
        if (demoRole === "admin" || demoRole === "founder") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
        setLoading(false);
        return;
      }

      const sb = getSupabase();
      if (!sb) return;

      const { data: { session } } = await sb.auth.getSession();
      if (!session) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // Check role
      const { roles } = await fetchUserRoles(sb);
      setIsAuthorized(isStaff(roles));

      setLoading(false);
    };

    checkAuth();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
      window.removeEventListener("scroll", resetTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-[#f0f0f8]">
        Loading Admin...
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
