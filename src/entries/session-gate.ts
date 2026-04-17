import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { assertRouteRoleAccess } from "@/lib/routeRoles";

const SIGN_IN_PATH = "/auth/login";

function hostDefaultNextPath(): string {
  const host = (window.location.hostname || "").toLowerCase();
  if (host === "admin.campx.social" || host.startsWith("admin.")) return "/founder-dashboard";
  if (host === "college.campx.social" || host.startsWith("college.")) return "/ambassador-dashboard";
  return "/feed";
}

function normalizedPath(): string {
  let p = window.location.pathname || "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function shouldSkipGate(): boolean {
  const p = normalizedPath();
  if (p === "/" || p === "/index.html") return true;
  if (p === "/auth/login") return true;
  if (p === "/auth/callback") return true;
  if (p === "/onboarding") return true;
  if (p.endsWith(SIGN_IN_PATH) || p.includes("campx-onboarding.html")) return true;
  // Allow Supabase email links to be processed by the SPA before any redirects.
  if (window.location.search.includes("code=")) return true;
  if (window.location.hash.includes("access_token")) return true;
  return false;
}

function safeNextUrl(raw: string): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  if (raw.includes("//") || raw.includes("\\") || raw.includes("@")) return null;
  if (raw.startsWith("//")) return null;
  return raw;
}

async function main(): Promise<void> {
  if (shouldSkipGate()) return;
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { session },
  } = await sb.auth.getSession();

  if (session) {
    const roleCheck = await assertRouteRoleAccess(sb, normalizedPath());
    if (!roleCheck.ok) {
      window.location.replace(roleCheck.redirectTo);
      return;
    }
    return;
  }

  const next = safeNextUrl(
    normalizedPath() + window.location.search + window.location.hash,
  );
  const defaultNext = hostDefaultNextPath();
  const target = `${SIGN_IN_PATH}?next=${encodeURIComponent(next ?? defaultNext)}`;

  window.location.replace(target);
}

void main();
