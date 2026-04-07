import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main(): Promise<void> {
  const host = document.getElementById("campx-billing-live");
  if (!host) return;
  if (!isSupabaseConfigured()) {
    host.textContent = "";
    return;
  }
  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data: plans, error: e1 } = await sb
    .from("plans")
    .select("id, slug, name, price_cents, currency, interval, active")
    .eq("active", true);

  const { data: sub } = user
    ? await sb
        .from("subscriptions")
        .select("status, current_period_end, plan_id")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: payments } = user
    ? await sb
        .from("payments")
        .select("amount_cents, currency, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  let errMsg = "";
  if (e1) errMsg = e1.message;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const fnBase = supabaseUrl ? `${supabaseUrl}/functions/v1` : "";

  host.innerHTML = `
    <div class="box">
      <div style="font-weight:600;margin-bottom:8px;">Your subscription</div>
      ${
        user
          ? sub
            ? `<div>Status: <strong>${escapeHtml(sub.status)}</strong></div>`
            : "<div>No active subscription row.</div>"
          : "<div>Sign in to view billing.</div>"
      }
    </div>
    <div class="box">
      <div style="font-weight:600;margin-bottom:8px;">Plans</div>
      ${errMsg ? `<p style="color:#f87171;">${escapeHtml(errMsg)}</p>` : ""}
      ${
        plans?.length
          ? `<ul style="padding-left:18px;">${plans
              .map(
                (p) =>
                  `<li>${escapeHtml(p.name)} — ${(p.price_cents / 100).toFixed(2)} ${escapeHtml(p.currency)} / ${escapeHtml(p.interval)} 
            ${user && fnBase ? `<button type="button" class="campx-pay-btn" data-plan="${p.id}" style="margin-left:8px;padding:4px 10px;font-size:12px;border-radius:6px;border:none;background:#6366f1;color:#fff;cursor:pointer;">Pay (Razorpay)</button>` : ""}</li>`,
              )
              .join("")}</ul>`
          : "<p style=\"color:#9ca3af;\">Seed the <code>plans</code> table in Supabase.</p>"
      }
      <p style="font-size:12px;color:#64748b;margin-top:8px;">Production: deploy Edge Functions <code>razorpay-create-order</code> and <code>razorpay-webhook</code>, then set secrets.</p>
    </div>
    <div class="box">
      <div style="font-weight:600;margin-bottom:8px;">Recent payments</div>
      ${
        payments?.length
          ? `<ul style="padding-left:18px;font-size:13px;">${payments
              .map(
                (p) =>
                  `<li>${escapeHtml(p.status)} — ${(p.amount_cents / 100).toFixed(2)} ${escapeHtml(p.currency)} — ${new Date(p.created_at).toLocaleString()}</li>`,
              )
              .join("")}</ul>`
          : "<p style=\"color:#9ca3af;\">No payments yet.</p>"
      }
    </div>
    <p><a href="/feed">Back to app</a></p>`;

  function loadRazorpay(): Promise<new (options: Record<string, unknown>) => { open: () => void }> {
    return new Promise((resolve, reject) => {
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
        resolve((window as unknown as { Razorpay: new (o: Record<string, unknown>) => { open: () => void } }).Razorpay);
        return;
      }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => {
        const R = (window as unknown as { Razorpay?: new (o: Record<string, unknown>) => { open: () => void } }).Razorpay;
        if (R) resolve(R);
        else reject(new Error("Razorpay not available"));
      };
      s.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.head.appendChild(s);
    });
  }

  host.querySelectorAll(".campx-pay-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const planId = (btn as HTMLButtonElement).dataset.plan;
      if (!planId || !user || !fnBase) return;
      const { data: sessionData } = await sb.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const res = await fetch(`${fnBase}/razorpay-create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
        body: JSON.stringify({ plan_id: planId }),
      });
      const json = (await res.json()) as {
        demo?: boolean;
        error?: string;
        key_id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        name?: string;
        plan?: { name?: string };
      };
      if (json.demo) {
        alert(
          `Razorpay keys are not configured on the server. Plan: ${json.plan?.name ?? planId}. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for Edge Functions.`,
        );
        return;
      }
      if (json.error) {
        alert(json.error);
        return;
      }
      if (json.key_id && json.order_id && json.amount != null) {
        try {
          const Razorpay = await loadRazorpay();
          const rzp = new Razorpay({
            key: json.key_id,
            amount: json.amount,
            currency: json.currency ?? "INR",
            name: "CampX",
            description: json.name ?? "Subscription",
            order_id: json.order_id,
            handler: () => {
              alert("Payment completed — check billing and webhook logs.");
            },
          });
          rzp.open();
        } catch (e) {
          alert(String(e));
        }
      } else {
        alert("Payment init failed — deploy Edge Function and configure Razorpay.");
      }
    });
  });
}

void main();
