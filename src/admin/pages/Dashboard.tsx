import React, { useEffect, useMemo, useState } from "react";
import { Users2, ShieldCheck, Building2, CreditCard, Star, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getSupabase } from "@/lib/supabase";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    colleges: 0,
    communities: 0,
    proUsers: 0,
    plusUsers: 0,
    revenueMtdCents: 0,
  });

  const [signupData, setSignupData] = useState<Array<{ name: string; users: number }>>([]);
  const [tierData, setTierData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [recentAudit, setRecentAudit] = useState<Array<{ id: string; action: string; entity: string; created_at: string }>>([]);

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

        const since30 = new Date();
        since30.setDate(since30.getDate() - 30);

        const [
          profilesAll,
          verifiedProfiles,
          proProfiles,
          plusProfiles,
          collegesCount,
          communitiesCount,
          paymentsMtd,
          analytics,
          audit,
        ] = await Promise.all([
          sb.from("profiles").select("id", { count: "exact", head: true }),
          sb.from("profiles").select("id", { count: "exact", head: true }).in("tier", ["verified", "pro", "plus"]),
          sb.from("profiles").select("id", { count: "exact", head: true }).eq("tier", "pro"),
          sb.from("profiles").select("id", { count: "exact", head: true }).eq("tier", "plus"),
          sb.from("colleges").select("id", { count: "exact", head: true }),
          sb.from("communities").select("id", { count: "exact", head: true }),
          sb
            .from("payments")
            .select("amount_cents, created_at, status")
            .eq("status", "captured")
            .gte("created_at", startOfMonth.toISOString()),
          sb
            .from("analytics_daily")
            .select("day, signups")
            .gte("day", since30.toISOString().slice(0, 10))
            .order("day", { ascending: true }),
          sb.from("audit_log").select("id, action, entity, created_at").order("created_at", { ascending: false }).limit(20),
        ]);

        const mtdSumCents = (paymentsMtd.data ?? []).reduce((acc, p) => acc + (p.amount_cents ?? 0), 0);

        const signups =
          (analytics.data ?? []).map((r) => ({
            name: new Date(r.day as any).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            users: r.signups ?? 0,
          })) ?? [];

        const total = profilesAll.count ?? 0;
        const verifiedPlus = verifiedProfiles.count ?? 0;
        const pro = proProfiles.count ?? 0;
        const plus = plusProfiles.count ?? 0;
        const verifiedOnly = Math.max(0, verifiedPlus - pro - plus);
        const basic = Math.max(0, total - verifiedPlus);

        const td = [
          { name: "Verified", value: verifiedOnly, color: "#4ade80" },
          { name: "Basic", value: basic, color: "#9ca3af" },
          { name: "Pro", value: pro, color: "#a855f7" },
          { name: "Plus", value: plus, color: "#ec4899" },
        ];

        if (cancelled) return;
        setMetrics({
          totalUsers: total,
          verifiedUsers: verifiedPlus,
          colleges: collegesCount.count ?? 0,
          communities: communitiesCount.count ?? 0,
          proUsers: pro,
          plusUsers: plus,
          revenueMtdCents: mtdSumCents,
        });
        setSignupData(signups);
        setTierData(td);
        setRecentAudit(audit.data ?? []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const metricCards = useMemo(
    () => [
      { label: "Total Users", value: metrics.totalUsers.toLocaleString(), icon: Users2, color: "text-blue-400" },
      { label: "Verified+ Users", value: metrics.verifiedUsers.toLocaleString(), icon: ShieldCheck, color: "text-green-400" },
      { label: "Colleges", value: metrics.colleges.toLocaleString(), icon: Building2, color: "text-purple-400" },
      { label: "Communities", value: metrics.communities.toLocaleString(), icon: Activity, color: "text-orange-400" },
      { label: "Pro Users", value: metrics.proUsers.toLocaleString(), icon: Star, color: "text-yellow-400" },
      { label: "Plus Users", value: metrics.plusUsers.toLocaleString(), icon: Star, color: "text-pink-400" },
      {
        label: "Revenue (MTD)",
        value: `₹${Math.round(metrics.revenueMtdCents / 100).toLocaleString()}`,
        icon: CreditCard,
        color: "text-emerald-400",
      },
      { label: "Uptime", value: "—", icon: TrendingUp, color: "text-gray-400" },
    ],
    [metrics]
  );

  return (
    <div className="space-y-6">
      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((item, idx) => (
          <div key={idx} className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-[#13131a] ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] lg:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4">User Growth (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#13131a", borderColor: "#2a2a35" }} />
                <Line type="monotone" dataKey="users" stroke="#6c63ff" strokeWidth={3} dot={{ r: 4, fill: "#6c63ff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {!loading && signupData.length === 0 && (
            <div className="text-xs text-gray-500 mt-2">No analytics data yet.</div>
          )}
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <h3 className="text-base font-semibold text-white mb-4">Tier Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#13131a", borderColor: "#2a2a35" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {tierData.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></div>
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-[#1c1c27] rounded-xl border border-[#2a2a35] overflow-hidden">
          <div className="p-4 border-b border-[#2a2a35]">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Action Items Queue</h3>
          </div>
          <div className="divide-y divide-[#2a2a35]">
            <div className="p-4 flex items-center justify-between hover:bg-[#13131a] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Building2 size={20} /></div>
                <div>
                  <div className="text-sm font-medium text-white">College Domains</div>
                  <div className="text-xs text-gray-400">Manage college email domains for verification.</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-[#13131a] border border-[#333] rounded text-xs text-white hover:bg-[#6c63ff] hover:border-[#6c63ff] transition">Open</button>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-[#13131a] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg"><ShieldCheck size={20} /></div>
                <div>
                  <div className="text-sm font-medium text-white">Reported Posts</div>
                  <div className="text-xs text-gray-400">Review incoming reports and take action.</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-[#13131a] border border-[#333] rounded text-xs text-white hover:bg-[#6c63ff] hover:border-[#6c63ff] transition">Moderate</button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1c1c27] rounded-xl border border-[#2a2a35] overflow-hidden">
          <div className="p-4 border-b border-[#2a2a35] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Live Activity</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </div>
          <div className="p-2 h-[260px] overflow-y-auto custom-scrollbar">
            {recentAudit.map((act) => (
              <div key={act.id} className="p-3 mb-1 flex gap-3 text-sm rounded-lg hover:bg-[#13131a]">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#6c63ff] shrink-0"></div>
                <div className="flex-1">
                  <div className="text-gray-200"><span className="font-semibold text-white">{act.entity}</span> • {act.action}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>{new Date(act.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {!loading && recentAudit.length === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm">No audit events yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
