import React, { useEffect, useMemo, useState } from "react";
import { Shield, Users, Server, Mail, Activity, ToggleLeft, ToggleRight, Search, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Role = "founder" | "admin" | "moderator";
type TeamRow = {
  user_id: string;
  role: Role;
  full_name: string | null;
  email: string | null;
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Team");
  const [toggles, setToggles] = useState({
    maintenance: false,
    newSignups: true,
    autoMod: true
  });
  const [togglesLoading, setTogglesLoading] = useState(false);
  const [togglesErr, setTogglesErr] = useState<string | null>(null);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditErr, setAuditErr] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; actor_id: string | null; action: string; entity: string; created_at: string }>>([]);

  const [me, setMe] = useState<{ id: string; full_name: string | null; email: string | null } | null>(null);
  const [myNameDraft, setMyNameDraft] = useState("");
  const [mySaving, setMySaving] = useState(false);
  const [myErr, setMyErr] = useState<string | null>(null);
  const [myOk, setMyOk] = useState<string | null>(null);

  const [teamLoading, setTeamLoading] = useState(false);
  const [teamErr, setTeamErr] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("admin");
  const [inviteSaving, setInviteSaving] = useState(false);

  const loadMe = async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    const user = data.user;
    if (!user) return;
    const { data: prof } = await sb.from("profiles").select("id, full_name, email").eq("id", user.id).maybeSingle();
    setMe((prof as any) ?? { id: user.id, full_name: null, email: user.email ?? null });
    setMyNameDraft((prof as any)?.full_name ?? "");
  };

  const loadTeam = async () => {
    const sb = getSupabase();
    if (!sb) {
      setTeamErr("Supabase is not configured.");
      return;
    }
    try {
      setTeamLoading(true);
      setTeamErr(null);
      const { data: roles, error } = await sb
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["founder", "admin", "moderator"]);
      if (error) throw error;

      const userIds = Array.from(new Set((roles ?? []).map((r: any) => String(r.user_id))));
      const { data: profs } = userIds.length
        ? await sb.from("profiles").select("id, full_name, email").in("id", userIds)
        : { data: [] as any[] };

      const profMap = new Map<string, any>((profs ?? []).map((p: any) => [String(p.id), p]));
      const rows: TeamRow[] = (roles ?? []).map((r: any) => {
        const p = profMap.get(String(r.user_id));
        return {
          user_id: String(r.user_id),
          role: String(r.role) as Role,
          full_name: (p?.full_name as string | null) ?? null,
          email: (p?.email as string | null) ?? null,
        };
      });

      const order = { founder: 0, admin: 1, moderator: 2 } as const;
      rows.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9) || (a.full_name ?? "").localeCompare(b.full_name ?? ""));
      setTeam(rows);
    } catch (e: any) {
      setTeamErr(e?.message ?? "Failed to load admin team.");
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    void loadMe();
  }, []);

  useEffect(() => {
    if (activeTab !== "Team") return;
    void loadTeam();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Platform") return;
    const sb = getSupabase();
    if (!sb) {
      setTogglesErr("Supabase is not configured.");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setTogglesLoading(true);
        setTogglesErr(null);
        const { data, error } = await sb
          .from("platform_settings")
          .select("maintenance_mode, allow_signups, auto_moderation")
          .eq("id", 1)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        setToggles({
          maintenance: Boolean((data as any)?.maintenance_mode),
          newSignups: Boolean((data as any)?.allow_signups),
          autoMod: Boolean((data as any)?.auto_moderation),
        });
      } catch (e: any) {
        if (!cancelled) setTogglesErr(e?.message ?? "Failed to load platform settings.");
      } finally {
        if (!cancelled) setTogglesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  async function setPlatformToggle(key: "maintenance_mode" | "allow_signups" | "auto_moderation", value: boolean): Promise<void> {
    const sb = getSupabase();
    if (!sb) {
      setTogglesErr("Supabase is not configured.");
      return;
    }
    try {
      setTogglesErr(null);
      setTogglesLoading(true);
      const { error } = await sb.rpc("admin_set_platform_setting", { _key: key, _value: value });
      if (error) throw error;
    } catch (e: any) {
      setTogglesErr(e?.message ?? "Failed to update platform setting.");
    } finally {
      setTogglesLoading(false);
    }
  }

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
                <button
                  onClick={() => setInviteOpen(true)}
                  className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition"
                >
                  Invite Admin
                </button>
              </div>

              {/* My admin details */}
              <div className="bg-[#13131a] rounded-xl border border-[#2a2a35] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Your admin details</div>
                    <div className="text-xs text-gray-500 mt-0.5">Update how your name appears across the admin panel.</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Display name</label>
                    <input
                      value={myNameDraft}
                      onChange={(e) => setMyNameDraft(e.target.value)}
                      className="w-full bg-[#0b0b10] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                      placeholder="e.g. Yash Kumar"
                    />
                    <div className="text-[11px] text-gray-500 mt-1">{me?.email ?? ""}</div>
                  </div>
                  <div className="flex items-end">
                    <button
                      disabled={mySaving}
                      onClick={async () => {
                        try {
                          setMyErr(null);
                          setMyOk(null);
                          const sb = getSupabase();
                          if (!sb || !me) throw new Error("Not signed in.");
                          setMySaving(true);
                          const { error } = await sb.from("profiles").update({ full_name: myNameDraft.trim() }).eq("id", me.id);
                          if (error) throw error;
                          setMyOk("Saved.");
                          await loadMe();
                        } catch (e: any) {
                          setMyErr(e?.message ?? "Failed to save.");
                        } finally {
                          setMySaving(false);
                        }
                      }}
                      className="w-full px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {mySaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                {myErr && <div className="mt-3 text-sm text-red-300">{myErr}</div>}
                {myOk && <div className="mt-3 text-sm text-emerald-300">{myOk}</div>}
              </div>

              {/* Team roster */}
              <div className="bg-[#13131a] rounded-xl border border-[#2a2a35] overflow-hidden">
                {teamErr && <div className="p-4 text-sm text-red-300 border-b border-[#2a2a35]">{teamErr}</div>}
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#1c1c27] text-xs text-gray-500 uppercase border-b border-[#2a2a35]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a35]">
                    {teamLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                          Loading…
                        </td>
                      </tr>
                    ) : team.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                          No staff roles found.
                        </td>
                      </tr>
                    ) : (
                      team.map((row) => (
                        <tr key={`${row.user_id}:${row.role}`} className="hover:bg-[#1c1c27]">
                          <td className="px-4 py-3 font-medium text-white">{row.full_name || row.user_id}</td>
                          <td className="px-4 py-3 text-gray-400">{row.email || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-white/80">
                              {row.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  const sb = getSupabase();
                                  if (!sb) throw new Error("Supabase is not configured.");
                                  if (!row.email) throw new Error("This user has no email on profile.");
                                  const { error } = await sb.rpc("revoke_user_role_by_email", { _email: row.email, _role: row.role });
                                  if (error) throw error;
                                  await loadTeam();
                                } catch (e: any) {
                                  setTeamErr(e?.message ?? "Failed to revoke role.");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/15 text-red-200 border border-red-500/20 transition"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invite modal */}
              {inviteOpen && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-[#13131a] border border-[#2a2a35] rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-[#2a2a35]">
                      <div className="text-white font-bold">Invite admin</div>
                      <button onClick={() => setInviteOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Email</label>
                        <input
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full bg-[#0b0b10] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                          placeholder="name@domain.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Role</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as Role)}
                          className="w-full bg-[#0b0b10] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                        >
                          <option value="admin">admin</option>
                          <option value="moderator">moderator</option>
                          <option value="founder">founder</option>
                        </select>
                      </div>

                      {teamErr && <div className="text-sm text-red-300">{teamErr}</div>}

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setInviteOpen(false)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 border border-[#2a2a35] hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={inviteSaving}
                          onClick={async () => {
                            try {
                              setTeamErr(null);
                              const sb = getSupabase();
                              if (!sb) throw new Error("Supabase is not configured.");
                              const email = inviteEmail.trim();
                              if (!email) throw new Error("Email is required.");
                              setInviteSaving(true);
                              const { error } = await sb.rpc("grant_user_role_by_email", { _email: email, _role: inviteRole });
                              if (error) throw error;
                              setInviteOpen(false);
                              setInviteEmail("");
                              setInviteRole("admin");
                              await loadTeam();
                            } catch (e: any) {
                              setTeamErr(e?.message ?? "Failed to invite admin.");
                            } finally {
                              setInviteSaving(false);
                            }
                          }}
                          className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          {inviteSaving ? "Inviting..." : "Invite"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Platform" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white pb-4 border-b border-[#2a2a35]">Global Platform Controls</h2>

              {togglesErr && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
                  {togglesErr}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Maintenance Mode</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Disables student access and displays a "We'll be right back" banner.</p>
                  </div>
                  <button
                    disabled={togglesLoading}
                    onClick={() => {
                      const next = !toggles.maintenance;
                      setToggles({ ...toggles, maintenance: next });
                      void setPlatformToggle("maintenance_mode", next);
                    }}
                  >
                    {toggles.maintenance ? <ToggleRight size={32} className="text-red-500"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Allow New Signups</h3>
                    <p className="text-xs text-gray-400 mt-0.5">When disabled, new users cannot create accounts on the platform.</p>
                  </div>
                  <button
                    disabled={togglesLoading}
                    onClick={() => {
                      const next = !toggles.newSignups;
                      setToggles({ ...toggles, newSignups: next });
                      void setPlatformToggle("allow_signups", next);
                    }}
                  >
                    {toggles.newSignups ? <ToggleRight size={32} className="text-emerald-500"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Automated Moderation</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Use AI tools to instantly block severe policy violations entirely.</p>
                  </div>
                  <button
                    disabled={togglesLoading}
                    onClick={() => {
                      const next = !toggles.autoMod;
                      setToggles({ ...toggles, autoMod: next });
                      void setPlatformToggle("auto_moderation", next);
                    }}
                  >
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
