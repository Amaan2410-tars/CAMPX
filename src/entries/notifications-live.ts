import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main(): Promise<void> {
  const host = document.getElementById("campx-notifications-live");
  if (!host) return;
  if (!isSupabaseConfigured()) {
    host.textContent = "Configure Supabase to load notifications.";
    return;
  }
  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    host.innerHTML = '<p style="color:#f87171;">Sign in to view notifications.</p>';
    return;
  }

  const { data: prefs } = await sb
    .from("notification_preferences")
    .select("email_enabled, in_app_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  const prefHtml = `
    <div class="box" style="margin-bottom:16px;">
      <div style="font-weight:600;margin-bottom:8px;">Preferences</div>
      <label style="display:flex;align-items:center;gap:8px;margin:4px 0;">
        <input type="checkbox" id="campx-pref-email" ${prefs?.email_enabled !== false ? "checked" : ""} /> Email
      </label>
      <label style="display:flex;align-items:center;gap:8px;margin:4px 0;">
        <input type="checkbox" id="campx-pref-inapp" ${prefs?.in_app_enabled !== false ? "checked" : ""} /> In-app
      </label>
      <button type="button" id="campx-pref-save" style="margin-top:8px;padding:8px 14px;border-radius:8px;border:none;background:#6366f1;color:#fff;cursor:pointer;">Save</button>
    </div>`;

  host.innerHTML =
    prefHtml +
    '<div id="campx-notif-list-inner"></div><p style="margin-top:16px;"><a href="/feed">Back to app</a></p>';

  const inner = document.getElementById("campx-notif-list-inner");
  if (!inner) return;

  async function renderList(): Promise<void> {
    const { data, error } = await sb
      .from("notifications")
      .select("id, type, title, body, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) {
      inner.innerHTML = `<p style="color:#f87171;">${escapeHtml(error.message)}</p>`;
      return;
    }
    const rows = data ?? [];
    inner.innerHTML = !rows.length
      ? '<p style="color:#9ca3af;">No notifications yet.</p>'
      : `<div style="display:flex;flex-direction:column;gap:10px;">${rows
          .map(
            (n) => `
        <div class="box" style="opacity:${n.read_at ? 0.75 : 1};">
          <div style="font-weight:600;">${escapeHtml(n.title || n.type)}</div>
          <div style="font-size:14px;color:#cbd5e1;">${escapeHtml(n.body || "")}</div>
          <div style="margin-top:8px;">
            <button type="button" class="campx-notif-read" data-id="${n.id}" style="padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;font-size:12px;" ${n.read_at ? "disabled" : ""}>${n.read_at ? "Read" : "Mark read"}</button>
            <span style="font-size:11px;color:#64748b;margin-left:8px;">${new Date(n.created_at).toLocaleString()}</span>
          </div>
        </div>`,
          )
          .join("")}</div>`;

    inner.querySelectorAll(".campx-notif-read").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = (btn as HTMLButtonElement).dataset.id;
        if (!id || (btn as HTMLButtonElement).disabled) return;
        await sb
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);
        await renderList();
      });
    });
  }

  document.getElementById("campx-pref-save")?.addEventListener("click", async () => {
    const email = (document.getElementById("campx-pref-email") as HTMLInputElement)?.checked ?? true;
    const inApp = (document.getElementById("campx-pref-inapp") as HTMLInputElement)?.checked ?? true;
    await sb.from("notification_preferences").upsert({
      user_id: user.id,
      email_enabled: email,
      in_app_enabled: inApp,
      updated_at: new Date().toISOString(),
    });
  });

  await renderList();
}

void main();
