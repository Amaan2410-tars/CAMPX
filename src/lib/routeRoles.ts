import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchUserRoles, hasRole, isStaff, type AppRole } from "@/lib/rbac";

/** Pathnames after normalization (no trailing slash). */
const FOUNDER_PATHS = new Set(["/founder-dashboard"]);
const AMBASSADOR_PATHS = new Set(["/ambassador-dashboard"]);
const STAFF_PATHS = new Set(["/moderation"]);

export async function assertRouteRoleAccess(
  sb: SupabaseClient,
  pathname: string,
): Promise<{ ok: true; roles: AppRole[] } | { ok: false; redirectTo: string }> {
  const { roles, error } = await fetchUserRoles(sb);
  if (error) {
    return { ok: false, redirectTo: "/feed" };
  }

  if (FOUNDER_PATHS.has(pathname)) {
    if (!hasRole(roles, "founder", "admin")) {
      return { ok: false, redirectTo: "/feed" };
    }
    return { ok: true, roles };
  }

  if (AMBASSADOR_PATHS.has(pathname)) {
    if (!hasRole(roles, "ambassador", "founder", "admin")) {
      return { ok: false, redirectTo: "/feed" };
    }
    return { ok: true, roles };
  }

  if (STAFF_PATHS.has(pathname)) {
    if (!isStaff(roles)) {
      return { ok: false, redirectTo: "/feed" };
    }
    return { ok: true, roles };
  }

  return { ok: true, roles };
}
