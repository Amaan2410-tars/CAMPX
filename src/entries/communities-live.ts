import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

async function main(): Promise<void> {
  const host = document.getElementById("campx-communities-live");
  if (!host) return;
  if (!isSupabaseConfigured()) {
    host.textContent = "";
    return;
  }
  const sb = getSupabase();
  if (!sb) return;

  const { data: comms, error } = await sb
    .from("communities")
    .select("id, name, slug")
    .order("name", { ascending: true })
    .limit(20);

  if (error) {
    host.textContent = `Live communities: ${error.message}`;
    return;
  }

  if (!comms?.length) {
    host.innerHTML =
      '<div style="opacity:0.85;">No communities in database yet. Create one in Supabase or seed <code>communities</code>.</div>';
    return;
  }

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data: mine } = user
    ? await sb.from("community_members").select("community_id").eq("user_id", user.id)
    : { data: [] };
  const joined = new Set((mine ?? []).map((m) => m.community_id as string));

  host.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px;color:var(--text);">Live from database</div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${comms
        .map((c) => {
          const j = joined.has(c.id);
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:var(--surface2);border-radius:10px;border:1px solid var(--border);">
            <span style="color:var(--text);font-size:13px;">${escapeHtml(c.name)}</span>
            <button type="button" class="campx-join-comm" data-id="${c.id}" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);background:${j ? "var(--surface3)" : "var(--accent)"};color:${j ? "var(--text-muted)" : "#fff"};font-size:12px;cursor:${j ? "default" : "pointer"};" ${j ? "disabled" : ""}>${j ? "Joined" : "Join"}</button>
          </div>`;
        })
        .join("")}
    </div>`;

  host.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".campx-join-comm");
    if (!btn || btn.disabled) return;
    const id = btn.dataset.id;
    if (!id || !user) return;
    const { error: e2 } = await sb.from("community_members").insert({
      community_id: id,
      user_id: user.id,
    });
    if (e2) {
      host.insertAdjacentHTML(
        "beforeend",
        `<div style="color:#f87171;margin-top:6px;font-size:12px;">${escapeHtml(e2.message)}</div>`,
      );
      return;
    }
    void main();
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

void main();
