import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Users, Plus, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type DbEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  tier_min: string | null;
  created_by: string;
  created_at: string;
};

export default function Events() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);

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
          .from("events")
          .select("id, title, starts_at, ends_at, tier_min, created_by, created_at")
          .order("starts_at", { ascending: false })
          .limit(60);
        if (error) throw error;
        const evs = (data ?? []) as DbEvent[];
        if (cancelled) return;
        setEvents(evs);

        // Best-effort registration counts (only for listed events)
        const counts: Record<string, number> = {};
        await Promise.all(
          evs.map(async (e) => {
            const { count } = await sb.from("event_registrations").select("user_id", { count: "exact", head: true }).eq("event_id", e.id);
            counts[e.id] = count ?? 0;
          })
        );
        if (!cancelled) setRegCounts(counts);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load events.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => events, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Events & Contests</h1>
          <p className="text-gray-400 text-sm mt-1">Manage published events and registrations.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rows.map((event) => (
          <div key={event.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden flex flex-col hover:border-[#6c63ff]/30 transition">
            <div className="h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 relative">
              {event.tier_min && (
                <div className="absolute top-3 right-3">
                  <span className="text-gray-200 bg-black/40 px-2 py-0.5 rounded text-xs font-bold border border-white/10">
                    {event.tier_min.toUpperCase()}+
                  </span>
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
              <p className="text-sm text-gray-400 mb-4">
                Starts {new Date(event.starts_at).toLocaleString()}
              </p>
              
              <div className="space-y-2 text-sm mt-auto">
                <div className="flex items-center gap-2 text-gray-300">
                  <CalendarDays size={16} className="text-gray-500" />
                  Created {new Date(event.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-5 p-3 bg-[#13131a] rounded-lg border border-[#2a2a35] flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                   <Users size={16} className="text-[#6c63ff]"/> {regCounts[event.id] ?? 0} Registered
                </div>
                <div className="text-xs text-gray-500">{event.id}</div>
              </div>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border border-[#2a2a35] rounded-xl border-dashed">
            No events found in this category.
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1c1c27] border border-[#2a2a35] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#2a2a35]">
              <div className="text-white font-bold">Create event</div>
              <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const sb = getSupabase();
                  if (!sb) {
                    setErr("Supabase is not configured.");
                    return;
                  }
                  try {
                    setErr(null);
                    setCreateSaving(true);
                    const fd = new FormData(e.currentTarget);
                    const title = String(fd.get("title") ?? "").trim();
                    const starts_at = String(fd.get("starts_at") ?? "").trim();
                    const ends_at = String(fd.get("ends_at") ?? "").trim();
                    const tier_min = String(fd.get("tier_min") ?? "").trim() || null;
                    const description = String(fd.get("description") ?? "").trim() || null;
                    if (!title) throw new Error("Title is required.");
                    if (!starts_at) throw new Error("Start date/time is required.");
                    const { data: u } = await sb.auth.getUser();
                    const user = u.user;
                    if (!user) throw new Error("Not signed in.");

                    const { data, error } = await sb
                      .from("events")
                      .insert({
                        title,
                        description,
                        starts_at: new Date(starts_at).toISOString(),
                        ends_at: ends_at ? new Date(ends_at).toISOString() : null,
                        tier_min,
                        created_by: user.id,
                      })
                      .select("id, title, starts_at, ends_at, tier_min, created_by, created_at")
                      .single();
                    if (error) throw error;

                    setEvents((prev) => [data as any, ...prev]);
                    setCreateOpen(false);
                  } catch (e2: any) {
                    setErr(e2?.message ?? "Failed to create event.");
                  } finally {
                    setCreateSaving(false);
                  }
                }}
              >
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Title*</label>
                  <input
                    name="title"
                    className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                    placeholder="e.g. Hackathon Week 1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                    placeholder="Optional details"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Starts at*</label>
                  <input
                    name="starts_at"
                    type="datetime-local"
                    className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ends at</label>
                  <input
                    name="ends_at"
                    type="datetime-local"
                    className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Minimum tier</label>
                  <select
                    name="tier_min"
                    className="w-full bg-[#13131a] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                    defaultValue=""
                  >
                    <option value="">None</option>
                    <option value="basic">basic</option>
                    <option value="verified">verified</option>
                    <option value="pro">pro</option>
                    <option value="plus">plus</option>
                  </select>
                </div>
                <div className="flex items-end justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 border border-[#2a2a35] hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={createSaving}
                    type="submit"
                    className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {createSaving ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
