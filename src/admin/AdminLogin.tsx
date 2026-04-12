import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { triggerGlobalToast } from "../components/AppLayout"; // Reuse toast if available, or we can use Sonner

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // Mock login for demo
      if (email.includes("admin")) {
        localStorage.setItem("campx_admin_role", "admin");
        navigate("/admin");
      } else if (email.includes("founder")) {
        localStorage.setItem("campx_admin_role", "founder");
        navigate("/admin");
      } else {
        alert("Invalid mock credentials. Use 'admin@campx.app' or 'founder@campx.app'");
      }
      setLoading(false);
      return;
    }

    const sb = getSupabase();
    if (!sb) return;

    const { data: authData, error } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "founder") {
      navigate("/admin");
    } else {
      await sb.auth.signOut();
      alert("Unauthorized: You don't have admin access.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] text-[#f0f0f8]">
      <div className="w-full max-w-md rounded-2xl bg-[#13131a] p-8 shadow-2xl border border-[#1c1c27]">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-4 flex items-center justify-center">
            <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
              <path d="M8 36 L22 8 L36 36" stroke="#6c63ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M13 27 L31 27" stroke="#6c63ff" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <circle cx="32" cy="14" r="5" fill="#6c63ff" opacity="0.9"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to manage CampX</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400">Work Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-lg bg-[#1c1c27] border border-gray-800 px-4 py-3 text-[#f0f0f8] placeholder-gray-500 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              placeholder="name@campx.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-lg bg-[#1c1c27] border border-gray-800 px-4 py-3 text-[#f0f0f8] placeholder-gray-500 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#6c63ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5b54e5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:ring-offset-2 focus:ring-offset-[#13131a] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>
        
        {/* Helper Note for Demo */}
        {!isSupabaseConfigured() && (
          <div className="mt-6 text-center text-xs text-gray-500">
            Demo mode active. Use 'admin@' or 'founder@' email to login.
          </div>
        )}
      </div>
    </div>
  );
}
