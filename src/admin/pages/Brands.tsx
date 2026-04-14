import React, { useEffect, useMemo, useState } from "react";
import { Search, Megaphone, Check, X, Link as LinkIcon, Mail, IndianRupee, RefreshCw } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

interface BrandItem {
  id: string;
  brand_name: string;
  contact_name: string | null;
  email: string | null;
  ad_format: string | null;
  budget_inr: number | null;
  audience: string | null;
  website_url: string | null;
  status: "pending" | "approved" | "rejected" | "active";
  created_at: string;
}

export default function Brands() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<BrandItem[]>([]);
  const [q, setQ] = useState("");

  const getStatusBadge = (status: BrandItem["status"]) => {
    switch (status) {
      case "active":
        return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">Active</span>;
      case "pending":
        return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20">Pending Review</span>;
      case "rejected":
        return <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-bold border border-red-400/20">Rejected</span>;
      case "approved":
        return <span className="text-sky-300 bg-sky-300/10 px-2 py-0.5 rounded text-xs font-bold border border-sky-300/20">Approved</span>;
    }
  };

  const load = async () => {
    const sb = getSupabase();
    if (!sb) {
      setErr("Supabase is not configured.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErr(null);
      const { data, error } = await sb
        .from("brand_ad_requests")
        .select("id, brand_name, contact_name, email, ad_format, budget_inr, audience, website_url, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows((data ?? []) as any);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load brand queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => `${r.brand_name} ${r.email ?? ""} ${r.audience ?? ""}`.toLowerCase().includes(qq));
  }, [rows, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Brand Advertising</h1>
          <p className="text-gray-400 text-sm mt-1">Review B2B sponsorship and advertising applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand queue..."
              className="bg-[#13131a] border border-[#2a2a35] rounded-lg py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-[#6c63ff] text-white w-56"
            />
          </div>
          <button
            onClick={() => void load()}
            className="p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-300 hover:text-white hover:bg-[#2a2a35] transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(brand => (
          <div key={brand.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl flex flex-col hover:border-[#6c63ff]/30 transition overflow-hidden">
            <div className="p-5 border-b border-[#2a2a35] flex items-start justify-between bg-[#13131a]">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Megaphone size={18} className="text-[#6c63ff]" /> {brand.brand_name}
                </h3>
                <div className="text-sm text-gray-500">{new Date(brand.created_at).toLocaleString()}</div>
              </div>
              {getStatusBadge(brand.status)}
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Contact Info</div>
                <div className="text-sm text-white">{brand.contact_name || "—"}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={12}/> {brand.email || "—"}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#13131a] p-3 rounded border border-[#2a2a35]">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Ad Format</div>
                  <div className="text-sm text-white font-medium">{brand.ad_format || "—"}</div>
                </div>
                <div className="bg-[#13131a] p-3 rounded border border-[#2a2a35]">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Budget Setup</div>
                  <div className="text-sm text-emerald-400 font-bold flex items-center gap-1">
                    <IndianRupee size={12} />
                    {brand.budget_inr != null ? brand.budget_inr.toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Target Audience</div>
                <div className="text-sm text-gray-300 bg-[#2a2a35]/30 px-3 py-1.5 rounded">{brand.audience || "—"}</div>
              </div>
            </div>

            {brand.status === "pending" ? (
              <div className="p-4 border-t border-[#2a2a35] bg-[#13131a] grid grid-cols-2 gap-3">
                <button
                  className="py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm"
                  onClick={async () => {
                    const sb = getSupabase();
                    if (!sb) return;
                    const { data: u } = await sb.auth.getUser();
                    const user = u.user;
                    const { error } = await sb
                      .from("brand_ad_requests")
                      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
                      .eq("id", brand.id);
                    if (error) {
                      setErr(error.message);
                      return;
                    }
                    setRows((prev) => prev.map((r) => (r.id === brand.id ? ({ ...r, status: "rejected" } as any) : r)));
                  }}
                >
                  <X size={16} /> Reject
                </button>
                <button
                  className="py-2.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition flex items-center justify-center gap-2 text-sm"
                  onClick={async () => {
                    const sb = getSupabase();
                    if (!sb) return;
                    const { data: u } = await sb.auth.getUser();
                    const user = u.user;
                    const { error } = await sb
                      .from("brand_ad_requests")
                      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
                      .eq("id", brand.id);
                    if (error) {
                      setErr(error.message);
                      return;
                    }
                    setRows((prev) => prev.map((r) => (r.id === brand.id ? ({ ...r, status: "approved" } as any) : r)));
                  }}
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-[#2a2a35] bg-[#13131a]">
                <a
                  href={brand.website_url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-[#1c1c27] text-white border border-[#333] font-medium rounded-lg hover:bg-[#2a2a35] transition flex items-center justify-center gap-2 text-sm"
                >
                  <LinkIcon size={16} /> {brand.website_url ? "Open website" : "No website"}
                </a>
              </div>
            )}
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border border-[#2a2a35] rounded-xl border-dashed">
            No brand advertising requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
