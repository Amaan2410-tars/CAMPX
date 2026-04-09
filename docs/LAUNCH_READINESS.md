# CampX launch readiness tracker (full public)

Last updated: 2026-04-09

## Engineering baseline

- [x] `npm run build` passes
- [x] `npm run lint` passes
- [x] `npm run test` passes

## Product completeness

- [x] Core routes wired: onboarding, feed, communities, DMs, settings, profile
- [x] Staff routes wired: founder dashboard, ambassador dashboard, moderation
- [ ] Swift Zone still marked as "coming soon" and not launch-complete
- [ ] Full public launch requires no placeholder-only module in primary navigation

## Security and access control

- [x] Session gate redirects unauthenticated users to login with safe `next`
- [x] Route role checks exist for founder, ambassador, and moderation areas
- [ ] Expand automated role/access tests beyond basic helper coverage
- [ ] Perform production RLS verification in Supabase with real users/roles

## Payments and billing

- [x] Billing UI loads plans and starts checkout via Edge Function
- [x] Razorpay create-order function validates auth and plan lookup
- [ ] Confirm webhook signature verification is fail-closed in production
- [ ] Run end-to-end payment smoke test (`billing_events`, `payments`, `subscriptions`)

## Routing and deployment

- [x] `vercel.json` rewrites/redirects configured for clean route shells
- [ ] Validate host-specific redirects and role redirects in production deployment

## Ops and security controls

- [ ] Configure CDN/API rate limiting
- [ ] Define alerting and on-call thresholds for auth, billing, and webhook failures
- [ ] Validate `audit_log` usage for sensitive admin/moderation actions

## Go/No-Go rule

Status is **NO-GO** until every unchecked item above is completed and evidenced.
