import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, ChevronLeft, Building2, Users, Activity, CalendarDays, SearchX, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { triggerGlobalToast } from "@/components/AppLayout";

interface College {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export default function Colleges() {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Overview" | "Users" | "Communities" | "Posts" | "Events">("Overview");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [all, setAll] = useState<College[]>([]);
  const [stats, setStats] = useState<{ usersCount: number; verifiedCount: number } | null>(null);

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
        const { data, error } = await sb.from("colleges").select("id, name, code, created_at").order("name", { ascending: true });
        if (error) throw error;
        if (!cancelled) setAll((data ?? []) as any);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load colleges.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !selectedCollege) return;
    let cancelled = false;
    void (async () => {
      try {
        setStats(null);
        const [{ count: usersCount }, { count: verifiedCount }] = await Promise.all([
          sb.from("profiles").select("id", { count: "exact", head: true }).eq("college_id", selectedCollege.id),
          sb
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("college_id", selectedCollege.id)
            .in("tier", ["verified", "pro", "plus"]),
        ]);
        if (!cancelled) setStats({ usersCount: usersCount ?? 0, verifiedCount: verifiedCount ?? 0 });
      } catch {
        if (!cancelled) setStats({ usersCount: 0, verifiedCount: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCollege?.id]);

  const filteredColleges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [all, searchQuery]);

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      triggerGlobalToast("Supabase is not configured.", "error");
      return;
    }
    try {
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const name = String(fd.get("college_name") ?? "").trim();
      const code = String(fd.get("college_code") ?? "").trim();
      const domain = String(fd.get("college_domain") ?? "").trim();
      if (!name) throw new Error("College name is required.");
      if (!code) throw new Error("College code is required.");

      const { data, error } = await sb.from("colleges").insert({ name, code }).select("id, name, code, created_at").single();
      if (error) throw error;

      if (domain) {
        const cleaned = domain.replace(/^@/, "").trim().toLowerCase();
        const { error: dErr } = await sb.from("college_email_domains").insert({ college_id: data.id, domain: cleaned });
        if (dErr) throw dErr;
      }

      setAll((prev) => [data as any, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setIsAddModalOpen(false);
      triggerGlobalToast("College created.", "success");
    } catch (e: any) {
      triggerGlobalToast(e?.message ?? "Failed to create college.", "error");
    }
  };

  if (selectedCollege) {
    return (
      <div className="space-y-6 w-full max-w-none">
        {/* Detail View Header */}
        <div className="flex items-center gap-4 border-b border-[#2a2a35] pb-4">
          <button 
            onClick={() => setSelectedCollege(null)}
            className="p-2 hover:bg-[#1c1c27] rounded-lg transition text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{selectedCollege.name}</h2>
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <span>{selectedCollege.code}</span> • 
              <span>Added {new Date(selectedCollege.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a35]">
          {[
            { id: "Overview", icon: Building2 },
            { id: "Users", icon: Users },
            { id: "Posts", icon: Activity },
            { id: "Events", icon: CalendarDays }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? "border-[#6c63ff] text-[#6c63ff]" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon size={16} />
              {tab.id}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-white">{(stats?.usersCount ?? 0).toLocaleString()}</div>
                </div>
                <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Verified+ Users</div>
                  <div className="text-2xl font-bold text-green-400">{(stats?.verifiedCount ?? 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="p-6 bg-[#1c1c27] rounded-xl border border-[#2a2a35] max-w-2xl">
                <h3 className="font-semibold text-white mb-4">Registration Setup</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#2a2a35] pb-2">
                    <span className="text-gray-400">College Email Domains</span>
                    <span className="text-white font-medium">Manage in Domains table</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35] pb-2">
                    <span className="text-gray-400">Verification Method</span>
                    <span className="text-white font-medium">College email only</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab !== "Overview" && (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <SearchX size={48} className="mb-4 opacity-20" />
              <p>Module loaded dynamically.</p>
              <p className="text-xs mt-2">Displaying data specific to {selectedCollege.name}.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Colleges Registry</h1>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search colleges..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent"
          >
            <Plus size={16} /> Add College
          </button>
        </div>
      </div>

      {/* College Table */}
      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">College Name</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    Loading…
                  </td>
                </tr>
              ) : filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    No colleges found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-[#13131a] transition cursor-pointer" onClick={() => setSelectedCollege(college)}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{college.name}</div>
                      <div className="text-xs mt-1 text-gray-500">{college.id}</div>
                    </td>
                    <td className="px-6 py-4">{college.code}</td>
                    <td className="px-6 py-4">{new Date(college.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2a2a35] flex items-center justify-between text-xs text-gray-500 bg-[#13131a]">
          <div>Showing 1 to {filteredColleges.length} of {filteredColleges.length} entries</div>
          <div />
        </div>
      </div>

      {/* Add College Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#2a2a35]">
              <h2 className="text-xl font-bold text-white">Add New College</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="add-college-form" onSubmit={handleCreateCollege} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">College Name*</label>
                    <input name="college_name" required type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" placeholder="e.g. Oxford Engineering College" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">College Code*</label>
                    <input name="college_code" required type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" placeholder="e.g. OXF" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Official Email Domain (Optional)</label>
                    <input name="college_domain" type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" placeholder="@collegedomain.edu" />
                    <p className="text-xs text-gray-500 mt-1">Providing this enables automated Path A student verification.</p>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-[#2a2a35] bg-[#13131a] flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 bg-transparent border border-[#333] text-gray-300 rounded-lg hover:bg-[#2a2a35] transition text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                form="add-college-form"
                type="submit" 
                className="px-5 py-2.5 bg-[#6c63ff] border border-transparent text-white rounded-lg hover:bg-[#5b54e5] transition font-semibold text-sm"
              >
                Create College
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
