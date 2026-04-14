import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Users } from "lucide-react";
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
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1c1c27] text-white text-sm font-semibold rounded-lg border border-[#333] hover:bg-[#2a2a35] transition">
          <CalendarDays size={16} /> Create Event (wire backend)
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
    </div>
  );
}
