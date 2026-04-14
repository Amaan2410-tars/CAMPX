import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, MoreVertical, ShieldAlert, AlertTriangle, Ban, X, Plus, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

interface UserRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  college: string | null;
  major: string | null;
  year_of_study: string | null;
  tier: "basic" | "verified" | "pro" | "plus";
  verification_status: "unverified" | "email_verified" | "verified";
  created_at: string;
  updated_at: string;
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [rows, setRows] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<"user" | "ambassador" | "moderator" | "admin">("user");
  const [createSaving, setCreateSaving] = useState(false);

  const getTierBadge = (tier: UserRecord["tier"]) => {
    switch (tier) {
      case "pro": return <span className="text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded text-xs font-bold border border-[#a855f7]/20 uppercase">Pro</span>;
      case "plus": return <span className="text-[#ec4899] bg-[#ec4899]/10 px-2 py-0.5 rounded text-xs font-bold border border-[#ec4899]/20 uppercase">Plus</span>;
      case "verified": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20 uppercase">Verified</span>;
      default: return <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded text-xs font-bold border border-gray-400/20 uppercase">Basic</span>;
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.full_name,
        r.email,
        r.phone,
        r.college,
        r.major,
        r.tier,
        r.verification_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, searchQuery]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured for admin.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      const { data, error } = await sb
        .from("profiles")
        .select("id, full_name, email, phone, college, major, year_of_study, tier, verification_status, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data ?? []) as UserRecord[]);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Users</h1>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone, college..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <button className="flex items-center justify-center p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent"
          >
            <Plus size={16} /> Create / Invite
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">College Info</th>
                <th className="px-6 py-4 font-semibold">Tier</th>
                <th className="px-6 py-4 font-semibold">Verification</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading users…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#13131a] transition cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{user.full_name || "—"}</div>
                    <div className="text-xs mt-1 text-gray-500">{user.email || "—"}</div>
                    <div className="text-xs text-gray-500">{user.phone || "—"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{user.college || "—"}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.major || "—"}{user.year_of_study ? ` • ${user.year_of_study}` : ""}</div>
                  </td>
                  <td className="px-6 py-4">{getTierBadge(user.tier)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-300">{user.verification_status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Updated: {new Date(user.updated_at).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a35] rounded transition" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#1c1c27] w-full max-w-md h-full border-l border-[#2a2a35] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-[#2a2a35]">
              <h2 className="text-lg font-bold text-white">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6c63ff] to-purple-400 flex items-center justify-center text-xl font-bold text-white shadow-xl">
                  {(selectedUser.full_name || "?").charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.full_name || "—"}</h3>
                  <div className="text-sm text-gray-400">{selectedUser.email || "—"}</div>
                  <div className="mt-2">{getTierBadge(selectedUser.tier)}</div>
                </div>
              </div>

              <div className="bg-[#13131a] rounded-xl p-4 border border-[#2a2a35]">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Educational Identity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">College</div>
                    <div className="text-white font-medium">{selectedUser.college || "—"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Verification</div>
                    <div className="font-medium text-gray-200">{selectedUser.verification_status}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Course</div>
                    <div className="text-white font-medium">{selectedUser.major || "—"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Year</div>
                    <div className="text-white font-medium">{selectedUser.year_of_study || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#13131a] rounded-xl p-4 border border-[#2a2a35]">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Platform Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Total Posts</div>
                    <div className="text-white font-medium">142</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Communities joined</div>
                    <div className="text-white font-medium">8</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Reports against</div>
                    <div className="text-emerald-400 font-medium">0 Clean</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#2a2a35]">
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Moderation Actions</h4>
                <button className="w-full flex items-center justify-between p-3 bg-[#13131a] border border-[#2a2a35] hover:border-yellow-500/50 rounded-lg transition text-white text-sm font-medium">
                  <span className="flex items-center gap-2 text-yellow-500"><AlertTriangle size={18}/> Issue Warning</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-[#13131a] border border-[#2a2a35] hover:border-red-500/50 rounded-lg transition text-white text-sm font-medium">
                  <span className="flex items-center gap-2 text-red-500"><ShieldAlert size={18}/> Suspend Account (7 Days)</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-lg transition text-red-500 text-sm font-bold">
                  <span className="flex items-center gap-2"><Ban size={18}/> Permanent Ban (Founder Only)</span>
                </button>
                <button
                  className="w-full flex items-center justify-between p-3 bg-[#13131a] border border-[#2a2a35] hover:border-red-500/40 rounded-lg transition text-white text-sm font-medium"
                  onClick={async () => {
                    const ok = window.confirm(`Delete user profile for ${selectedUser.email || selectedUser.id}?\n\nThis removes the profile row (does NOT delete auth user).`);
                    if (!ok) return;
                    const sb = getSupabase();
                    if (!sb) return;
                    const { error } = await sb.from("profiles").delete().eq("id", selectedUser.id);
                    if (error) {
                      setError(error.message);
                      return;
                    }
                    setRows((prev) => prev.filter((r) => r.id !== selectedUser.id));
                    setSelectedUser(null);
                  }}
                >
                  <span className="flex items-center gap-2 text-red-400"><Trash2 size={18}/> Delete Profile Row</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Create / Invite User (role grant) */}
      {createOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1c1c27] border border-[#2a2a35] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#2a2a35]">
              <div className="text-white font-bold">Create / Invite user</div>
              <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm text-gray-400">
                This grants a role to an existing Supabase user by email. If the user doesn’t exist yet, they must sign up first.
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                  placeholder="name@domain.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Role</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as any)}
                  className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                >
                  <option value="user">user</option>
                  <option value="ambassador">ambassador</option>
                  <option value="moderator">moderator</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 border border-[#2a2a35] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  disabled={createSaving}
                  onClick={async () => {
                    try {
                      setError(null);
                      const sb = getSupabase();
                      if (!sb) throw new Error("Supabase is not configured.");
                      const email = createEmail.trim();
                      if (!email) throw new Error("Email is required.");
                      setCreateSaving(true);
                      const { error } = await sb.rpc("grant_user_role_by_email", { _email: email, _role: createRole });
                      if (error) throw error;
                      setCreateOpen(false);
                      setCreateEmail("");
                      setCreateRole("user");
                    } catch (e: any) {
                      setError(e?.message ?? "Failed.");
                    } finally {
                      setCreateSaving(false);
                    }
                  }}
                  className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {createSaving ? "Saving..." : "Grant role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
