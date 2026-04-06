import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const SIGN_IN_PATH = "/campx-onboarding.html";

function normalizedPath(): string {
  let p = window.location.pathname || "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function shouldSkipGate(): boolean {
  const p = normalizedPath();
  if (p === "/" || p === "/index.html") return true;
  if (p.endsWith(SIGN_IN_PATH) || p.includes("campx-onboarding.html")) return true;
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

  if (session) return;

  const next = safeNextUrl(
    normalizedPath() + window.location.search + window.location.hash,
  );
  const target =
    next != null
      ? `${SIGN_IN_PATH}?next=${encodeURIComponent(next)}`
      : SIGN_IN_PATH;

  window.location.replace(target);
}

void main();
