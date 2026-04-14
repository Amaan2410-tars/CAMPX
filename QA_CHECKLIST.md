## CampX QA checklist (manual click-test)

Use this as a **physical test sheet**. Check every box in order on a staging/prod URL with a real Supabase project configured.

### Pre-flight
- [ ] **Supabase configured**: app loads without “Supabase is not configured”.
- [ ] **DB migrations applied**: latest migrations run (feeds, tiers, DMs E2EE, follows, profile customization, avatars storage).
- [ ] **Two test accounts available**:
  - [ ] **Account A**: `basic`
  - [ ] **Account B**: `verified` (same college as A)
  - [ ] **Account C** (optional): `verified` (different college)

---

## Public / Auth

### Onboarding (signup + OTP)
- [ ] Signup step 1 validates required fields (name/email/phone/password/DOB).
- [ ] Under-18 DOB fails (server-side) and user cannot proceed.
- [ ] College search returns results from DB (no mock list).
- [ ] OTP send works and email is received.
- [ ] OTP verify succeeds only with correct 6-digit code.
- [ ] After verify, user can enter app.

### Login / Forgot password
- [ ] Login with password works.
- [ ] Logout fully signs out (session cleared) and redirects to onboarding.
- [ ] Forgot password email flow works (reset link).

---

## Student app (core)

### App shell / navigation
- [ ] Bottom nav loads and routes correctly (no dead links).
- [ ] Basic tier sees persistent verification banner (non-dismissible).

### Explore feed
- [ ] Loads posts from verified+ users globally.
- [ ] Basic can **view** Explore feed.
- [ ] Basic cannot create/like/comment/repost (blocked server-side + UI nudge).
- [ ] Verified+ can create/like/comment/repost successfully.

### College feed
- [ ] Basic is blocked/redirected away from College feed.
- [ ] Verified+ can view College feed.
- [ ] College feed only shows posts from same `college_id`.

### Communities
- [ ] Basic cannot join communities (server-side).
- [ ] Verified can join up to 5 total; 6th fails server-side with clear error.
- [ ] Pro/Plus can join unlimited.

### DMs (E2EE)
- [ ] Basic cannot access DMs (blocked).
- [ ] Verified can open/create DM with same-college user.
- [ ] Cross-college DM only works if mutual follows (if using two-college test).
- [ ] Sending a DM stores **ciphertext only** (no plaintext body).
- [ ] Messages decrypt and display correctly on both sides.

### DM multi-device continuity
- [ ] On device 1: enable backup passphrase and confirm backup stored.
- [ ] On device 2 (fresh browser): restore using passphrase and confirm old messages decrypt.

### Profile + Settings
- [ ] Profile shows real name/college/major/year/tier (no hardcoded values).
- [ ] Settings card shows real data and email.
- [ ] Settings → Change email triggers Supabase email change verification.
- [ ] Settings → Change password updates password (>=8 chars).
- [ ] Settings → Edit profile:
  - [ ] Update bio saves and appears on Profile.
  - [ ] Theme saves and persists after refresh.
  - [ ] Avatar upload succeeds and appears on Profile after save/refresh.

---

## Billing / Plans
- [ ] User Tiers page shows plans from DB when Supabase is configured.
- [ ] If plans table is empty/unreachable, page still renders safely.

---

## Admin portal

### Admin authentication
- [ ] Admin login rejects non-staff users.
- [ ] Admin login allows staff users with `user_roles` = `admin`/`founder`/`moderator`.

### Admin pages
- [ ] Dashboard loads live counts (or safe empty states).
- [ ] Colleges:
  - [ ] List loads from `colleges`.
  - [ ] Add College creates row.
  - [ ] Optional domain is inserted into `college_email_domains`.
- [ ] Communities:
  - [ ] Pending requests list loads from `community_creation_requests`.
  - [ ] Approve/Reject updates request status.
- [ ] Moderation:
  - [ ] Report queue loads from `reports`.
  - [ ] Actions update `reports.status` and write `moderation_actions`.
- [ ] Subscriptions shows data from `subscriptions` + `plans` + profiles.

---

## Negative tests (must fail)
- [ ] Basic tries to follow someone → blocked (server-side).
- [ ] Basic tries to DM → blocked (server-side).
- [ ] Basic tries to post/like/comment/repost → blocked (server-side).
- [ ] Verified tries to view cross-college College feed content → not visible.

