import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

async function verifySignature(
  body: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const digest = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digest === signature;
}

type PaymentEntity = {
  id?: string;
  amount?: number;
  currency?: string;
  order_id?: string;
  notes?: Record<string, string>;
};

type WebhookPayload = {
  event?: string;
  payload?: { payment?: { entity?: PaymentEntity } };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const signature = req.headers.get("x-razorpay-signature");

    if (webhookSecret && !(await verifySignature(rawBody, signature, webhookSecret))) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;
    const payEnt = payload.payload?.payment?.entity;
    const eventName = payload.event ?? "unknown";
    const payId = payEnt?.id ?? "none";
    const eventId = `${eventName}_${payId}`.slice(0, 200);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { error: insErr } = await admin.from("billing_events").insert({
      razorpay_event_id: eventId,
      payload: payload as unknown as Record<string, unknown>,
    });

    if (insErr?.code === "23505") {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (eventName === "payment.captured" && payEnt?.id) {
      const notes = payEnt.notes ?? {};
      const userId = notes.user_id;
      const planId = notes.plan_id;
      const amountCents = typeof payEnt.amount === "number" ? payEnt.amount : 0;
      const currency = payEnt.currency ?? "INR";

      if (userId && /^[0-9a-f-]{36}$/i.test(userId)) {
        await admin.from("payments").upsert(
          {
            user_id: userId,
            razorpay_payment_id: payEnt.id,
            razorpay_order_id: payEnt.order_id ?? null,
            amount_cents: amountCents,
            currency,
            status: "captured",
          },
          { onConflict: "razorpay_payment_id" },
        );

        if (planId && /^[0-9a-f-]{36}$/i.test(planId)) {
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan_id: planId,
              status: "active",
              current_period_end: periodEnd.toISOString(),
            },
            { onConflict: "user_id" },
          );
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
