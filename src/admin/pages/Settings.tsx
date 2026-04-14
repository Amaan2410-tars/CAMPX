import React, { useEffect, useMemo, useState } from "react";
import { Shield, Users, Server, Mail, Activity, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Team");
  const [toggles, setToggles] = useState({
    maintenance: false,
    newSignups: true,
    autoMod: true
  });
  const [auditQuery, setAuditQuery] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditErr, setAuditErr] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; actor_id: string | null; action: string; entity: string; created_at: string }>>([]);

  useEffect(() => {
    if (activeTab !== "Audit") return;
    const sb = getSupabase();
    if (!sb) {
      setAuditErr("Supabase is not configured.");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setAuditLoading(true);
        setAuditErr(null);
        const { data, error } = await sb
          .from("audit_log")
          .select("id, actor_id, action, entity, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        if (!cancelled) setAuditLogs(data ?? []);
      } catch (e: any) {
        if (!cancelled) setAuditErr(e?.message ?? "Failed to load audit log.");
      } finally {
        if (!cancelled) setAuditLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const filteredAudit = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter((l) => `${l.entity} ${l.action}`.toLowerCase().includes(q));
  }, [auditLogs, auditQuery]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage admin access, global toggles, and system audit logs.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Settings Navigation */}
        <div className="w-64 shrink-0 bg-[#1c1c27] border border-[#2a2a35] rounded-xl hidden md:flex flex-col p-2">
          {[
            { id: "Team", label: "Admin Team", icon: Users },
            { id: "Platform", label: "Platform Toggles", icon: Server },
            { id: "Audit", label: "Audit Logs", icon: Activity },
            { id: "Limits", label: "Rate Limits", icon: Shield },
            { id: "Email", label: "Email Templates", icon: Mail }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id 
                  ? "bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#13131a] border border-transparent"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-6 shadow-xl">
          
          {activeTab === "Team" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#2a2a35]">
                <h2 className="text-lg font-bold text-white">Admin Team Management</h2>
                <button className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition">Invite Admin</button>
              </div>

              <div className="bg-[#13131a] rounded-xl border border-[#2a2a35] divide-y divide-[#2a2a35]">
                <div className="p-6 text-sm text-gray-400">
                  Admin roster is backed by `user_roles` and is not wired into this UI yet.
                </div>
              </div>
            </div>
          )}

          {activeTab === "Platform" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white pb-4 border-b border-[#2a2a35]">Global Platform Controls</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Maintenance Mode</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Disables student access and displays a "We'll be right back" banner.</p>
                  </div>
                  <button onClick={() => setToggles({...toggles, maintenance: !toggles.maintenance})}>
                    {toggles.maintenance ? <ToggleRight size={32} className="text-red-500"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Allow New Signups</h3>
                    <p className="text-xs text-gray-400 mt-0.5">When disabled, new users cannot create accounts on the platform.</p>
                  </div>
                  <button onClick={() => setToggles({...toggles, newSignups: !toggles.newSignups})}>
                    {toggles.newSignups ? <ToggleRight size={32} className="text-emerald-500"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Automated Moderation</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Use AI tools to instantly block severe policy violations entirely.</p>
                  </div>
                  <button onClick={() => setToggles({...toggles, autoMod: !toggles.autoMod})}>
                    {toggles.autoMod ? <ToggleRight size={32} className="text-[#6c63ff]"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Audit" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#2a2a35]">
                <h2 className="text-lg font-bold text-white">System Audit Log</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    className="bg-[#13131a] border border-[#2a2a35] rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-[#6c63ff] text-white"
                  />
                </div>
              </div>

              {auditErr && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
                  {auditErr}
                </div>
              )}

              <div className="bg-[#13131a] rounded-xl border border-[#2a2a35] overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#1c1c27] text-xs text-gray-500 uppercase border-b border-[#2a2a35]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Action Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a35]">
                    {auditLoading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                          Loading…
                        </td>
                      </tr>
                    ) : filteredAudit.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                          No audit events found.
                        </td>
                      </tr>
                    ) : (
                      filteredAudit.map((log) => (
                        <tr key={log.id} className="hover:bg-[#1c1c27]">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-white">{log.actor_id ?? "System"}</td>
                          <td className="px-4 py-3">{log.entity} • {log.action}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {["Limits", "Email"].includes(activeTab) && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Shield size={48} className="mb-4 opacity-20" />
              <p>Configuration panel for {activeTab} is locked to backend integration.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
