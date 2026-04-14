import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';
import '../index.css';

interface FormErrors {
  [key: string]: string;
}

const ALLOWED_COLLEGE_NAMES = [
  'Lords College of Engineering and Technology',
  'Shadan College of Engineering and Technology',
  'Methodist College of Engineering and Technology',
  'Muffakham Jah College of Engineering and Technology',
  'Anwar-ul-Uloom Degree College',
] as const;

function normalizeCollegeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const COLLEGE_NAME_ALIASES: Record<string, (typeof ALLOWED_COLLEGE_NAMES)[number]> = {
  [normalizeCollegeName('Lords College of Engineering and Technology')]: 'Lords College of Engineering and Technology',
  [normalizeCollegeName('Lords College of engineering and technology')]: 'Lords College of Engineering and Technology',
  [normalizeCollegeName('LIET')]: 'Lords College of Engineering and Technology',

  [normalizeCollegeName('Shadan College of Engineering and Technology')]: 'Shadan College of Engineering and Technology',
  [normalizeCollegeName('Shadan College of engineering and technology')]: 'Shadan College of Engineering and Technology',
  [normalizeCollegeName('SCET')]: 'Shadan College of Engineering and Technology',

  [normalizeCollegeName('Methodist College of Engineering and Technology')]: 'Methodist College of Engineering and Technology',
  [normalizeCollegeName('Methodist College of engineering and technology')]: 'Methodist College of Engineering and Technology',

  [normalizeCollegeName('Muffakham Jah College of Engineering and Technology')]: 'Muffakham Jah College of Engineering and Technology',
  [normalizeCollegeName('MJ College of engineering and technology')]: 'Muffakham Jah College of Engineering and Technology',
  [normalizeCollegeName('MJ College of Engineering and Technology')]: 'Muffakham Jah College of Engineering and Technology',
  [normalizeCollegeName('MJCET')]: 'Muffakham Jah College of Engineering and Technology',

  [normalizeCollegeName('Anwar-ul-Uloom Degree College')]: 'Anwar-ul-Uloom Degree College',
  [normalizeCollegeName('Anwar-ul-uloom Degree college')]: 'Anwar-ul-Uloom Degree College',
};

// NEEDS FOUNDER INPUT:
// Fill course lists per college (use exact college name keys from ALLOWED_COLLEGE_NAMES).
// Example:
// 'MJ College of engineering and technology': ['Computer Science and Engineering', 'ECE', ...]
const COURSES_BY_COLLEGE: Record<(typeof ALLOWED_COLLEGE_NAMES)[number], string[]> = {
  'Lords College of Engineering and Technology': [
    'Computer Science and Engineering',
    'CSE (Artificial Intelligence & Machine Learning)',
    'CSE (Data Science)',
    'Information Technology',
    'Artificial Intelligence & Machine Learning',
    'Electronics & Communication Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'BBA (Bachelor of Business Administration)',
    'M.E / M.Tech — Computer Science Engineering',
    'M.E / M.Tech — Structural Engineering',
    'M.E / M.Tech — Construction Management',
    'MBA (Finance)',
    'MBA (HR)',
    'MBA (Marketing)',
    'MBA (Systems)',
    'MBA (Other specializations)',
  ],
  'Shadan College of Engineering and Technology': [
    'Computer Science and Engineering',
    'CSE (Artificial Intelligence & Machine Learning)',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'M.Tech (various specializations)',
    'MBA',
  ],
  'Methodist College of Engineering and Technology': [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'M.Tech (multiple specializations)',
    'MBA',
  ],
  'Muffakham Jah College of Engineering and Technology': [
    'Computer Science Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Instrumentation Engineering',
    'Mechanical Engineering',
    'Production Engineering',
    'M.E (CAD/CAM)',
    'M.E (Digital Systems)',
    'M.E (Structural Engineering)',
    'M.E (Power Electronics)',
    'M.Tech (Computer Science)',
    'MCA',
  ],
  'Anwar-ul-Uloom Degree College': [
    'B.Com (General)',
    'B.Com (Computers)',
    'B.Com (Honours)',
    'BBA',
    'B.Sc (MPC)',
    'B.Sc (MSCS)',
    'B.Sc (Other combinations)',
    'BA',
    'M.Com',
    'MBA',
  ],
};

function is18Plus(dobIso: string): boolean {
  // dobIso is expected to be yyyy-mm-dd from <input type="date">
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return false;
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return dob <= cutoff;
}

export default function Onboarding() {
  usePageTitle('Join Your Campus Community');
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [history, setHistory] = useState<string[]>(['splash']);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [collegeResults, setCollegeResults] = useState<{id: string; name: string}[]>([]);
  const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);
  const [major, setMajor] = useState('');
  const [majorQuery, setMajorQuery] = useState('');
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Loading / UI state
  const [loading, setLoading] = useState(false);
  const [otpLength] = useState(6);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [otpShake, setOtpShake] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const collegeSearchTimer = useRef<number | null>(null);

  const goTo = (screenId: string) => {
    setHistory(prev => [...prev, screenId]);
    setCurrentScreen(screenId);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScreen(prevScreen);
    }
  };

  const finishOnboarding = () => {
    navigate('/explore-feed');
  };

  const getScreenClass = (id: string) => {
    if (id === currentScreen) return 'screen active';
    return 'screen hidden-right';
  };

  // ── Validation ──
  const validateMobile = (val: string): string => {
    if (!val) return 'Mobile number is required';
    if (!/^[6-9]\d{9}$/.test(val)) return 'Enter a valid 10-digit Indian mobile number';
    return '';
  };

  const validateSignup1 = (): boolean => {
    const errs: FormErrors = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!dateOfBirth) errs.dob = 'Date of birth is required';
    else if (!is18Plus(dateOfBirth)) errs.dob = 'You must be 18+ to create an account';
    if (!mobile.trim()) errs.mobile = 'Mobile number is required';
    else {
      const mobileErr = validateMobile(mobile);
      if (mobileErr) errs.mobile = mobileErr;
    }
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup2 = (): boolean => {
    const errs: FormErrors = {};
    if (!collegeName.trim()) errs.college = 'Please select your college';
    if (!collegeId) errs.college = 'Please select your college from the list';
    if (!major.trim()) errs.major = 'Major / branch is required';
    if (!yearOfStudy) errs.year = 'Year of study is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup3 = (): boolean => {
    const errs: FormErrors = {};
    if (!termsAccepted) errs.terms = 'You must accept the terms to continue';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── College Search (debounced) ──
  const searchColleges = useCallback((query: string) => {
    if (collegeSearchTimer.current) clearTimeout(collegeSearchTimer.current);
    if (!query.trim()) {
      setCollegeResults([]);
      setCollegeDropdownOpen(false);
      return;
    }
    collegeSearchTimer.current = window.setTimeout(async () => {
      const sb = getSupabase();
      if (!sb) {
        setCollegeResults([]);
        setCollegeDropdownOpen(false);
        return;
      }
      try {
        const { data } = await sb
          .from('colleges')
          .select('id, name')
          .ilike('name', `%${query.trim()}%`)
          .limit(30);

        const allowed = new Set(ALLOWED_COLLEGE_NAMES);
        const filtered = (data ?? [])
          .map((c) => {
            const canonical = COLLEGE_NAME_ALIASES[normalizeCollegeName(c.name)];
            return canonical && allowed.has(canonical) ? { id: c.id, name: canonical } : null;
          })
          .filter(Boolean) as { id: string; name: string }[];

        // Deduplicate by canonical name (keep the first UUID we saw).
        const dedup = Array.from(new Map(filtered.map((c) => [c.name, c])).values()).slice(0, 8);
        setCollegeResults(dedup);
        setCollegeDropdownOpen(Boolean(dedup.length));
      } catch {
        setCollegeResults([]);
        setCollegeDropdownOpen(false);
      }
    }, 200);
  }, []);

  const currentCollegeKey = COLLEGE_NAME_ALIASES[normalizeCollegeName(collegeName)] ?? null;

  const majorOptions = currentCollegeKey ? (COURSES_BY_COLLEGE[currentCollegeKey] ?? []) : [];
  const majorResults = (() => {
    const q = majorQuery.trim().toLowerCase();
    const base = majorOptions;
    if (!q) return base.slice(0, 8);
    return base.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
  })();

  // ── OTP Handling ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError('');
    if (value && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpLength);
    if (pasted.length === otpLength || pasted.length === 6) { // support both 6 and 8 for backward combability
      const newDigits = Array(otpLength).fill('');
      pasted.split('').forEach((char, i) => newDigits[i] = char);
      setOtpDigits(newDigits);
      otpRefs.current[pasted.length - 1]?.focus();
    }
  };

  // Resend countdown timer
  useEffect(() => {
    if (currentScreen === 'verify-code') {
      setResendDisabled(true);
      setResendCountdown(60);
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentScreen]);

  // ── Auth Actions ──
  const handleSendVerification = async () => {
    if (!validateSignup3()) return;
    setLoading(true);
    setErrors({});
    try {
      if (!isSupabaseConfigured()) {
        setErrors({ submit: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' });
        setLoading(false);
        return;
      }
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase client unavailable');
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            full_name: fullName,
            phone: mobile,
            college: collegeName,
            college_id: collegeId,
            major,
            year_of_study: yearOfStudy,
            date_of_birth: dateOfBirth,
          },
        },
      });
      if (error) {
        setErrors({ submit: error.message });
        setLoading(false);
        return;
      }
      localStorage.setItem('campx_verify_email', email);
      goTo('verify-code');
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Failed to send verification email' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Enter the complete verification code');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      const sb = getSupabase();
      const storedEmail = localStorage.getItem('campx_verify_email') || email;
      if (!sb) throw new Error('Supabase client unavailable');
      const { error } = await sb.auth.verifyOtp({ email: storedEmail, token: code, type: 'email' });
        if (error) {
          setOtpShake(true);
          setTimeout(() => setOtpShake(false), 600);
          setOtpError(error.message.includes('expired') ? 'Code has expired. Please resend.' : 'Invalid code. Please try again.');
          setLoading(false);
          return;
        }
        // Upsert profile
        try {
          const { data: { user } } = await sb.auth.getUser();
          if (user) {
            await sb.from('profiles').upsert({
              id: user.id,
              full_name: fullName,
              email: storedEmail,
              phone: mobile,
              college: collegeName,
              college_id: collegeId,
              major,
              year_of_study: yearOfStudy,
              date_of_birth: dateOfBirth,
            }, { onConflict: 'id' });
          }
        } catch { /* non-critical */ }
      goTo('verified-welcome');
    } catch (err: any) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 600);
      setOtpError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendCountdown(60);
    try {
      const sb = getSupabase();
      const storedEmail = localStorage.getItem('campx_verify_email') || email;
      if (sb) {
        await sb.auth.signInWithOtp({
          email: storedEmail,
          options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/onboarding` },
        });
      }
    } catch { /* silently retry */ }
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
        if (error) {
          if (error.message.includes('Invalid login')) setLoginError('Incorrect email or password');
          else if (error.message.includes('not found')) setLoginError('No account found with this email');
          else setLoginError(error.message);
          setLoginLoading(false);
          return;
        }
      }
      finishOnboarding();
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.resetPasswordForEmail(forgotEmail);
        if (error) {
          setForgotError(error.message);
          setForgotLoading(false);
          return;
        }
      }
      goTo('forgot-sent');
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send reset link');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword) { setResetError('Enter a new password'); return; }
    if (resetPassword.length < 8) { setResetError('Password must be at least 8 characters'); return; }
    if (resetPassword !== resetConfirm) { setResetError('Passwords do not match'); return; }
    setResetLoading(true);
    setResetError('');
    try {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.updateUser({ password: resetPassword });
        if (error) {
          setResetError(error.message);
          setResetLoading(false);
          return;
        }
      }
      goTo('login');
    } catch (err: any) {
      setResetError(err?.message || 'Failed to update password');
    } finally {
      setResetLoading(false);
    }
  };

  const verifyEmail = localStorage.getItem('campx_verify_email') || email;

  const renderInlineError = (field: string) =>
    errors[field] ? <div className="inline-error">{errors[field]}</div> : null;

  return (
    <>
      <style>{`
        .screen {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
          background-color: var(--bg, #000); z-index: 10; overflow-y: auto; overflow-x: hidden;
        }
        .screen.hidden-right { transform: translateX(100%); opacity: 0; pointer-events: none; }
        .screen.hidden-left { transform: translateX(-100%); opacity: 0; pointer-events: none; }
        .screen.active { transform: translateX(0); opacity: 1; pointer-events: auto; z-index: 20; }
        .app { position: relative; overflow: hidden; }
        .inline-error { color: #f87171; font-size: 12px; margin-top: 4px; padding-left: 2px; }
        .input-wrap.has-error input, .input-wrap.has-error select { border-color: rgba(248,113,113,0.5) !important; }
        .no-icon.has-error { border-color: rgba(248,113,113,0.5) !important; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-loading { position: relative; }
        .btn-loading::after {
          content: ''; position: absolute; width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          right: 16px; top: 50%; transform: translateY(-50%);
        }
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
        .otp-row.shake { animation: otpShake 0.4s ease-in-out; }
        @keyframes otpShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .college-dropdown {
          position: absolute; left: 0; right: 0; top: 100%; z-index: 100;
          background: var(--surface2, #1c1c27); border: 1px solid var(--border2, rgba(255,255,255,0.12));
          border-radius: 12px; margin-top: 4px; max-height: 200px; overflow-y: auto;
        }
        .college-dropdown-item {
          padding: 10px 14px; font-size: 14px; color: var(--text, #f0f0f8);
          cursor: pointer; transition: background 0.15s;
        }
        .college-dropdown-item:hover { background: var(--surface3, #22222f); }
        .terms-row { display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; cursor: pointer; }
        .terms-checkbox {
          width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; margin-top: 2px;
          border: 1.5px solid var(--border2, rgba(255,255,255,0.12)); background: var(--surface, #13131a);
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .terms-checkbox.checked { background: var(--accent, #6c63ff); border-color: var(--accent, #6c63ff); }
        .terms-text { font-size: 13px; color: var(--text-sub, rgba(240,240,248,0.6)); line-height: 1.5; }
        .terms-text a { color: var(--accent, #6c63ff); text-decoration: underline; }
        .resend-row { text-align: center; margin-top: 16px; }
        .resend-btn {
          background: none; border: none; color: var(--accent, #6c63ff);
          font-size: 14px; cursor: pointer; padding: 8px 16px; font-family: inherit;
        }
        .resend-btn:disabled { color: var(--text-muted, rgba(240,240,248,0.38)); cursor: not-allowed; }
        .year-select {
          width: 100%; padding: 12px 16px; border-radius: 14px; font-size: 15px;
          border: 1px solid var(--border2, rgba(255,255,255,0.12));
          background: var(--surface, #13131a); color: var(--text, #f0f0f8);
          font-family: inherit; appearance: none;
        }
      `}</style>
      
      <div className="app">
        <div className="phone" style={{position: 'relative', overflow: 'hidden'}}>
          
          {/* SPLASH SCREEN */}
          <div className={getScreenClass('splash')} id="splash">
            <div className="splash-bg">
              <div className="grid-lines"></div>
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
              <div className="orb orb-3"></div>
            </div>
            <div className="splash-center">
              <div className="logo-mark" style={{ background: 'transparent', border: 'none' }}>
                <img src="/campx-logo.png" alt="CampX Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="brand-name">Camp<span className="brand-x">X</span></div>
              <div className="brand-tagline">Your campus, elevated</div>
              <div className="feature-pills">
                <span className="pill">Verified students only</span>
                <span className="pill">Hyderabad → India</span>
                <span className="pill">College + Community</span>
              </div>
            </div>
            <div className="splash-ctas">
              <button type="button" className="btn btn-primary" onClick={() => goTo('login')}>Log in</button>
              <button type="button" className="btn btn-secondary" onClick={() => goTo('signup')}>Create account</button>
              <div className="splash-note">Only for UG &amp; PG students aged 18+</div>
            </div>
          </div>

          {/* SIGNUP 1 — Personal Details */}
          <div className={getScreenClass('signup')} id="signup">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-dot"></div>
                <div className="step-dot"></div>
              </div>
              <div className="form-title">Create account</div>
              <div className="form-sub">Use your college email for instant verification when possible.</div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-name">Full name</label>
                <div className={`input-wrap ${errors.fullName ? 'has-error' : ''}`}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  <input type="text" id="signup-name" placeholder="As on your college ID" value={fullName} onChange={e => { setFullName(e.target.value); setErrors(p => ({...p, fullName: ''})); }} />
                </div>
                {renderInlineError('fullName')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-email">Email</label>
                <div className={`input-wrap ${errors.email ? 'has-error' : ''}`}>
                  <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
                  <input type="email" id="signup-email" placeholder="you@college.edu" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }} />
                </div>
                {renderInlineError('email')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-dob">Date of birth</label>
                <div className={`input-wrap ${errors.dob ? 'has-error' : ''}`}>
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input type="date" id="signup-dob" value={dateOfBirth} onChange={e => { setDateOfBirth(e.target.value); setErrors(p => ({...p, dob: ''})); }} />
                </div>
                {renderInlineError('dob')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-mobile">Mobile number</label>
                <div className={`input-wrap ${errors.mobile ? 'has-error' : ''}`}>
                  <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  <input type="tel" id="signup-mobile" placeholder="10-digit mobile number" maxLength={10} value={mobile} onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setErrors(p => ({...p, mobile: ''})); }} />
                </div>
                {renderInlineError('mobile')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-pass">Password</label>
                <div className={`input-wrap ${errors.password ? 'has-error' : ''}`}>
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input type="password" id="signup-pass" placeholder="At least 8 characters" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }} />
                </div>
                {renderInlineError('password')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-pass-confirm">Confirm password</label>
                <div className={`input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input type="password" id="signup-pass-confirm" placeholder="Re-enter your password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})); }} />
                </div>
                {renderInlineError('confirmPassword')}
              </div>

              <button type="button" className="btn btn-primary" onClick={() => { if (validateSignup1()) { setErrors({}); goTo('signup2'); } }}>Continue</button>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">already a member?</span>
                <div className="divider-line"></div>
              </div>
              <div className="form-footer">Have an account? <span style={{cursor:'pointer', color:'var(--accent)'}} onClick={() => goTo('login')}>Log in</span></div>
            </div>
          </div>

          {/* SIGNUP 2 — College Details */}
          <div className={getScreenClass('signup2')} id="signup2">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="step-indicator">
                <div className="step-dot done"></div>
                <div className="step-dot active"></div>
                <div className="step-dot"></div>
              </div>
              <div className="form-title">College details</div>
              <div className="form-sub">We use this to place you in the right campus feed.</div>

              <div className="input-group">
                <label className="input-label" htmlFor="college-name">College / University</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="college-name"
                    className={`year-select ${errors.college ? 'has-error' : ''}`}
                    placeholder="Search your college..."
                    value={collegeName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCollegeName(v);
                      setCollegeId(null);
                      setMajor('');
                      setMajorQuery('');
                      setErrors(p => ({ ...p, college: '' }));
                      searchColleges(v);
                    }}
                    onFocus={() => {
                      searchColleges(collegeName || ' ');
                    }}
                  />
                  {collegeDropdownOpen && (
                    <div className="college-dropdown" role="listbox" aria-label="College search results">
                      {collegeResults.map((c) => (
                        <div
                          key={c.id}
                          className="college-dropdown-item"
                          role="option"
                          onMouseDown={(evt) => {
                            evt.preventDefault();
                            setCollegeName(c.name);
                            setCollegeId(c.id);
                            setCollegeDropdownOpen(false);
                            setMajor('');
                            setMajorQuery('');
                            setErrors(p => ({ ...p, college: '' }));
                          }}
                        >
                          {c.name}
                        </div>
                      ))}
                      {!collegeResults.length && (
                        <div className="college-dropdown-item" style={{ cursor: 'default', opacity: 0.8 }}>
                          No matching college found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {renderInlineError('college')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-major">Major / Branch</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-major"
                    className={`year-select ${errors.major ? 'has-error' : ''}`}
                    placeholder={currentCollegeKey ? 'Search your course...' : 'Select college first'}
                    value={majorQuery || major}
                    disabled={!currentCollegeKey}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMajorQuery(v);
                      setMajor('');
                      setErrors(p => ({ ...p, major: '' }));
                      setMajorDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (!currentCollegeKey) return;
                      setMajorDropdownOpen(true);
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setMajorDropdownOpen(false), 120);
                    }}
                  />
                  {majorDropdownOpen && currentCollegeKey && (
                    <div className="college-dropdown" role="listbox" aria-label="Major search results">
                      {majorResults.map((m) => (
                        <div
                          key={m}
                          className="college-dropdown-item"
                          role="option"
                          onMouseDown={(evt) => {
                            evt.preventDefault();
                            setMajor(m);
                            setMajorQuery('');
                            setMajorDropdownOpen(false);
                            setErrors(p => ({ ...p, major: '' }));
                          }}
                        >
                          {m}
                        </div>
                      ))}
                      {!majorResults.length && (
                        <div className="college-dropdown-item" style={{ cursor: 'default', opacity: 0.8 }}>
                          No courses configured for this college yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {renderInlineError('major')}
              </div>

              <div className="input-group">
                <label className="input-label">Year of study</label>
                <select className={`year-select ${errors.year ? 'has-error' : ''}`} value={yearOfStudy} onChange={e => { setYearOfStudy(e.target.value); setErrors(p => ({...p, year: ''})); }}>
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year (Integrated)</option>
                  <option value="pg1">PG — 1st Year</option>
                  <option value="pg2">PG — 2nd Year</option>
                </select>
                {renderInlineError('year')}
              </div>

              <button type="button" className="btn btn-primary" onClick={() => { if (validateSignup2()) { setErrors({}); goTo('signup3'); } }}>Continue</button>
            </div>
          </div>

          {/* SIGNUP 3 — Review & Verify */}
          <div className={getScreenClass('signup3')} id="signup3">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="step-indicator">
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot active"></div>
              </div>
              <div className="form-title">Review &amp; verify</div>
              <div className="form-sub">Confirm your details. We'll email a verification code to <strong>{email}</strong>.</div>

              <div style={{background: 'var(--surface, #13131a)', borderRadius: '14px', padding: '16px', marginBottom: '16px', border: '1px solid var(--border, rgba(255,255,255,0.07))'}}>
                <div style={{fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px'}}><strong style={{color: 'var(--text)'}}>Name:</strong> {fullName}</div>
                <div style={{fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px'}}><strong style={{color: 'var(--text)'}}>Email:</strong> {email}</div>
                <div style={{fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px'}}><strong style={{color: 'var(--text)'}}>Mobile:</strong> {mobile}</div>
                <div style={{fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px'}}><strong style={{color: 'var(--text)'}}>College:</strong> {collegeName}</div>
                <div style={{fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px'}}><strong style={{color: 'var(--text)'}}>Major:</strong> {major}</div>
                <div style={{fontSize: '13px', color: 'var(--text-sub)'}}><strong style={{color: 'var(--text)'}}>Year:</strong> {yearOfStudy}</div>
              </div>

              <div className="terms-row" onClick={() => { setTermsAccepted(!termsAccepted); setErrors(p => ({...p, terms: ''})); }}>
                <div className={`terms-checkbox ${termsAccepted ? 'checked' : ''}`}>
                  {termsAccepted && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div className="terms-text">I agree to the <a href="/policies#terms" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>Terms of Service</a> and <a href="/policies#privacy" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>Privacy Policy</a></div>
              </div>
              {renderInlineError('terms')}

              {errors.submit && <div className="inline-error" style={{marginBottom: '8px'}}>{errors.submit}</div>}

              <button type="button" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading} onClick={handleSendVerification}>
                {loading ? 'Sending...' : 'Send verification email'}
              </button>
            </div>
          </div>

          {/* VERIFY CODE */}
          <div className={getScreenClass('verify-code')} id="verify-code">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
                <div className="center-block">
                <div className="mail-illus">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div className="form-title">Enter code</div>
                <div className="form-sub">We sent a verification code to <strong>{verifyEmail}</strong></div>
              </div>
              <div className={`otp-row ${otpShake ? 'shake' : ''}`}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    className="otp-cell"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>
              {otpError && <div className="inline-error" style={{textAlign: 'center', marginTop: '8px'}}>{otpError}</div>}
              <button type="button" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} style={{marginTop:'1.5rem'}} disabled={loading} onClick={handleVerifyOtp}>
                {loading ? 'Verifying...' : 'Verify & continue'}
              </button>
              <div className="resend-row">
                <button type="button" className="resend-btn" disabled={resendDisabled} onClick={handleResendOtp}>
                  {resendDisabled ? `Resend code in ${resendCountdown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          </div>

          {/* VERIFIED WELCOME */}
          <div className={getScreenClass('verified-welcome')} id="verified-welcome">
            <div className="center-block" style={{marginTop: '100px'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <div className="form-title">Email verified</div>
            </div>
            <div>
              <button type="button" className="btn btn-primary" onClick={finishOnboarding}>Let's go!</button>
            </div>
          </div>

          {/* LOGIN */}
          <div className={getScreenClass('login')} id="login">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="form-title">Welcome back</div>
              <div className="form-sub">Log in with the email and password you used to sign up.</div>

              <div className="input-group">
                <label className="input-label" htmlFor="login-email">Email</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
                  <input type="email" id="login-email" placeholder="your@email.com" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="login-pass">Password</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input type="password" id="login-pass" placeholder="Enter password" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
                </div>
              </div>

              {loginError && <div className="inline-error" style={{marginBottom: '8px'}}>{loginError}</div>}

              <button type="button" className="forgot-link" onClick={() => goTo('forgot')}>Forgot password?</button>
              <button type="button" className={`btn btn-primary ${loginLoading ? 'btn-loading' : ''}`} disabled={loginLoading} onClick={handleLogin}>
                {loginLoading ? 'Logging in...' : 'Log in'}
              </button>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">new to campx?</span>
                <div className="divider-line"></div>
              </div>
              <div className="form-footer">Don't have an account? <span style={{cursor:'pointer', color:'var(--accent)'}} onClick={() => goTo('signup')}>Sign up</span></div>
            </div>
          </div>

          {/* FORGOT PASS */}
          <div className={getScreenClass('forgot')} id="forgot">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="form-title">Reset password</div>
              <div className="form-sub">Enter your account email. We will send a link to create a new password.</div>

              <div className="input-group">
                <label className="input-label" htmlFor="forgot-email">Email</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
                  <input type="email" id="forgot-email" placeholder="your@email.com" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }} />
                </div>
              </div>

              {forgotError && <div className="inline-error" style={{marginBottom: '8px'}}>{forgotError}</div>}

              <button type="button" className={`btn btn-primary ${forgotLoading ? 'btn-loading' : ''}`} disabled={forgotLoading} onClick={handleForgotPassword}>
                {forgotLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
          </div>

          {/* FORGOT SENT */}
          <div className={getScreenClass('forgot-sent')} id="forgot-sent">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="center-block">
                <div className="form-title">Check your inbox</div>
                <div className="form-sub">Open the link to set a new password.</div>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => goTo('login')}>Back to log in</button>
            </div>
          </div>

          {/* RESET PASSWORD */}
          <div className={getScreenClass('reset-password')} id="reset-password">
            <div className="topbar">
              <div className="back-btn" role="button" tabIndex={0} onClick={goBack}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div className="topbar-logo">Camp<span className="x">X</span></div>
            </div>
            <div className="form-body">
              <div className="form-title">Set new password</div>
              <div className="form-sub">Choose a strong password for your account.</div>

              <div className="input-group">
                <label className="input-label">New password</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input type="password" placeholder="At least 8 characters" value={resetPassword} onChange={e => { setResetPassword(e.target.value); setResetError(''); }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm new password</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input type="password" placeholder="Re-enter password" value={resetConfirm} onChange={e => { setResetConfirm(e.target.value); setResetError(''); }} />
                </div>
              </div>

              {resetError && <div className="inline-error" style={{marginBottom: '8px'}}>{resetError}</div>}

              <button type="button" className={`btn btn-primary ${resetLoading ? 'btn-loading' : ''}`} disabled={resetLoading} onClick={handleResetPassword}>
                {resetLoading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
