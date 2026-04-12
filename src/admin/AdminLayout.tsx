import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Building2, Users2, Video, MessagesSquare, 
  ShieldAlert, CalendarDays, Megaphone, CreditCard, GraduationCap, 
  Bell, LineChart, Settings, LogOut, Menu, X, Search 
} from "lucide-react";
import { getSupabase } from "../lib/supabase";

const isAdminDomain = window.location.hostname.includes('admin');
const basePath = isAdminDomain ? "" : "/admin";

const NAV_ITEMS = [
  { label: "Dashboard", path: basePath || "/", icon: LayoutDashboard },
  { label: "Colleges", path: `${basePath}/colleges`, icon: Building2 },
  { label: "Users", path: `${basePath}/users`, icon: Users2 },
  { label: "KYC Queue", path: `${basePath}/kyc`, icon: Video },
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



export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    localStorage.removeItem("campx_admin_role");
    navigate("/auth/login");
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const dashboardPath = basePath || "/";
    if (currentPath === dashboardPath || currentPath === "/admin") return "Overview Dashboard";
    const item = NAV_ITEMS.find(n => currentPath.startsWith(n.path) && n.path !== dashboardPath && n.path !== "/admin");
    return item ? item.label : "Admin Portal";
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0f8] overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-60 transform flex-col bg-[#13131a] border-r border-[#1c1c27] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#1c1c27]">
          <div className="flex items-center gap-2">
            <img src="/campx-logo.png" alt="CampX Logo" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold tracking-tight text-white">CampX<span className="text-[#6c63ff] font-black">.</span> Admin</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const active = item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active 
                      ? "bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20" 
                      : "text-gray-400 hover:bg-[#1c1c27] hover:text-white"
                  }`}
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
            <div>
              <div className="text-sm font-semibold text-white leading-tight">Yash Kumar</div>
              <div className="text-xs text-[#6c63ff] font-medium bg-[#6c63ff]/10 px-2 py-0.5 rounded inline-block mt-1">Founder</div>
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

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1c1c27] bg-[#0a0a0f]/80 backdrop-blur-md px-4 sm:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-white tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search across platform..." 
                className="w-64 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-transparent rounded-full py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] transition-all focus:outline-none"
              />
              <div className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-500 bg-[#13131a] border border-[#333]">⌘K</div>
            </div>
            
            <button className="relative text-gray-400 hover:text-white transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6c63ff] text-[9px] font-bold text-white border-2 border-[#0a0a0f]">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
