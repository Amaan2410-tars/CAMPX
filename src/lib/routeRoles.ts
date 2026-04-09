import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchUserRoles, hasRole, isStaff, type AppRole } from "@/lib/rbac";

/** Pathnames after normalization (no trailing slash). */
const FOUNDER_PATHS = new Set(["/founder-dashboard"]);
const AMBASSADOR_PATHS = new Set(["/ambassador-dashboard"]);
const STAFF_PATHS = new Set(["/moderation"]);

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export async function assertRouteRoleAccess(
  sb: SupabaseClient,
  pathname: string,
): Promise<{ ok: true; roles: AppRole[] } | { ok: false; redirectTo: string }> {
  const normalizedPath = normalizePathname(pathname);
  const { roles, error } = await fetchUserRoles(sb);
  if (error) {
    return { ok: false, redirectTo: "/feed" };
  }

  if (FOUNDER_PATHS.has(normalizedPath)) {
    if (!hasRole(roles, "founder", "admin")) {
      return { ok: false, redirectTo: "/feed" };
    }
    return { ok: true, roles };
  }

  if (AMBASSADOR_PATHS.has(normalizedPath)) {
    if (!hasRole(roles, "ambassador", "founder", "admin")) {
      return { ok: false, redirectTo: "/feed" };
    }
    return { ok: true, roles };
  }

  if (STAFF_PATHS.has(normalizedPath)) {
    if (!isStaff(roles)) {
      return { ok: false, redirectTo: "/feed" };
    }
    return { ok: true, roles };
  }

  return { ok: true, roles };
}
