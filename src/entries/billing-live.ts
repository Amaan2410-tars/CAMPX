import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function getAccessToken(sb: ReturnType<typeof getSupabase>): Promise<string | null> {
  const { data: sessionData } = await sb.auth.getSession();
  if (sessionData.session?.access_token) return sessionData.session.access_token;
  const { data: refreshed } = await sb.auth.refreshSession();
  return refreshed.session?.access_token ?? null;
}

async function main(): Promise<void> {
  const host = document.getElementById("campx-billing-live");
  if (!host) return;
  const search = new URLSearchParams(window.location.search);
  const requestedPlan = (search.get("plan") || "").trim().toLowerCase();
  const fromSettings = search.get("src") === "settings";
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
  const resolveRequestedPlanId = (): string | null => {
    if (!plans?.length || !requestedPlan) return null;
    const bySlug = plans.find((p) => String(p.slug || "").toLowerCase() === requestedPlan);
    if (bySlug) return bySlug.id;
    const byId = plans.find((p) => String(p.id).toLowerCase() === requestedPlan);
    if (byId) return byId.id;
    const byName = plans.find((p) => String(p.name || "").toLowerCase().includes(requestedPlan));
    return byName?.id ?? null;
  };
  const selectedPlanId = resolveRequestedPlanId();
  const selectedPlan =
    plans?.find((p) => p.id === selectedPlanId) ??
    null;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const fnBase = supabaseUrl ? `${supabaseUrl}/functions/v1` : "";

  const statusElId = "campx-billing-status";
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
      <div style="font-weight:600;margin-bottom:8px;">Step 2 of 2: billing</div>
      ${
        fromSettings
          ? `<div style="font-size:12px;color:#a5b4fc;margin-bottom:10px;">You came from Settings. Select a plan and continue to Razorpay.</div>`
          : ""
      }
      <div style="font-size:12px;color:#fbbf24;margin-bottom:10px;">Razorpay account note: if KYC is still under review, live card/UPI capture may fail until Razorpay activates your account.</div>
      ${errMsg ? `<p style="color:#f87171;">${escapeHtml(errMsg)}</p>` : ""}
      ${
        plans?.length
          ? selectedPlan
            ? `<div style="padding:12px;border:1px solid rgba(99,102,241,0.45);border-radius:12px;background:rgba(99,102,241,0.08);">
                <div style="font-size:12px;color:#a5b4fc;margin-bottom:6px;">Selected plan</div>
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                  <div>
                    <div style="font-weight:700;font-size:16px;">${escapeHtml(selectedPlan.name)}</div>
                    <div style="font-size:13px;color:#9ca3af;">${(selectedPlan.price_cents / 100).toFixed(2)} ${escapeHtml(selectedPlan.currency)} / ${escapeHtml(selectedPlan.interval)}</div>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <a href="/tiers" style="padding:6px 10px;font-size:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.18);color:#dbe1ff;text-decoration:none;">Change plan</a>
                    ${
                      user && fnBase
                        ? `<button type="button" class="campx-pay-btn" data-plan="${selectedPlan.id}" style="padding:8px 12px;font-size:12px;border-radius:8px;border:none;background:#6366f1;color:#fff;cursor:pointer;">Proceed to Razorpay</button>`
                        : `<a href="/auth/login?next=%2Fbilling%3Fplan%3D${encodeURIComponent(String(selectedPlan.slug || selectedPlan.id))}" style="padding:8px 12px;font-size:12px;border-radius:8px;border:none;background:#6366f1;color:#fff;text-decoration:none;">Sign in to continue</a>`
                    }
                  </div>
                </div>
              </div>`
            : `<div style="padding:10px;border:1px solid rgba(248,113,113,0.35);border-radius:10px;background:rgba(248,113,113,0.08);color:#fecaca;">
                Selected plan was not found. Please choose a plan first.
                <div style="margin-top:10px;"><a href="/tiers" style="color:#dbe1ff;">Go to plan selection</a></div>
              </div>`
          : "<p style=\"color:#9ca3af;\">Seed the <code>plans</code> table in Supabase.</p>"
      }
      ${
        !selectedPlan && plans?.length
          ? `<ul style="padding-left:0;list-style:none;display:grid;gap:8px;margin-top:12px;">${plans
              .map(
                (p) =>
                  `<li style="padding:10px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;">
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                      <div>
                        <div style="font-weight:600;">${escapeHtml(p.name)}</div>
                        <div style="font-size:13px;color:#9ca3af;">${(p.price_cents / 100).toFixed(2)} ${escapeHtml(p.currency)} / ${escapeHtml(p.interval)}</div>
                      </div>
                      <a href="/billing?plan=${encodeURIComponent(String(p.slug || p.id))}" style="padding:6px 10px;font-size:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.18);color:#dbe1ff;text-decoration:none;">Select</a>
                    </div>
                  </li>`,
              )
              .join("")}</ul>`
          : ""
      }
      <p style="font-size:12px;color:#64748b;margin-top:8px;">Production: deploy Edge Functions <code>razorpay-create-order</code> and <code>razorpay-webhook</code>, then set secrets.</p>
    </div>
    <div id="${statusElId}" class="box" style="display:none;"></div>
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

  const statusEl = document.getElementById(statusElId) as HTMLDivElement | null;
  function showStatus(html: string, kind: "info" | "ok" | "err" = "info"): void {
    if (!statusEl) return;
    const border =
      kind === "ok"
        ? "rgba(74,222,128,0.35)"
        : kind === "err"
          ? "rgba(248,113,113,0.35)"
          : "rgba(99,102,241,0.28)";
    const bg =
      kind === "ok"
        ? "rgba(74,222,128,0.08)"
        : kind === "err"
          ? "rgba(248,113,113,0.08)"
          : "rgba(99,102,241,0.08)";
    statusEl.style.display = "block";
    statusEl.style.borderColor = border;
    statusEl.style.background = bg;
    statusEl.innerHTML = html;
  }

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
      const btnEl = btn as HTMLButtonElement;
      const prevText = btnEl.textContent;
      btnEl.disabled = true;
      btnEl.textContent = "Starting…";
      showStatus(
        `<div style="font-weight:600;margin-bottom:6px;">Starting checkout</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">Opening Razorpay. After payment, we’ll verify your subscription status.</div>`,
        "info",
      );
      let token = await getAccessToken(sb);
      if (!token) {
        btnEl.disabled = false;
        btnEl.textContent = prevText || "Pay (Razorpay)";
        showStatus(
          `<div style="font-weight:600;margin-bottom:6px;">Please sign in again</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">Your session is missing. Reload and sign in.</div>`,
          "err",
        );
        return;
      }
      let res = await fetch(`${fnBase}/razorpay-create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
        body: JSON.stringify({ plan_id: planId }),
      });
      if (res.status === 401) {
        const { data: refreshed } = await sb.auth.refreshSession();
        token = refreshed.session?.access_token ?? null;
        if (token) {
          res = await fetch(`${fnBase}/razorpay-create-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            },
            body: JSON.stringify({ plan_id: planId }),
          });
        }
      }
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
        showStatus(
          `<div style="font-weight:600;margin-bottom:6px;">Payments not configured</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">Razorpay keys are not configured on the server. Plan: <strong>${escapeHtml(json.plan?.name ?? planId)}</strong>. Set <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> on Edge Functions.</div>`,
          "err",
        );
        btnEl.disabled = false;
        btnEl.textContent = prevText || "Pay (Razorpay)";
        return;
      }
      if (json.error) {
        showStatus(
          `<div style="font-weight:600;margin-bottom:6px;">Checkout error</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">${escapeHtml(json.error)}</div>`,
          "err",
        );
        btnEl.disabled = false;
        btnEl.textContent = prevText || "Pay (Razorpay)";
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
            prefill: {
              email: user.email ?? "",
            },
            notes: {
              user_id: user.id,
              plan_id: planId,
            },
            handler: async () => {
              showStatus(
                `<div style="font-weight:600;margin-bottom:6px;">Payment received</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">Finalizing your subscription… (this may take a few seconds)</div>`,
                "info",
              );
              // Webhook drives the final subscription update. Poll briefly for UX.
              const start = Date.now();
              while (Date.now() - start < 15000) {
                const { data: latest } = await sb
                  .from("subscriptions")
                  .select("status, current_period_end, plan_id")
                  .eq("user_id", user.id)
                  .maybeSingle();
                if (latest?.status === "active") {
                  showStatus(
                    `<div style="font-weight:600;margin-bottom:6px;">Subscription active</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">You’re upgraded. Current period ends: <strong>${escapeHtml(new Date(latest.current_period_end).toLocaleString())}</strong>.</div>`,
                    "ok",
                  );
                  btnEl.disabled = false;
                  btnEl.textContent = prevText || "Pay (Razorpay)";
                  return;
                }
                await sleep(1200);
              }
              showStatus(
                `<div style="font-weight:600;margin-bottom:6px;">Payment captured</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">We’re still waiting for backend confirmation. If this persists, refresh this page or contact support with your receipt.</div>`,
                "info",
              );
              btnEl.disabled = false;
              btnEl.textContent = prevText || "Pay (Razorpay)";
            },
          });
          rzp.open();
        } catch (e) {
          showStatus(
            `<div style="font-weight:600;margin-bottom:6px;">Checkout failed</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">${escapeHtml(String(e))}</div>`,
            "err",
          );
          btnEl.disabled = false;
          btnEl.textContent = prevText || "Pay (Razorpay)";
        }
      } else {
        showStatus(
          `<div style="font-weight:600;margin-bottom:6px;">Payment init failed</div><div style="color:#9ca3af;font-size:13px;line-height:1.6;">Deploy the Edge Function and configure Razorpay keys.</div>`,
          "err",
        );
        btnEl.disabled = false;
        btnEl.textContent = prevText || "Pay (Razorpay)";
      }
    });
  });
}

void main();
