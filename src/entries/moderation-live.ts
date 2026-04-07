import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchUserRoles, isStaff } from "@/lib/rbac";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main(): Promise<void> {
  const host = document.getElementById("campx-moderation-live");
  if (!host) return;
  if (!isSupabaseConfigured()) {
    host.textContent = "";
    return;
  }
  const sb = getSupabase();
  if (!sb) return;

  const { roles, error } = await fetchUserRoles(sb);
  if (error || !isStaff(roles)) {
    host.innerHTML =
      '<p style="color:#f87171;">Moderation queue is restricted to staff accounts.</p>';
    return;
  }

  const { data: reports, error: e2 } = await sb
    .from("reports")
    .select("id, reporter_id, target_type, target_id, reason, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (e2) {
    host.innerHTML = `<p style="color:#f87171;">${escapeHtml(e2.message)}</p>`;
    return;
  }

  const rows = reports ?? [];
  host.innerHTML =
    `<h2 style="margin:0 0 12px;font-size:18px;">Open reports</h2>` +
    (rows.length
      ? `<div style="display:flex;flex-direction:column;gap:10px;">${rows
          .map(
            (r) => `
      <div class="box">
        <div style="font-size:12px;color:#94a3b8;">${escapeHtml(r.status)} · ${escapeHtml(r.target_type)} · ${escapeHtml(r.target_id)}</div>
        <div style="margin-top:6px;">${escapeHtml(r.reason)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button type="button" class="campx-resolve" data-id="${r.id}" style="padding:6px 12px;border-radius:8px;border:none;background:#22c55e;color:#fff;cursor:pointer;font-size:12px;">Resolve</button>
          <button type="button" class="campx-dismiss" data-id="${r.id}" style="padding:6px 12px;border-radius:8px;border:none;background:#64748b;color:#fff;cursor:pointer;font-size:12px;">Dismiss</button>
        </div>
      </div>`,
          )
          .join("")}</div>`
      : '<p style="color:#9ca3af;">No reports.</p>') +
    '<p style="margin-top:16px;"><a href="/feed">Back to app</a></p>';

  host.querySelectorAll(".campx-resolve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLButtonElement).dataset.id;
      if (!id) return;
      await sb.from("reports").update({ status: "resolved", updated_at: new Date().toISOString() }).eq("id", id);
      void main();
    });
  });
  host.querySelectorAll(".campx-dismiss").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLButtonElement).dataset.id;
      if (!id) return;
      await sb.from("reports").update({ status: "dismissed", updated_at: new Date().toISOString() }).eq("id", id);
      void main();
    });
  });
}

void main();
