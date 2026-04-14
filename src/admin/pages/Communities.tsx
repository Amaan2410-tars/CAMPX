import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, Shield, Check, X, Users } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { triggerGlobalToast } from "@/components/AppLayout";

type CommunityRow = { id: string; name: string; slug: string; created_at: string };
type CommunityReqRow = { id: string; name: string; slug: string | null; description: string | null; created_by: string; created_at: string; status: string };

export default function Communities() {
  const [activeTab, setActiveTab] = useState<"All" | "Pending">("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [pending, setPending] = useState<CommunityReqRow[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      setErr("Supabase is not configured.");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [comms, reqs] = await Promise.all([
          sb.from("communities").select("id, name, slug, created_at").order("created_at", { ascending: false }).limit(200),
          sb
            .from("community_creation_requests")
            .select("id, name, slug, description, created_by, created_at, status")
            .order("created_at", { ascending: false })
            .limit(200),
        ]);
        if (comms.error) throw comms.error;
        if (reqs.error) throw reqs.error;
        if (!cancelled) {
          setCommunities((comms.data ?? []) as any);
          setPending(((reqs.data ?? []) as any).filter((r: any) => r.status === "pending"));
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load communities.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    const sb = getSupabase();
    if (!sb) {
      triggerGlobalToast("Supabase is not configured.", "error");
      return;
    }
    try {
      const { data: userData } = await sb.auth.getUser();
      const reviewer = userData.user?.id ?? null;
      await sb
        .from("community_creation_requests")
        .update({ status: decision, reviewed_by: reviewer, reviewed_at: new Date().toISOString() })
        .eq("id", id)
        .throwOnError();

      setPending((p) => p.filter((r) => r.id !== id));
      triggerGlobalToast(`Request ${decision}.`, "success");
    } catch (e: any) {
      triggerGlobalToast(e?.message ?? "Failed to update request.", "error");
    }
  };

  const pendingRequests = useMemo(() => {
    const q = query.trim().toLowerCase();
    const src = pending;
    if (!q) return src;
    return src.filter((r) => `${r.name} ${r.slug ?? ""}`.toLowerCase().includes(q));
  }, [pending, query]);

  const activeList = useMemo(() => {
    const q = query.trim().toLowerCase();
    const src = communities;
    if (!q) return src;
    return src.filter((c) => `${c.name} ${c.slug}`.toLowerCase().includes(q));
  }, [communities, query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Communities</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform groups and creation requests.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search communities..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <button className="flex items-center justify-center p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a35]">
        <button
          onClick={() => setActiveTab("All")}
          className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "All" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          All Communities
        </button>
        <button
          onClick={() => setActiveTab("Pending")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "Pending" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Pending Requests 
          {pendingRequests.length > 0 && (
            <span className="bg-[#6c63ff] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "Pending" && (
        <div className="space-y-4">
          {!loading && pendingRequests.length === 0 ? (
             <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
               <Shield size={48} className="mb-4 opacity-20" />
               <p>No pending community creation requests.</p>
             </div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{req.name}</h3>
                    <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20">Pending</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Requested by <span className="text-white">{req.created_by}</span> • {new Date(req.created_at).toLocaleString()}
                  </div>
                  <div className="mt-3 text-sm text-gray-300 bg-[#13131a] p-3 rounded-lg border border-[#2a2a35]">
                    <span className="text-gray-500 font-medium">Description: </span> 
                    {req.description || "—"}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => void decide(req.id, "rejected")} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/20 transition flex items-center gap-2 text-sm">
                    <X size={16}/> Reject
                  </button>
                  <button onClick={() => void decide(req.id, "approved")} className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition flex items-center gap-2 text-sm">
                    <Check size={16}/> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "All" && (
        <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Community</th>
                  <th className="px-6 py-4 font-semibold">Stats</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a35]">
                {activeList.map((comm) => (
                  <tr key={comm.id} className="hover:bg-[#13131a] transition cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{comm.name}</div>
                      <div className="text-xs mt-1 text-gray-500">Created {new Date(comm.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <span className="flex items-center gap-1"><Users size={14} className="text-gray-500"/> —</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{comm.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
