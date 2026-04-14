import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const isAdminHost = (window.location.hostname || "").toLowerCase().includes("admin");
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const isStrongPassword = (p: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setErr("Supabase is not configured.");
      setReady(true);
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        setHasSession(Boolean(data.session));
      } catch {
        if (!cancelled) setHasSession(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void sync();

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") setHasSession(Boolean(session));
      if (event === "SIGNED_IN") setHasSession(Boolean(session));
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!isStrongPassword(pw)) {
      setErr("Password must include uppercase, lowercase, number, and symbol (min 8).");
      return;
    }
    if (pw !== pw2) {
      setErr("Passwords do not match.");
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setErr("Supabase is not configured.");
      return;
    }

    try {
      setSaving(true);
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) throw error;
      setOk("Password updated.");
    } catch (e2: any) {
      setErr(e2?.message ?? "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#13131a] border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-white/60 mt-1">
          Set a new password for your account.
        </p>

        {!ready ? (
          <div className="mt-6 text-sm text-white/60">Loading…</div>
        ) : !hasSession ? (
          <div className="mt-6 text-sm text-red-300">
            This reset link is invalid or has expired. Please request a new password reset email.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs text-white/60 mb-1">New password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full bg-[#0b0b10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                placeholder="Uppercase + lowercase + number + symbol"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Confirm password</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                className="w-full bg-[#0b0b10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
                placeholder="Re-enter password"
              />
            </div>

            {err && <div className="text-sm text-red-300">{err}</div>}
            {ok && <div className="text-sm text-emerald-300">{ok}</div>}

            <button
              disabled={saving}
              type="submit"
              className="w-full px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Update password"}
            </button>

            {ok && (
              <button
                type="button"
                onClick={() => navigate(isAdminHost ? "/auth/login" : "/onboarding")}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg transition"
              >
                Go to login
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

