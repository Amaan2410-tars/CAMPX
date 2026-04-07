import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

async function main(): Promise<void> {
  const ref = document.getElementById("campx-amb-metric-referrals");
  const ev = document.getElementById("campx-amb-metric-events");
  const pending = document.getElementById("campx-amb-metric-pending");
  const pts = document.getElementById("campx-amb-metric-points");
  if (!ref || !isSupabaseConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;

  const { data, error } = await sb.rpc("ambassador_dashboard_metrics");
  if (error) {
    ref.textContent = "—";
    if (ev) ev.textContent = "—";
    if (pending) pending.textContent = "—";
    if (pts) pts.textContent = "—";
    return;
  }
  const j = data as {
    recognition_points?: number;
    referrals_week?: number;
    events_assisted?: number;
    pending_leads?: number;
  };
  if (pts) pts.textContent = String(j.recognition_points ?? 0);
  if (ref) ref.textContent = String(j.referrals_week ?? 0);
  if (ev) ev.textContent = String(j.events_assisted ?? 0);
  if (pending) pending.textContent = String(j.pending_leads ?? 0);
}

void main();
