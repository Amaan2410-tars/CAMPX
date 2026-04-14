import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type PendingProfile = {
  id: string;
  full_name: string | null;
  college: string | null;
  program: string | null;
  year_of_study: string | null;
  verification_status: string | null;
  created_at: string | null;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main(): Promise<void> {
  const dau = document.getElementById("campx-metric-dau");
  const signups = document.getElementById("campx-metric-signups");
  const kyc = document.getElementById("campx-metric-kyc");
  const reports = document.getElementById("campx-metric-reports");
  const queueHost = document.getElementById("campx-verify-queue");
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
  if (reports) reports.textContent = String(j.open_reports ?? 0);

  const { data: pending, error: pErr } = await sb
    .from("profiles")
    .select("id,full_name,college,program,year_of_study,verification_status,created_at")
    .in("verification_status", ["email_unverified", "email_verified"])
    .eq("tier", "basic")
    .order("created_at", { ascending: true })
    .limit(100);

  if (kyc) kyc.textContent = pErr ? "—" : String((pending ?? []).length);
  if (!queueHost) return;
  if (pErr) {
    queueHost.innerHTML = `<div style="padding:12px;color:#fca5a5;">Unable to load queue: ${esc(pErr.message)}</div>`;
    return;
  }

  const rows = (pending ?? []) as PendingProfile[];
  if (!rows.length) {
    queueHost.innerHTML = `<div style="padding:12px;color:#95a0d9;">No pending verification requests.</div>`;
    return;
  }

  queueHost.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>College</th>
          <th>Program</th>
          <th>Year</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
          <tr data-row="${esc(r.id)}">
            <td>${esc(r.full_name || "—")}</td>
            <td>${esc(r.college || "—")}</td>
            <td>${esc((r.program || "").toUpperCase() || "—")}</td>
            <td>${esc(r.year_of_study || "—")}</td>
            <td>${esc(r.verification_status || "—")}</td>
            <td>${r.created_at ? esc(new Date(r.created_at).toLocaleString()) : "—"}</td>
            <td>
              <button class="btn ok" data-act="approve" data-id="${esc(r.id)}">Approve</button>
              <button class="btn bad" data-act="reject" data-id="${esc(r.id)}">Reject</button>
            </td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;

  queueHost.querySelectorAll<HTMLButtonElement>("button[data-act]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      const act = btn.dataset.act;
      if (!userId || !act) return;
      btn.disabled = true;
      const { error } = await sb.rpc("founder_review_account", {
        _user_id: userId,
        _decision: act,
      });
      if (error) {
        alert(error.message);
        btn.disabled = false;
        return;
      }
      const row = queueHost.querySelector(`tr[data-row="${CSS.escape(userId)}"]`);
      row?.remove();
      const current = Number(kyc?.textContent || "0");
      if (kyc && Number.isFinite(current)) kyc.textContent = String(Math.max(0, current - 1));
    });
  });
}

void main();
