import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";

function safeNextUrl(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  if (raw.includes("//") || raw.includes("\\") || raw.includes("@")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.includes("/onboarding") || raw.includes("campx-onboarding.html")) return null;
  return raw;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const url = new URL(window.location.href);
    return safeNextUrl(url.searchParams.get("next")) ?? "/settings";
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setErr("Supabase is not configured.");
      setReady(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await sb.auth.exchangeCodeForSession(code);
          if (error) throw error;
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.toString());
        }

        // Ensure session is available (covers hash-based flows too).
        const { data, error } = await sb.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("No active session. Please try verifying again.");

        // OTP verification is the only activation step for now:
        // if the user's email is confirmed, mark the profile as activated/verified (and upgrade off Basic).
        const { data: userData } = await sb.auth.getUser();
        const user = userData.user;
        if (user?.email_confirmed_at) {
          const { data: profile } = await sb
            .from("profiles")
            .select("tier, verification_status")
            .eq("id", user.id)
            .maybeSingle();

          const tier = String((profile as any)?.tier ?? "basic");
          const nextTier = tier === "basic" ? "verified" : tier;
          await sb
            .from("profiles")
            .upsert(
              {
                id: user.id,
                tier: nextTier,
                verification_status: "email_verified",
                updated_at: new Date().toISOString(),
              } as any,
              { onConflict: "id" },
            );
        }

        if (!cancelled) navigate(nextPath, { replace: true });
      } catch (e: any) {
        if (!cancelled) {
          const msg = String(e?.message ?? "");
          setErr(msg || "Authentication callback failed.");
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#13131a] border border-white/10 rounded-2xl p-6">
        <h1 className="text-xl font-bold">Finishing sign-in…</h1>
        {!ready ? (
          <div className="mt-4 text-sm text-white/60">Please wait.</div>
        ) : (
          <div className="mt-4 text-sm text-red-300">{err}</div>
        )}
      </div>
    </div>
  );
}

