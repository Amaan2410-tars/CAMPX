import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import '../index.css';

interface FormErrors {
  [key: string]: string;
}

const COLLEGE_CATALOG: Record<string, string[]> = {
  "Shadan College Of Engineering and Technology": [
    "Computer Science and Engineering (CSE)",
    "Information Technology (IT)",
    "CSE (AI & ML)",
    "CSE (Data Science)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "MBA"
  ],
  "Lords College of Engineering and Technology": [
    "Computer Science and Engineering (CSE)",
    "Information Technology (IT)",
    "CSE (AI & ML)",
    "CSE (Data Science)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "MBA"
  ],
  "M.J College of Engineering and Technology": [
    "Computer Science and Engineering (CSE)",
    "Information Technology (IT)",
    "CSE (AI & ML)",
    "Artificial Intelligence and Data Science",
    "Electronics and Communication Engineering (ECE)",
    "Electrical Engineering (EE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "Production Engineering"
  ],
  "Methodist College of Engineering and Technology": [
    "Computer Science and Engineering (CSE)",
    "CSE (AI & ML)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering"
  ],
  "Anwar-ul-uloom Degree College": [
    "B.Sc (Computer Science)",
    "B.Sc (Physical Sciences)",
    "B.Sc (Life Sciences)",
    "B.Com (General)",
    "B.Com (Computers)",
    "B.Com (Honors)",
    "BBA",
    "B.A."
  ],
  "St Joseph College of Degree": [
    "B.Com (General)",
    "B.Com (Computers)",
    "B.Com (Honors)",
    "B.Com (IT)",
    "BBA (Business Administration)",
    "BBA (IT)",
    "B.Sc (Maths, Physics, Computer Science)",
    "B.Sc (Electronics)",
    "B.A. (Mass Communication)"
  ]
};

const MOCK_COLLEGES = Object.keys(COLLEGE_CATALOG).map((name, idx) => ({ id: `c-${idx}`, name }));

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [history, setHistory] = useState<string[]>(['splash']);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [collegeResults, setCollegeResults] = useState<{id: string; name: string}[]>([]);
  const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);
  const [major, setMajor] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Loading / UI state
  const [loading, setLoading] = useState(false);
  const [otpLength, setOtpLength] = useState(8); 
  const [otpDigits, setOtpDigits] = useState(Array(8).fill(''));
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
    if (!query.trim() || query.length < 2) {
      setCollegeResults([]);
      setCollegeDropdownOpen(false);
      return;
    }
    collegeSearchTimer.current = window.setTimeout(async () => {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data } = await sb.from('colleges').select('id, name').ilike('name', `%${query}%`).limit(8);
          if (data && data.length > 0) {
            setCollegeResults(data);
            setCollegeDropdownOpen(true);
            return;
          }
        } catch { /* fall through to mock */ }
      }
      // Mock fallback
      const mockColleges = [
        { id: '1', name: 'CBIT Hyderabad' },
        { id: '2', name: 'JNTU Hyderabad' },
        { id: '3', name: 'Osmania University' },
        { id: '4', name: 'IIIT Hyderabad' },
        { id: '5', name: 'VNR VJIET' },
        { id: '6', name: 'MJCET Hyderabad' },
        { id: '7', name: 'Vasavi CE' },
        { id: '8', name: 'Stanley College of Engineering' },
      ].filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
      setCollegeResults(mockColleges);
      setCollegeDropdownOpen(mockColleges.length > 0);
    }, 300);
  }, []);

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
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.signInWithOtp({ email });
        if (error) {
          setErrors({ submit: error.message });
          setLoading(false);
          return;
        }
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
    if (code.length < 6) { // Accept 6 or 8 based on supabase settings
      setOtpError('Enter the complete verification code');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      const sb = getSupabase();
      const storedEmail = localStorage.getItem('campx_verify_email') || email;
      if (sb) {
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
              mobile,
              college: collegeName,
              college_id: collegeId,
              major,
              year_of_study: yearOfStudy,
            }, { onConflict: 'id' });
          }
        } catch { /* non-critical */ }
      }
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
        await sb.auth.signInWithOtp({ email: storedEmail });
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
              <div className="logo-mark">
                <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 36 L22 8 L36 36" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M13 27 L31 27" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <circle cx="32" cy="14" r="5" fill="white" opacity="0.9"/>
                </svg>
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
                <select className={`year-select ${errors.college ? 'has-error' : ''}`} id="college-name" value={collegeName} onChange={e => { setCollegeName(e.target.value); setMajor(''); setErrors(p => ({...p, college: ''})); }}>
                  <option value="">Select your college</option>
                  {MOCK_COLLEGES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {renderInlineError('college')}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-major">Major / Branch</label>
                <select className={`year-select ${errors.major ? 'has-error' : ''}`} id="signup-major" value={major} onChange={e => { setMajor(e.target.value); setErrors(p => ({...p, major: ''})); }} disabled={!collegeName}>
                  <option value="">Select major</option>
                  {collegeName && COLLEGE_CATALOG[collegeName] ? COLLEGE_CATALOG[collegeName].map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                  )) : null}
                </select>
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
                <div className="terms-text">I agree to the <a href="/terms.html" onClick={e => e.stopPropagation()}>Terms of Service</a> and <a href="/privacy.html" onClick={e => e.stopPropagation()}>Privacy Policy</a></div>
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
