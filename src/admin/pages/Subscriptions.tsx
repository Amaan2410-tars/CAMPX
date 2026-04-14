import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type SubRow = {
  id: string;
  user_id: string;
  status: "inactive" | "active" | "past_due" | "canceled";
  current_period_end: string | null;
  created_at: string;
  plan: { slug: string; name: string; price_cents: number; interval: "month" | "year"; currency: string } | null;
};

type ProfileRow = { id: string; full_name: string | null; college: string | null; tier: string | null };

export default function Subscriptions() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [mtdRevenueCents, setMtdRevenueCents] = useState(0);

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

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [subsRes, paymentsRes] = await Promise.all([
          sb
            .from("subscriptions")
            .select("id, user_id, status, current_period_end, created_at, plan:plans(slug, name, price_cents, interval, currency)")
            .order("created_at", { ascending: false })
            .limit(200),
          sb
            .from("payments")
            .select("amount_cents, status, created_at")
            .eq("status", "captured")
            .gte("created_at", startOfMonth.toISOString()),
        ]);

        if (subsRes.error) throw subsRes.error;
        if (paymentsRes.error) throw paymentsRes.error;

        const s = (subsRes.data ?? []) as any as SubRow[];
        const userIds = Array.from(new Set(s.map((r) => r.user_id)));
        const profMap: Record<string, ProfileRow> = {};
        if (userIds.length) {
          const { data: profs } = await sb.from("profiles").select("id, full_name, college, tier").in("id", userIds);
          (profs ?? []).forEach((p: any) => {
            profMap[p.id] = p;
          });
        }

        const mtd = (paymentsRes.data ?? []).reduce((acc, p: any) => acc + (p.amount_cents ?? 0), 0);

        if (!cancelled) {
          setSubs(s);
          setProfiles(profMap);
          setMtdRevenueCents(mtd);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load subscriptions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusBadge = (status: SubRow["status"]) => {
    switch (status) {
      case "active": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20 flex items-center gap-1 w-fit"><RefreshCw size={10}/> Active</span>;
      case "past_due": return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20 flex items-center gap-1 w-fit"><AlertTriangle size={10}/> Past Due</span>;
      case "canceled": return <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded text-xs font-bold border border-gray-400/20 w-fit">Canceled</span>;
      default: return <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded text-xs font-bold border border-gray-400/20 w-fit">Inactive</span>;
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter((s) => {
      const p = profiles[s.user_id];
      return `${s.id} ${p?.full_name ?? ""} ${p?.college ?? ""} ${s.plan?.slug ?? ""} ${s.status}`.toLowerCase().includes(q);
    });
  }, [query, subs, profiles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Revenue</h1>
          <p className="text-gray-400 text-sm mt-1">Manage user tiers, billing cycles, and MRR metrics.</p>
        </div>
        <button className="px-4 py-2 bg-[#1c1c27] text-white text-sm font-semibold rounded-lg border border-[#333] hover:bg-[#2a2a35] transition">Export CSV</button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total MRR</div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-white flex items-center">₹ {Math.round(mtdRevenueCents / 100).toLocaleString()}</div>
          <div className="text-xs text-gray-400 font-medium mt-1">MTD captured payments</div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pro Tier</div>
            <div className="p-2 bg-[#a855f7]/10 text-[#a855f7] rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#a855f7]">—</div>
          <div className="text-xs text-gray-400 font-medium mt-1">Wire plan-level reporting</div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Plus Tier</div>
            <div className="p-2 bg-[#ec4899]/10 text-[#ec4899] rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#ec4899]">—</div>
          <div className="text-xs text-gray-400 font-medium mt-1">Wire plan-level reporting</div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Churn Rate</div>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><TrendingUp size={16} className="rotate-180" /></div>
          </div>
          <div className="text-2xl font-bold text-white">—</div>
          <div className="text-xs text-gray-400 font-medium mt-1">Compute churn via billing events</div>
        </div>
      </div>

      <div className="flex w-full items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search subscriptions..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
          />
        </div>
        <button className="flex items-center justify-center p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
           <Filter size={20} />
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}

      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">College</th>
                <th className="px-6 py-4 font-semibold">Plan Details</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Next Renewal / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No subscriptions found.</td>
                </tr>
              ) : rows.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#13131a] transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{profiles[sub.user_id]?.full_name ?? sub.user_id}</div>
                    <div className="text-xs mt-1 text-gray-500">{sub.id}</div>
                  </td>
                  <td className="px-6 py-4">{profiles[sub.user_id]?.college ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-white">{sub.plan?.name ?? "—"}</span>
                    <span className="text-gray-500 ml-2">({sub.plan?.interval ?? "—"})</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {sub.plan ? `₹ ${(sub.plan.price_cents / 100).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2a2a35] bg-[#13131a] flex justify-between items-center text-xs text-gray-500">
           <div>Showing {rows.length} subscriptions</div>
        </div>
      </div>
    </div>
  );
}
