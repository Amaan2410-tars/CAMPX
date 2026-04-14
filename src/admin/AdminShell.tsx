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
  MessagesSquare,
  Search,
  Settings,
  ShieldAlert,
  Users2,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState<{ id: string; full_name: string | null; email: string | null } | null>(null);
  const [myRole, setMyRole] = useState<string>("Staff");

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

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data: u } = await sb.auth.getUser();
        const user = u.user;
        if (!user) return;

        const { data: prof } = await sb.from("profiles").select("id, full_name, email").eq("id", user.id).maybeSingle();
        if (!cancelled) setMe((prof as any) ?? { id: user.id, full_name: null, email: user.email ?? null });

        const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
        const list = (roles ?? []).map((r: any) => String(r.role));
        const badge = list.includes("founder") ? "Founder" : list.includes("admin") ? "Admin" : list.includes("moderator") ? "Moderator" : "Staff";
        if (!cancelled) setMyRole(badge);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => {
    const name = (me?.full_name || me?.email || "A").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "A";
    const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
    return (a + b).toUpperCase();
  }, [me?.full_name, me?.email]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f8] overflow-hidden font-sans">
      <div className="grid min-h-screen grid-cols-[minmax(260px,22vw)_1fr]">
        {/* Sidebar (Instagram-like) */}
        <aside className="w-full bg-[#0b0b10] border-r border-white/10 flex flex-col sticky top-0 h-screen">
          <div className="px-6 pt-8 pb-6">
            <div className="text-[28px] leading-none font-extrabold tracking-tight text-white">
              Camp<span className="text-[#6c63ff]">X</span>
            </div>
            <div className="mt-1 text-xs text-white/50 tracking-widest uppercase">Admin</div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
            <nav className="space-y-1 px-0">
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
                      "group flex items-center justify-start gap-4 rounded-none px-6 py-3 text-[15px] font-medium transition text-left",
                      active
                        ? "bg-white/5 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <item.icon size={22} className={active ? "text-white" : "text-white/70 group-hover:text-white"} />
                    <span className={active ? "font-semibold" : ""}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-5 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white leading-tight truncate">{me?.full_name || "Admin"}</div>
                <div className="text-xs text-white/60 truncate">{me?.email || ""}</div>
                <div className="mt-1 text-[11px] text-[#6c63ff] font-semibold">{myRole}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
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

