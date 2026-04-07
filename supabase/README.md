# CampX Supabase

## Migrations

Apply with the Supabase CLI:

```bash
supabase db push
```

## Edge Functions (Razorpay)

Deploy:

```bash
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-webhook
```

### Secrets

Set in the Supabase project (Dashboard → Edge Functions → Secrets) or via CLI:

| Secret | Purpose |
|--------|---------|
| `RAZORPAY_KEY_ID` | Razorpay Key ID (create-order) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret (create-order) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret from Razorpay dashboard |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically in Edge Functions.

### Webhook URL

Point Razorpay webhooks to:

`https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`

Enable `payment.captured` (and others as needed).

## Seeds

Optional SQL seeds live under `supabase/seed/` (e.g. `20260408_plans.sql` for default plans). Run manually in the SQL editor if desired.
