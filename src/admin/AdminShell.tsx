import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogOut,
  Megaphone,
  Menu,
  MessagesSquare,
  Search,
  Settings,
  ShieldAlert,
  Users2,
  X,
} from "lucide-react";
import { getSupabase } from "../lib/supabase";

const isAdminDomain = window.location.hostname.includes("admin");
const basePath = isAdminDomain ? "" : "/admin";

const NAV_ITEMS = [
  { label: "Dashboard", path: basePath || "/", icon: LayoutDashboard },
  { label: "Colleges", path: `${basePath}/colleges`, icon: Building2 },
  { label: "Users", path: `${basePath}/users`, icon: Users2 },
  { label: "Communities", path: `${basePath}/communities`, icon: MessagesSquare },
  { label: "Posts & Mod", path: `${basePath}/moderation`, icon: ShieldAlert },
  { label: "Events", path: `${basePath}/events`, icon: CalendarDays },
  { label: "Brand Ads", path: `${basePath}/brands`, icon: Megaphone },
  { label: "Subscriptions", path: `${basePath}/subscriptions`, icon: CreditCard },
  { label: "Ambassadors", path: `${basePath}/ambassadors`, icon: GraduationCap },
  { label: "Announcements", path: `${basePath}/announcements`, icon: Bell },
  { label: "Analytics", path: `${basePath}/analytics`, icon: LineChart },
  { label: "Settings", path: `${basePath}/settings`, icon: Settings },
];

/**
 * Desktop-first admin chrome.
 * Uses a grid so sidebar/header/content never overlap.
 */
export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure the mobile drawer closes on any navigation.
    setSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;
    const dashboardPath = basePath || "/";
    if (currentPath === dashboardPath || currentPath === "/admin") return "Overview Dashboard";
    const item = NAV_ITEMS.find((n) => currentPath.startsWith(n.path) && n.path !== dashboardPath && n.path !== "/admin");
    return item ? item.label : "Admin Portal";
  }, [location.pathname]);

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    localStorage.removeItem("campx_admin_role");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f8] overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar (in-grid, sticky) */}
        <aside className="hidden lg:flex w-[240px] bg-[#13131a] border-r border-[#1c1c27] flex-col sticky top-0 h-screen">
          <div className="flex h-16 items-center justify-between px-5 border-b border-[#1c1c27]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-bold tracking-tight text-white truncate">
                CampX<span className="text-[#6c63ff] font-black">.</span> Admin
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map((item) => {
                const dashboardActive = item.path === "/admin" || item.path === "/";
                const active = dashboardActive
                  ? location.pathname === "/admin" || location.pathname === "/"
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20"
                        : "text-gray-400 hover:bg-[#1c1c27] hover:text-white",
                    ].join(" ")}
                  >
                    <item.icon size={18} className={active ? "text-[#6c63ff]" : "text-gray-500"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-[#1c1c27]">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#6c63ff] to-purple-400 flex items-center justify-center font-bold text-white shadow-lg">
                YK
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white leading-tight truncate">Yash Kumar</div>
                <div className="text-xs text-[#6c63ff] font-medium bg-[#6c63ff]/10 px-2 py-0.5 rounded inline-block mt-1">
                  Founder
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile sidebar (drawer) */}
        <aside
          className={[
            "lg:hidden z-50 w-[240px] bg-[#13131a] border-r border-[#1c1c27] flex flex-col",
            "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-16 items-center justify-between px-5 border-b border-[#1c1c27]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-bold tracking-tight text-white truncate">
                CampX<span className="text-[#6c63ff] font-black">.</span> Admin
              </span>
            </div>
            <button className="text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map((item) => {
                const dashboardActive = item.path === "/admin" || item.path === "/";
                const active = dashboardActive
                  ? location.pathname === "/admin" || location.pathname === "/"
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20"
                        : "text-gray-400 hover:bg-[#1c1c27] hover:text-white",
                    ].join(" ")}
                  >
                    <item.icon size={18} className={active ? "text-[#6c63ff]" : "text-gray-500"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-[#1c1c27]">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex flex-col">
          <header className="sticky top-0 z-10 h-16 shrink-0 border-b border-[#1c1c27] bg-[#0a0a0f]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-white tracking-tight truncate">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search across platform..."
                  className="w-72 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-transparent rounded-full py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] transition-all focus:outline-none"
                />
              </div>

              <button className="relative text-gray-400 hover:text-white transition">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6c63ff] text-[9px] font-bold text-white border-2 border-[#0a0a0f]">
                  3
                </span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

