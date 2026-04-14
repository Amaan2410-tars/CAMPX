import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, ShieldAlert, MoreVertical, Flag, MessageSquare, Image as ImageIcon, Trash2, UserX, AlertTriangle, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { triggerGlobalToast } from "@/components/AppLayout";

type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: "post" | "profile" | "message" | "community";
  target_id: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
};

export default function PostsModeration() {
  const [activeTab, setActiveTab] = useState<"Reported" | "All">("Reported");
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState<ReportRow[]>([]);

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
        const { data, error } = await sb
          .from("reports")
          .select("id, reporter_id, target_type, target_id, reason, status, created_at")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw error;
        if (!cancelled) setReports((data ?? []) as any);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load reports.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = reports;
    const base =
      activeTab === "Reported"
        ? list.filter((r) => r.status === "open" || r.status === "reviewing")
        : list;
    if (!q) return base;
    return base.filter((r) => `${r.target_type} ${r.target_id} ${r.reason} ${r.status}`.toLowerCase().includes(q));
  }, [reports, query, activeTab]);

  const setStatus = async (id: string, status: ReportRow["status"], note?: string) => {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data: userData } = await sb.auth.getUser();
      const moderatorId = userData.user?.id;
      await sb.from("reports").update({ status, updated_at: new Date().toISOString() }).eq("id", id).throwOnError();
      if (moderatorId) {
        await sb
          .from("moderation_actions")
          .insert({ report_id: id, moderator_id: moderatorId, action: status, notes: note ?? null })
          .throwOnError();
      }
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
      triggerGlobalToast("Moderation action saved.", "success");
    } catch (e: any) {
      triggerGlobalToast(e?.message ?? "Failed to apply action.", "error");
    }
  };

  const renderReportedList = () => (
    <div className="space-y-4">
      {filtered.map((r) => (
        <div key={r.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-5 flex flex-col hover:border-[#6c63ff]/50 transition cursor-pointer" onClick={() => setSelected(r)}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-500/10 text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                  <Flag size={12} /> Report
                </span>
                <span className="text-gray-500 text-xs">{r.target_type.toUpperCase()} • {new Date(r.created_at).toLocaleString()} • {r.status}</span>
              </div>
              <p className="text-white text-sm font-medium line-clamp-2 mb-3">"{r.reason}"</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><UserX size={14} /> {r.reporter_id}</span>
                <span className="text-gray-500">{r.target_id}</span>
              </div>
            </div>
            <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#13131a] transition" onClick={(e) => { e.stopPropagation(); }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Posts & Moderation</h1>
          <p className="text-gray-400 text-sm mt-1">Review flagged content and enforce community guidelines.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search content..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <button className="p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Column: List */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex border-b border-[#2a2a35] mb-4 shrink-0">
            <button
              onClick={() => setActiveTab("Reported")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "Reported" ? "border-red-500 text-red-500" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Reported Queue <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{filtered.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("All")}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "All" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              All Platform Posts
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {err && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
                {err}
              </div>
            )}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-[#1c1c27] rounded-xl border border-[#2a2a35]">
                Loading…
              </div>
            ) : activeTab === "Reported" ? (
              filtered.length ? renderReportedList() : (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-[#1c1c27] rounded-xl border border-[#2a2a35]">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p>No open reports.</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-[#1c1c27] rounded-xl border border-[#2a2a35]">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>All reports</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review Panel */}
        {selected ? (
          <div className="w-full sm:w-[400px] flex flex-col border border-[#2a2a35] bg-[#1c1c27] rounded-xl shadow-xl overflow-hidden shrink-0">
            <div className="p-4 border-b border-[#2a2a35] flex items-center justify-between bg-[#13131a]">
              <h3 className="font-bold text-white flex items-center gap-2"><ShieldAlert size={18} className="text-red-400"/> Content Review</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Reported Content</h4>
                <div className="p-4 bg-[#13131a] border border-[#2a2a35] rounded-xl text-white text-sm">
                  {selected.reason}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Author Details</h4>
                <div className="p-3 bg-[#13131a] border border-[#2a2a35] rounded-xl text-sm flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Target</div>
                    <div className="text-gray-500 text-xs">{selected.target_type} • {selected.target_id}</div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#1c1c27] border border-[#333] text-gray-300 rounded hover:text-white text-xs font-semibold">View Profile</button>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Report Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm bg-[#2a2a35]/30 p-2 rounded text-gray-300 border border-[#2a2a35]">
                    <span>Status</span>
                    <span className="font-bold text-white">{selected.status}</span>
                  </div>
                  <div className="flex justify-between text-sm bg-[#2a2a35]/30 p-2 rounded text-gray-300 border border-[#2a2a35]">
                    <span>Reporter</span>
                    <span className="font-bold text-white">{selected.reporter_id}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#2a2a35] bg-[#13131a] space-y-3">
              <button 
                onClick={() => void setStatus(selected.id, "resolved", "Content removed")}
                className="w-full flex justify-between items-center px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
              >
                Delete Content <Trash2 size={18} />
              </button>
              <button 
                onClick={() => void setStatus(selected.id, "reviewing", "User warned")}
                className="w-full flex justify-between items-center px-4 py-3 bg-[#2a2a35] text-yellow-500 font-bold rounded-lg hover:bg-[#333] transition border border-[#333]"
              >
                Issue Warning to User <AlertTriangle size={18} />
              </button>
              <button 
                onClick={() => void setStatus(selected.id, "dismissed", "Dismissed")}
                className="w-full text-center py-2 text-sm text-gray-500 hover:text-white font-medium transition"
              >
                Dismiss Report
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex w-[400px] flex-col items-center justify-center p-8 text-center bg-[#13131a] border border-[#2a2a35] rounded-xl text-gray-500 shrink-0">
             <ShieldAlert size={48} className="mb-4 opacity-20" />
             <h3 className="font-bold text-gray-400 mb-2">Select a Report</h3>
             <p className="text-sm">Click on any reported post from the queue to view full context, author history, and take moderation action.</p>
          </div>
        )}

      </div>
    </div>
  );
}
