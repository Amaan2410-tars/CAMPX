import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "founder" | "admin" | "moderator" | "ambassador" | "user";

export async function fetchUserRoles(
  sb: SupabaseClient,
): Promise<{ roles: AppRole[]; error: Error | null }> {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { roles: [], error: new Error("Not signed in") };

  const { data, error } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  if (error) return { roles: [], error: new Error(error.message) };
  const roles = (data ?? [])
    .map((r) => r.role as string)
    .filter((r): r is AppRole =>
      ["founder", "admin", "moderator", "ambassador", "user"].includes(r),
    );
  return { roles, error: null };
}

export function hasRole(roles: AppRole[], ...need: AppRole[]): boolean {
  return need.some((r) => roles.includes(r));
}

export function isStaff(roles: AppRole[]): boolean {
  return hasRole(roles, "founder", "admin", "moderator");
}
