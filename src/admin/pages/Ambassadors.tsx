import React, { useEffect, useMemo, useState } from "react";
import { GraduationCap, FileText, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type AmbRow = {
  user_id: string;
  referrals_week: number;
  events_assisted: number;
  recognition_points: number;
  updated_at: string;
};

type ProfileRow = { id: string; full_name: string | null; college: string | null };

export default function Ambassadors() {
  const [activeTab, setActiveTab] = useState<"List" | "Reports">("List");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<AmbRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});

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
        const { data, error } = await sb.from("ambassador_stats").select("user_id, referrals_week, events_assisted, recognition_points, updated_at").order("updated_at", { ascending: false }).limit(200);
        if (error) throw error;
        const r = (data ?? []) as any as AmbRow[];
        const userIds = Array.from(new Set(r.map((x) => x.user_id)));
        const profMap: Record<string, ProfileRow> = {};
        if (userIds.length) {
          const { data: profs } = await sb.from("profiles").select("id, full_name, college").in("id", userIds);
          (profs ?? []).forEach((p: any) => (profMap[p.id] = p));
        }
        if (!cancelled) {
          setRows(r);
          setProfiles(profMap);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load ambassadors.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = rows.length;
  const compliance = useMemo(() => (rows.length ? "—" : "—"), [rows.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campus Ambassadors</h1>
          <p className="text-gray-400 text-sm mt-1">Manage remote representatives and review weekly submissions.</p>
        </div>
        <button className="px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent flex items-center gap-2">
          <GraduationCap size={16} /> Assign Ambassador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] flex items-center gap-4">
          <div className="p-3 bg-[#6c63ff]/10 text-[#6c63ff] rounded-lg"><GraduationCap size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white flex items-baseline gap-2">{activeCount} <span className="text-sm font-normal text-gray-500">Ambassadors</span></div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Force</div>
          </div>
        </div>
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><FileText size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white flex items-baseline gap-2">{compliance}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Report Compliance</div>
          </div>
        </div>
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg"><HelpCircle size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white">—</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Missing Ambassador</div>
          </div>
        </div>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}

      <div className="flex border-b border-[#2a2a35]">
        <button onClick={() => setActiveTab("List")} className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === "List" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"}`}>
          Roster
        </button>
        <button onClick={() => setActiveTab("Reports")} className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === "Reports" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"}`}>
          Weekly Reports (4 Pending)
        </button>
      </div>

      {activeTab === "List" && (
        <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden mt-6">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">Ambassador</th>
                <th className="px-6 py-4 font-semibold">College</th>
                <th className="px-6 py-4 font-semibold text-center">Reports</th>
                <th className="px-6 py-4 font-semibold text-center">Onboarded</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No ambassadors found.</td>
                </tr>
              ) : rows.map((rep) => (
                <tr key={rep.user_id} className="hover:bg-[#13131a] transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{profiles[rep.user_id]?.full_name ?? rep.user_id}</div>
                    <div className="text-xs text-gray-500">Updated {new Date(rep.updated_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{profiles[rep.user_id]?.college ?? "—"}</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-emerald-400 font-bold"><TrendingUp size={14}/> {rep.referrals_week}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">Active</span>
                  </td>
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-[#6c63ff] cursor-pointer hover:underline uppercase tracking-wider">
                    View Dash
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Reports" && (
        <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
           <CheckCircle2 size={48} className="mb-4 opacity-20 text-emerald-500" />
           <p className="text-white font-medium mb-1">You are all caught up!</p>
           <p className="text-sm">No pending weekly reports waiting for review.</p>
        </div>
      )}

    </div>
  );
}
