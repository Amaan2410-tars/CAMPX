# CampX production QA checklist

Run before tagging a production release.

## Build & tests

- `npm run build` — Vite production build succeeds
- `npm run test` — Vitest unit tests pass
- `npm run lint` — ESLint clean

## Supabase

- Apply migrations: `supabase db push` (or equivalent CI)
- **RLS**: confirm staff-only RPCs (`founder_dashboard_metrics`, moderation paths) behave for non-privileged users
- **Realtime** (Dashboard → Database → Replication): enable for `posts`, `post_likes`, `post_comments`, `post_reposts`, `messages` as needed for live feeds/DMs
- **Seeds** (optional): run `supabase/seed/20260408_plans.sql` and populate `analytics_daily` / `user_roles` for dashboard demos

## Edge Functions

- Deploy `razorpay-create-order` and `razorpay-webhook`
- Set secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (see `supabase/README.md`)
- Configure Razorpay webhook URL to the project’s `.../functions/v1/razorpay-webhook`
- Smoke-test: create order → Razorpay Checkout opens → `payment.captured` updates `billing_events`, `payments`, `subscriptions` (with `user_id` / `plan_id` in order notes)

## App routes (Vercel)

- Clean URLs in `vercel.json` resolve to the correct HTML shells and load session gate + feature modules
- Role-gated routes (`/founder-dashboard`, `/ambassador-dashboard`, `/moderation`) redirect non-staff users to `/feed`

## Security / ops (ongoing)

- Rate limiting and abuse controls at CDN/API gateway where applicable
- Audit sensitive actions via `audit_log` (expand as product grows)
