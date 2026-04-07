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
  const profileSettings: Record<string, unknown> = {
    ...(rawSettings as Record<string, unknown>),
  };
  Object.keys(defaultSettings).forEach((k) => {
    if (typeof rawSettings[k] === "boolean") currentSettings[k] = rawSettings[k] as boolean;
  });
  if (!("dm_visibility" in profileSettings)) {
    profileSettings.dm_visibility = "everyone";
  }

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
      profileSettings[key] = next;
      const { error: upErr } = await sb
        .from("profiles")
        .update({ settings_json: profileSettings, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (upErr) {
        applyToggleState(t, !next);
      }
    });
  });

  function getRowByTitle(title: string): HTMLElement | null {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".settings-row"));
    return rows.find((r) => r.querySelector(".row-title")?.textContent?.trim() === title) ?? null;
  }

  async function saveProfileFields(fields: Record<string, unknown>): Promise<boolean> {
    const { error: upErr } = await sb
      .from("profiles")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    return !upErr;
  }

  // Make "Edit profile" actually edit + persist.
  getRowByTitle("Edit profile")?.addEventListener("click", async () => {
    const nextName = window.prompt("Full name", String(profile.full_name ?? ""))?.trim();
    if (!nextName) return;
    const nextCollege = window.prompt("College", String(profile.college ?? ""))?.trim();
    if (nextCollege == null) return;
    const nextYear = window.prompt("Year of study (1-5)", String(profile.year_of_study ?? ""))?.trim();
    if (nextYear == null) return;
    const nextMajor = window.prompt("Major / Branch", String((profile as { major?: string }).major ?? ""))?.trim();
    if (nextMajor == null) return;

    const ok = await saveProfileFields({
      full_name: nextName,
      college: nextCollege,
      year_of_study: nextYear,
      major: nextMajor,
    });
    if (ok) window.location.reload();
  });

  // Change email and password now work from settings.
  getRowByTitle("Change email")?.addEventListener("click", async () => {
    const nextEmail = window.prompt("New email");
    if (!nextEmail) return;
    const { error: e } = await sb.auth.updateUser({ email: nextEmail.trim() });
    if (e) {
      alert(e.message);
      return;
    }
    alert("Verification email sent to new address.");
  });

  getRowByTitle("Change password")?.addEventListener("click", async () => {
    const p1 = window.prompt("New password (min 8 chars)");
    if (!p1 || p1.length < 8) return;
    const p2 = window.prompt("Confirm new password");
    if (p1 !== p2) {
      alert("Passwords do not match.");
      return;
    }
    const { error: e } = await sb.auth.updateUser({ password: p1 });
    if (e) {
      alert(e.message);
      return;
    }
    alert("Password updated.");
  });

  // Who can DM me selector persists.
  const dmValueEl = document.getElementById("campx-dm-visibility-value");
  const dmRow = getRowByTitle("Who can DM me");
  const dmVisibility = String(profileSettings.dm_visibility || "everyone");
  if (dmValueEl) dmValueEl.textContent = dmVisibility === "followers" ? "Followers only" : "Everyone";
  dmRow?.addEventListener("click", async () => {
    const next = String(profileSettings.dm_visibility || "everyone") === "everyone" ? "followers" : "everyone";
    profileSettings.dm_visibility = next;
    if (dmValueEl) dmValueEl.textContent = next === "followers" ? "Followers only" : "Everyone";
    await sb
      .from("profiles")
      .update({ settings_json: profileSettings, updated_at: new Date().toISOString() })
      .eq("id", user.id);
  });

  // Wire previously dummy actions.
  document.querySelector(".upgrade-banner")?.addEventListener("click", () => {
    window.location.href = "/billing";
  });
  getRowByTitle("Current plan")?.addEventListener("click", () => {
    window.location.href = "/billing";
  });
  getRowByTitle("Contact support")?.addEventListener("click", () => {
    window.location.href = "/contact";
  });
  getRowByTitle("Request a feature")?.addEventListener("click", () => {
    window.location.href = "mailto:support@campx.social?subject=Feature%20Request";
  });
  getRowByTitle("Report a bug")?.addEventListener("click", () => {
    window.location.href = "mailto:support@campx.social?subject=Bug%20Report";
  });
  getRowByTitle("Delete account")?.addEventListener("click", () => {
    alert("For safety, account deletion is currently handled via support.");
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
