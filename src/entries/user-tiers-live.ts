import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

async function main(): Promise<void> {
  const host = document.getElementById("campx-plan-selector");
  if (!host) return;

  if (!isSupabaseConfigured()) {
    host.innerHTML = `
      <div class="plan">
        <h2>Billing is not configured</h2>
        <div class="meta">Connect Supabase env vars to load live plans.</div>
      </div>
    `;
    return;
  }

  const sb = getSupabase();
  if (!sb) return;

  const { data: plans, error } = await sb
    .from("plans")
    .select("id, slug, name, price_cents, currency, interval, active")
    .eq("active", true)
    .order("price_cents", { ascending: true });

  if (error) {
    host.innerHTML = `
      <div class="plan">
        <h2>Could not load plans</h2>
        <div class="meta">${escapeHtml(error.message)}</div>
      </div>
    `;
    return;
  }

  if (!plans?.length) {
    host.innerHTML = `
      <div class="plan">
        <h2>No plans available</h2>
        <div class="meta">Seed the plans table, then reload this page.</div>
      </div>
    `;
    return;
  }

  host.innerHTML = plans
    .map((p) => {
      const slug = String(p.slug || p.id);
      const lower = String(p.name || "").toLowerCase();
      const isPlus = lower.includes("plus");
      const isPro = lower.includes("pro");
      const badge = isPlus ? "Most popular" : isPro ? "Recommended" : "Standard";
      const features = isPlus
        ? "Everything in Pro, priority support, and early access modules."
        : isPro
          ? "Premium access, higher limits, and creator features."
          : "Core access for everyday campus use.";
      return `
        <div class="plan">
          <span class="pill">${escapeHtml(badge)}</span>
          <h2>${escapeHtml(String(p.name || "Plan"))}</h2>
          <div class="price">${escapeHtml(formatMoney(Number(p.price_cents || 0), String(p.currency || "INR")))}</div>
          <div class="meta">per ${escapeHtml(String(p.interval || "month"))}</div>
          <div class="feat">${escapeHtml(features)}</div>
          <a class="btn" href="/billing?plan=${encodeURIComponent(slug)}&src=tiers">Continue to billing</a>
        </div>
      `;
    })
    .join("");
}

void main();
