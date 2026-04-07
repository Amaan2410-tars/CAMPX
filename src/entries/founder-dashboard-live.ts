import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

async function main(): Promise<void> {
  const dau = document.getElementById("campx-metric-dau");
  const signups = document.getElementById("campx-metric-signups");
  const kyc = document.getElementById("campx-metric-kyc");
  const reports = document.getElementById("campx-metric-reports");
  if (!dau || !isSupabaseConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;

  const { data, error } = await sb.rpc("founder_dashboard_metrics");
  if (error) {
    dau.textContent = "—";
    if (signups) signups.textContent = "—";
    if (kyc) kyc.textContent = "—";
    if (reports) reports.textContent = "—";
    return;
  }
  const j = data as {
    dau_today?: number;
    signups_today?: number;
    open_reports?: number;
    profiles_total?: number;
  };
  dau.textContent = String(j.dau_today ?? 0);
  if (signups) signups.textContent = String(j.signups_today ?? 0);
  if (kyc) kyc.textContent = "—";
  if (reports) reports.textContent = String(j.open_reports ?? 0);
}

void main();
