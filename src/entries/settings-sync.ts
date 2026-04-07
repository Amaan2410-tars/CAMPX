import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { initials } from "@/lib/campxFeed";

async function main(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  const { data: profile, error } = await sb
    .from("profiles")
    .select("full_name, campx_id, college, program, year_of_study, tier, verification_status, settings_json")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return;

  const nameEl = document.querySelector(".pc-name");
  const metaEl = document.querySelector(".pc-meta .pc-college");
  const tierEl = document.querySelector(".pc-tier");
  const avEl = document.querySelector(".pc-avatar");

  const name = (profile.full_name as string)?.trim() || (profile.campx_id as string) || "You";
  if (nameEl) nameEl.textContent = name;

  const yrMap: Record<string, string> = {
    "1": "1st year",
    "2": "2nd year",
    "3": "3rd year",
    "4": "4th year",
    "5": "5th+ year",
  };
  const parts: string[] = [];
  if (profile.college) parts.push(String(profile.college));
  if (profile.program) parts.push(String(profile.program).toUpperCase());
  if (profile.year_of_study)
    parts.push(yrMap[String(profile.year_of_study)] || `Year ${profile.year_of_study}`);
  const metaLine = parts.join(" · ");
  if (metaEl) metaEl.textContent = metaLine || "CampX student";

  if (tierEl) {
    const t = (profile.tier as string) || "basic";
    tierEl.textContent = t.charAt(0).toUpperCase() + t.slice(1);
  }

  if (avEl) {
    const ring = avEl.querySelector(".pc-ring");
    avEl.textContent = "";
    if (ring) avEl.appendChild(ring);
    avEl.appendChild(document.createTextNode(initials(name)));
  }

  const defaultSettings: Record<string, boolean> = {
    activity_status: true,
    hide_from_explore: false,
    two_factor: true,
    notif_messages: true,
    notif_community: true,
    notif_events: true,
  };
  const rawSettings =
    profile && typeof (profile as { settings_json?: unknown }).settings_json === "object"
      ? ((profile as { settings_json?: Record<string, unknown> }).settings_json ?? {})
      : {};
  const currentSettings: Record<string, boolean> = { ...defaultSettings };
  Object.keys(defaultSettings).forEach((k) => {
    if (typeof rawSettings[k] === "boolean") currentSettings[k] = rawSettings[k] as boolean;
  });

  function applyToggleState(el: Element, on: boolean): void {
    el.classList.toggle("on", on);
  }

  document.querySelectorAll<HTMLElement>(".toggle-track[data-setting-key]").forEach((t) => {
    const key = t.dataset.settingKey;
    if (!key) return;
    applyToggleState(t, currentSettings[key] ?? false);
    t.addEventListener("click", async () => {
      const next = !t.classList.contains("on");
      applyToggleState(t, next);
      currentSettings[key] = next;
      const { error: upErr } = await sb
        .from("profiles")
        .update({ settings_json: currentSettings, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (upErr) {
        applyToggleState(t, !next);
      }
    });
  });

  const logoutRow = document.getElementById("campx-logout-row");
  const signOut = async () => {
    await sb.auth.signOut();
    window.location.href = "/auth/login";
  };
  logoutRow?.addEventListener("click", () => void signOut());
  logoutRow?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void signOut();
    }
  });
}

void main();
