import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    goTo: (id: string, forward?: boolean) => void;
    checkEmailType: (v: string) => void;
    togglePass: (inputId: string, btn: HTMLElement) => void;
    showToast: (msg: string) => void;
    selectProgram: (which: string) => void;
    handleSignupStep1: () => void;
    handleSignupStep2: () => void;
    handleSignupStep3: () => Promise<void>;
    handleResend: () => Promise<void>;
    handleVerifyCode: () => Promise<void>;
    handleLogin: () => Promise<void>;
    handleForgotSubmit: () => Promise<void>;
    handleRecoverySubmit: () => Promise<void>;
    enterAppAfterVerify: () => void;
  }
}

const SCREEN_ORDER = [
  "splash",
  "signup",
  "signup2",
  "signup3",
  "verify-email",
  "verify-code",
  "verified-welcome",
  "login",
  "forgot",
  "forgot-sent",
  "recovery",
] as const;

type ScreenId = (typeof SCREEN_ORDER)[number] | string;

let current: ScreenId = "splash";
let signupProgram: "ug" | "pg" = "ug";
let resendSeconds = 0;
let resendTimer: ReturnType<typeof setInterval> | null = null;

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function val(id: string): string {
  return el<HTMLInputElement>(id)?.value?.trim() ?? "";
}

function screenIndex(id: string): number {
  const i = SCREEN_ORDER.indexOf(id as (typeof SCREEN_ORDER)[number]);
  return i === -1 ? 0 : i;
}

function goTo(id: string, forward?: boolean): void {
  const prev = el(current);
  const next = el(id);
  if (!next || id === current) return;

  let isForward: boolean;
  if (typeof forward === "boolean") {
    isForward = forward;
  } else {
    isForward = screenIndex(id) > screenIndex(current);
  }

  prev?.classList.remove("active");
  prev?.classList.add(isForward ? "hidden-left" : "hidden-right");

  next.classList.remove("hidden-left", "hidden-right");
  next.classList.add("active");

  current = id;

  if (id === "verify-code") {
    setupOtpInputs();
    clearOtp();
    document.querySelector<HTMLInputElement>('.otp-cell[data-otp="0"]')?.focus();
  }
}

function showToast(msg: string): void {
  const t = el("toast");
  const m = el("toast-msg");
  if (!t || !m) return;
  m.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isCollegeEmail(val: string): boolean {
  const v = (val || "").toLowerCase();
  return [".edu", ".ac.in", ".edu.in", ".ac.uk", ".edu.au"].some((d) => v.includes(d));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function authRedirectBase(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

async function getClient(): Promise<SupabaseClient | null> {
  const sb = getSupabase();
  if (!sb) {
    showToast("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — add them to .env and restart.");
    return null;
  }
  return sb;
}

async function syncEmailVerifiedStatus(sb: SupabaseClient, user: { id: string; email_confirmed_at?: string | null }): Promise<void> {
  if (!user.email_confirmed_at) return;
  await sb
    .from("profiles")
    .update({ verification_status: "email_verified" })
    .eq("id", user.id)
    .eq("verification_status", "unverified");
}

function renderSignupSummary(): void {
  const name = val("signup-name");
  const email = val("signup-email");
  const college = val("college-name");
  const yearSel = el<HTMLSelectElement>("study-year");
  const yearText = yearSel?.options[yearSel.selectedIndex]?.text ?? "";
  const major = val("major");
  const prog = signupProgram === "pg" ? "Postgraduate (PG)" : "Undergraduate (UG)";

  const card = el("summary-card");
  if (!card) return;

  const rows: [string, string][] = [
    ["Name", escapeHtml(name)],
    ["Email", escapeHtml(email)],
    ["College", escapeHtml(college)],
    ["Program", escapeHtml(prog)],
    ["Year", escapeHtml(yearText)],
  ];
  if (major) rows.push(["Branch / major", escapeHtml(major)]);

  card.innerHTML = rows
    .map(
      ([k, v]) =>
        `<div class="summary-row"><span class="summary-k">${k}</span><span class="summary-v">${v}</span></div>`,
    )
    .join("");

  const badge = el("path-badge");
  const badgeText = el("path-badge-text");
  if (badge && badgeText) {
    if (isCollegeEmail(email)) {
      badge.classList.remove("warn");
      badgeText.textContent =
        "After email verification you can use College feed with a verified student badge (subject to policy).";
    } else {
      badge.classList.add("warn");
      badgeText.textContent =
        "After email verification you start on Basic (Explore). Complete Video KYC in Settings to unlock College feed.";
    }
  }
}

function resetResendCooldown(): void {
  resendSeconds = 0;
  if (resendTimer) {
    clearInterval(resendTimer);
    resendTimer = null;
  }
  updateResendButton();
}

function updateResendButton(): void {
  const btn = el<HTMLButtonElement>("btn-resend");
  if (!btn) return;
  if (resendSeconds > 0) {
    btn.disabled = true;
    btn.textContent = `Resend in ${resendSeconds}s`;
  } else {
    btn.disabled = false;
    btn.textContent = "Resend email";
  }
}

function clearOtp(): void {
  document.querySelectorAll<HTMLInputElement>(".otp-cell").forEach((c) => {
    c.value = "";
  });
}

function getOtpValue(): string {
  let s = "";
  document.querySelectorAll<HTMLInputElement>(".otp-cell").forEach((c) => {
    s += (c.value || "").replace(/\D/g, "");
  });
  return s;
}

function setupOtpInputs(): void {
  const cells = document.querySelectorAll<HTMLInputElement>(".otp-cell");
  if (!cells.length || cells[0].dataset.bound === "1") return;
  cells[0].dataset.bound = "1";

  cells.forEach((cell, idx) => {
    cell.addEventListener("input", () => {
      const v = (cell.value || "").replace(/\D/g, "").slice(-1);
      cell.value = v;
      if (v && idx < cells.length - 1) cells[idx + 1].focus();
    });
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !cell.value && idx > 0) cells[idx - 1].focus();
    });
    cell.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text") || "";
      const digits = text.replace(/\D/g, "").slice(0, 6);
      for (let i = 0; i < cells.length; i++) {
        cells[i].value = digits[i] || "";
      }
      const last = Math.min(digits.length, cells.length) - 1;
      if (last >= 0) cells[last].focus();
    });
  });
}

function prepareVerifiedWelcome(): void {
  const email = val("signup-email") || val("login-email");
  const msg = el("verified-message");
  const kyc = el("kyc-callout");
  const btn = el<HTMLButtonElement>("btn-enter-app");
  const college = isCollegeEmail(email);

  if (msg) {
    msg.textContent = college
      ? "Your college email is on file. Welcome to CampX — you can browse your campus feed and communities."
      : "Your email is confirmed. You are on Basic tier with full Explore access while you complete student verification.";
  }
  if (kyc) kyc.style.display = college ? "none" : "flex";
  if (btn) {
    btn.textContent = college ? "Continue to College feed" : "Continue to Explore";
  }
}

/** Use `?next=/campx-....` from session gate; only same-origin relative paths allowed. */
function redirectAfterAuth(fallbackPath: string): void {
  const raw = new URLSearchParams(window.location.search).get("next");
  if (!raw) {
    window.location.href = fallbackPath;
    return;
  }
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) {
      window.location.href = fallbackPath;
      return;
    }
    const path = u.pathname + u.search + u.hash;
    if (!path.startsWith("/") || path.includes("//") || path.includes("campx-onboarding.html")) {
      window.location.href = fallbackPath;
      return;
    }
    window.location.href = path;
  } catch {
    window.location.href = fallbackPath;
  }
}

function enterAppAfterVerify(): void {
  const email = val("signup-email") || val("login-email");
  const fallback = isCollegeEmail(email) ? "/campx-college-feed.html" : "/campx-explore-feed.html";
  redirectAfterAuth(fallback);
}

async function initAuthListener(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  sb.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      goTo("recovery", true);
    }
  });

  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    await syncEmailVerifiedStatus(sb, session.user);
    const hash = window.location.hash;
    const isRecoveryHash = /type=recovery|error_code/.test(hash);
    if (
      session.user.email_confirmed_at &&
      hash.length > 1 &&
      hash.includes("access_token") &&
      !isRecoveryHash
    ) {
      prepareVerifiedWelcome();
      goTo("verified-welcome", true);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }
}

function wireGlobals(): void {
  window.goTo = goTo;
  window.checkEmailType = (v: string) => {
      const hint = el("email-hint");
      const hintText = el("email-hint-text");
      if (!hint || !hintText) return;
      if (!v) {
        hint.style.display = "none";
        return;
      }
      hint.style.display = "flex";
      hint.classList.remove("warn");
      if (isCollegeEmail(v)) {
        hint.style.background = "rgba(74,222,128,0.08)";
        hint.style.borderColor = "rgba(74,222,128,0.2)";
        hintText.style.color = "rgba(74,222,128,0.9)";
        hintText.textContent = "College domain detected — eligible for instant email verification.";
      } else {
        hint.classList.add("warn");
        hint.style.background = "rgba(251,191,36,0.08)";
        hint.style.borderColor = "rgba(251,191,36,0.2)";
        hintText.style.color = "rgba(251,220,120,0.95)";
        hintText.textContent =
          "Personal or unknown domain — you will need Video KYC after signup to get a verified badge and College feed.";
      }
    };
  window.togglePass = (inputId: string, btn: HTMLElement) => {
      const input = el<HTMLInputElement>(inputId);
      if (!input || !btn) return;
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      const svg = btn.querySelector("svg");
      if (svg) (svg as SVGElement).style.opacity = hidden ? "0.4" : "1";
    };
  window.showToast = showToast;
  window.selectProgram = (which: string) => {
      signupProgram = which === "pg" ? "pg" : "ug";
      el("prog-ug")?.classList.toggle("selected", signupProgram === "ug");
      el("prog-pg")?.classList.toggle("selected", signupProgram === "pg");
    };
  window.handleSignupStep1 = () => {
      const name = val("signup-name");
      const email = val("signup-email");
      const pass = el<HTMLInputElement>("signup-pass")?.value ?? "";
      const pass2 = el<HTMLInputElement>("signup-pass2")?.value ?? "";
      const terms = el<HTMLInputElement>("terms-check")?.checked ?? false;

      if (!name) {
        showToast("Please enter your full name.");
        return;
      }
      if (!email) {
        showToast("Please enter your email address.");
        return;
      }
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address.");
        return;
      }
      if (pass.length < 8) {
        showToast("Password must be at least 8 characters.");
        return;
      }
      if (pass !== pass2) {
        showToast("Passwords do not match.");
        return;
      }
      if (!terms) {
        showToast("Please accept the Terms and Privacy Policy to continue.");
        return;
      }
      goTo("signup2");
    };
  window.handleSignupStep2 = () => {
      const college = val("college-name");
      const year = el<HTMLSelectElement>("study-year")?.value ?? "";

      if (!college) {
        showToast("Please enter your college or university name.");
        return;
      }
      if (!year) {
        showToast("Please select your year of study.");
        return;
      }
      renderSignupSummary();
      goTo("signup3");
    };
  window.handleSignupStep3 = async () => {
      const email = val("signup-email");
      const password = el<HTMLInputElement>("signup-pass")?.value ?? "";
      const name = val("signup-name");
      const college = val("college-name");
      const year = el<HTMLSelectElement>("study-year")?.value ?? "";
      const major = val("major");
      const phone = val("phone");
      const marketing = el<HTMLInputElement>("marketing-optin")?.checked ?? false;

      if (!email || !password) {
        showToast("Missing email or password — go back to step 1.");
        return;
      }

      const disp = el("verify-email-display");
      if (disp) disp.textContent = email;

      if (!isSupabaseConfigured()) {
        goTo("verify-email");
        showToast("Supabase env not set — using offline verify screens only.");
        resetResendCooldown();
        return;
      }

      const sb = await getClient();
      if (!sb) return;

      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authRedirectBase(),
          data: {
            full_name: name,
            college,
            program: signupProgram,
            year_of_study: year,
            major: major || "",
            phone: phone || "",
            marketing_opt_in: marketing,
          },
        },
      });

      if (error) {
        showToast(error.message);
        return;
      }

      if (data.session?.user) {
        await syncEmailVerifiedStatus(sb, data.session.user);
        prepareVerifiedWelcome();
        goTo("verified-welcome");
        resetResendCooldown();
        return;
      }

      goTo("verify-email");
      showToast("Check your inbox for the confirmation link or code.");
      resetResendCooldown();
    };
  window.handleResend = async () => {
      if (resendSeconds > 0) return;
      const email = val("signup-email") || val("login-email");
      if (!email || !isValidEmail(email)) {
        showToast("Enter a valid email first.");
        return;
      }

      if (!isSupabaseConfigured()) {
        showToast("Verification email resent (offline demo).");
        resendSeconds = 45;
        updateResendButton();
        resendTimer = setInterval(() => {
          resendSeconds--;
          updateResendButton();
          if (resendSeconds <= 0 && resendTimer) {
            clearInterval(resendTimer);
            resendTimer = null;
          }
        }, 1000);
        return;
      }

      const sb = await getClient();
      if (!sb) return;

      const { error } = await sb.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: authRedirectBase() },
      });

      if (error) {
        showToast(error.message);
        return;
      }

      showToast("Verification email sent again.");
      resendSeconds = 45;
      updateResendButton();
      resendTimer = setInterval(() => {
        resendSeconds--;
        updateResendButton();
        if (resendSeconds <= 0 && resendTimer) {
          clearInterval(resendTimer);
          resendTimer = null;
        }
      }, 1000);
    };
  window.handleVerifyCode = async () => {
      const code = getOtpValue();
      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        showToast("Enter the full 6-digit code (digits only).");
        return;
      }

      const email = val("signup-email") || val("login-email");
      if (!email) {
        showToast("Missing email for verification.");
        return;
      }

      if (!isSupabaseConfigured()) {
        showToast("Email verified (offline demo).");
        prepareVerifiedWelcome();
        goTo("verified-welcome");
        return;
      }

      const sb = await getClient();
      if (!sb) return;

      let error = (
        await sb.auth.verifyOtp({
          email,
          token: code,
          type: "signup",
        })
      ).error;

      if (error) {
        const alt = await sb.auth.verifyOtp({ email, token: code, type: "email" });
        error = alt.error;
      }

      if (error) {
        showToast(error.message);
        return;
      }

      const { data: { user } } = await sb.auth.getUser();
      if (user) await syncEmailVerifiedStatus(sb, user);

      showToast("Email verified.");
      prepareVerifiedWelcome();
      goTo("verified-welcome");
    };
  window.handleLogin = async () => {
      const email = val("login-email");
      const pass = el<HTMLInputElement>("login-pass")?.value ?? "";
      const remember = el<HTMLInputElement>("remember-me")?.checked ?? false;

      if (!email) {
        showToast("Please enter your email address.");
        return;
      }
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address.");
        return;
      }
      if (!pass) {
        showToast("Please enter your password.");
        return;
      }

      if (remember) {
        try {
          localStorage.setItem("campx_remember_email", email);
        } catch {
          /* ignore */
        }
      }

      const lower = email.toLowerCase();
      if (lower.includes("notverified")) {
        el<HTMLInputElement>("signup-email")!.value = email;
        const d = el("verify-email-display");
        if (d) d.textContent = email;
        showToast("This account still needs email verification.");
        goTo("verify-email");
        return;
      }

      if (!isSupabaseConfigured()) {
        showToast("Signing you in… (no Supabase — redirect demo)");
        setTimeout(() => {
          redirectAfterAuth("/campx-college-feed.html");
        }, 600);
        return;
      }

      const sb = await getClient();
      if (!sb) return;

      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        showToast(error.message);
        return;
      }

      const user = data.user;
      if (!user?.email_confirmed_at) {
        el<HTMLInputElement>("signup-email")!.value = email;
        const d = el("verify-email-display");
        if (d) d.textContent = email;
        showToast("Please verify your email to continue.");
        goTo("verify-email");
        return;
      }

      await syncEmailVerifiedStatus(sb, user);

      showToast("Signed in. Redirecting…");
      const profileEmail = user.email ?? email;
      const fallback = isCollegeEmail(profileEmail)
        ? "/campx-college-feed.html"
        : "/campx-explore-feed.html";
      setTimeout(() => redirectAfterAuth(fallback), 400);
    };
  window.handleForgotSubmit = async () => {
      const email = val("forgot-email");
      if (!email) {
        showToast("Please enter your email address.");
        return;
      }
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address.");
        return;
      }

      const out = el("forgot-sent-email");
      if (out) out.textContent = email;

      if (!isSupabaseConfigured()) {
        goTo("forgot-sent");
        return;
      }

      const sb = await getClient();
      if (!sb) return;

      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: authRedirectBase(),
      });

      if (error) {
        showToast(error.message);
        return;
      }

      goTo("forgot-sent");
      showToast("If an account exists, a reset link was sent.");
    };
  window.handleRecoverySubmit = async () => {
      const p1 = el<HTMLInputElement>("recovery-pass")?.value ?? "";
      const p2 = el<HTMLInputElement>("recovery-pass2")?.value ?? "";

      if (p1.length < 8) {
        showToast("Password must be at least 8 characters.");
        return;
      }
      if (p1 !== p2) {
        showToast("Passwords do not match.");
        return;
      }

      const sb = await getClient();
      if (!sb) return;

      const { error } = await sb.auth.updateUser({ password: p1 });
      if (error) {
        showToast(error.message);
        return;
      }

      showToast("Password updated. You can log in.");
      goTo("login", false);
    };
  window.enterAppAfterVerify = enterAppAfterVerify;
}

wireGlobals();

void initAuthListener();

try {
  const saved = localStorage.getItem("campx_remember_email");
  if (saved && el<HTMLInputElement>("login-email")) {
    el<HTMLInputElement>("login-email")!.value = saved;
    const rm = el<HTMLInputElement>("remember-me");
    if (rm) rm.checked = true;
  }
} catch {
  /* ignore */
}
