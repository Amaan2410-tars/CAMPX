# CampX ops launch runbook

Use this before enabling public traffic.

## 1) Vercel route verification

- Open each clean URL and verify it resolves correctly:
  - `/feed`, `/onboarding`, `/communities`, `/messages`, `/settings`, `/profile`
  - `/founder-dashboard`, `/ambassador-dashboard`, `/moderation`, `/events`, `/notifications`, `/billing`
- Verify host redirects:
  - `admin.campx.social/` -> `/auth/login?next=/founder-dashboard`
  - `college.campx.social/` -> `/auth/login?next=/ambassador-dashboard`
- Verify unauthorized users are redirected from staff routes to `/feed`.

## 2) Supabase production checks

- Run migrations on production project:
  - `supabase db push`
- Validate RLS with real test users:
  - plain user
  - ambassador
  - moderator
  - admin/founder

## 3) Payments checks (Razorpay)

- Deploy functions:
  - `supabase functions deploy razorpay-create-order`
  - `supabase functions deploy razorpay-webhook`
- Configure secrets:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
- In Razorpay dashboard, set webhook URL to:
  - `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`
- Confirm webhook events create expected DB rows:
  - `billing_events`
  - `payments`
  - `subscriptions`

## 4) Abuse controls

- Configure CDN/WAF rate limits (minimum):
  - auth endpoints
  - edge function billing endpoints
  - write-heavy content endpoints
- Add temporary deny/allow rules for abusive IPs/user agents.

## 5) Monitoring and alerting

- Configure alerts for:
  - login failure spikes
  - edge function 5xx spikes
  - webhook signature failures
  - payment captured without subscription activation > 5 minutes

## 6) Audit log verification

- Perform at least one moderation action and one founder/admin action.
- Confirm corresponding `audit_log` rows are inserted with:
  - `actor_id`
  - `action`
  - `entity`
  - `created_at`

## 7) Release gate

Public launch is **GO** only when all sections above are validated and evidence is recorded.
