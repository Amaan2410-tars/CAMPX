import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main(): Promise<void> {
  const host = document.getElementById("campx-events-live");
  if (!host) return;
  if (!isSupabaseConfigured()) {
    host.textContent = "";
    return;
  }
  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data: events, error } = await sb
    .from("events")
    .select("id, title, description, starts_at, tier_min")
    .order("starts_at", { ascending: true })
    .limit(30);

  if (error) {
    host.innerHTML = `<p style="color:#f87171;">${escapeHtml(error.message)}</p>`;
    return;
  }

  const rows = events ?? [];
  host.innerHTML =
    `<div style="margin-bottom:16px;">
      <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:4px;">Create event (title)</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input id="campx-ev-title" type="text" placeholder="Title" style="flex:1;min-width:200px;padding:8px 10px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;" />
        <button type="button" id="campx-ev-create" style="padding:8px 14px;border-radius:8px;border:none;background:#6366f1;color:#fff;cursor:pointer;">Create</button>
      </div>
    </div>` +
    (rows.length
      ? `<div style="display:flex;flex-direction:column;gap:12px;">${rows
          .map(
            (ev) => `
      <div class="box">
        <div style="font-weight:600;">${escapeHtml(ev.title)}</div>
        <div style="font-size:13px;color:#94a3b8;margin-top:4px;">${escapeHtml(ev.description || "")}</div>
        <div style="font-size:12px;color:#64748b;margin-top:6px;">Starts: ${escapeHtml(new Date(ev.starts_at).toLocaleString())}${ev.tier_min ? ` · Min tier: ${escapeHtml(ev.tier_min)}` : ""}</div>
        <button type="button" class="campx-ev-reg" data-id="${ev.id}" style="margin-top:8px;padding:6px 12px;border-radius:8px;border:none;background:#0ea5e9;color:#fff;cursor:pointer;font-size:12px;" ${user ? "" : "disabled"}>Register</button>
      </div>`,
          )
          .join("")}</div>`
      : '<p style="color:#9ca3af;">No events yet. Create one above.</p>') +
    '<p style="margin-top:16px;"><a href="/feed">Back to app</a></p>';

  document.getElementById("campx-ev-create")?.addEventListener("click", async () => {
    if (!user) return;
    const title = (document.getElementById("campx-ev-title") as HTMLInputElement)?.value?.trim();
    if (!title) return;
    const starts = new Date();
    starts.setDate(starts.getDate() + 1);
    await sb.from("events").insert({
      title,
      description: "",
      starts_at: starts.toISOString(),
      created_by: user.id,
    });
    void main();
  });

  host.querySelectorAll(".campx-ev-reg").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLButtonElement).dataset.id;
      if (!id || !user) return;
      await sb.from("event_registrations").insert({ event_id: id, user_id: user.id });
      (btn as HTMLButtonElement).textContent = "Registered";
      (btn as HTMLButtonElement).disabled = true;
    });
  });
}

void main();
