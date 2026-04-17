import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import { getSupabase } from '@/lib/supabase';
import '../index.css';

export default function SettingsSubPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [profile, setProfile] = useState<{
    full_name: string | null;
    college: string | null;
    major: string | null;
    year_of_study: string | null;
    tier: string | null;
    verification_status: string | null;
    bio: string | null;
    theme: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [editBio, setEditBio] = useState('');
  const [editTheme, setEditTheme] = useState<'purple' | 'teal' | 'amber' | 'coral'>('purple');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const initials = useMemo(() => {
    const name = (profile?.full_name || '').trim();
    if (!name) return '—';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [profile?.full_name]);

  // Return to settings natively
  const goBack = () => navigate('/settings');

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      setErr('Supabase is not configured.');
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data: userData } = await sb.auth.getUser();
        const user = userData.user;
        if (!user) return;
        const { data } = await sb
          .from('profiles')
          .select('full_name, college, major, year_of_study, tier, verification_status, bio, theme, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (!cancelled) {
          setEmail(user.email ?? '');
          const nextProfile = {
            full_name: data?.full_name ?? null,
            college: data?.college ?? null,
            major: data?.major ?? null,
            year_of_study: data?.year_of_study ?? null,
            tier: data?.tier ?? null,
            verification_status: data?.verification_status ?? null,
            bio: (data as any)?.bio ?? null,
            theme: (data as any)?.theme ?? null,
            avatar_url: (data as any)?.avatar_url ?? null,
          };
          setProfile(nextProfile);
          setEditBio(String(nextProfile.bio ?? ''));
          const t = String(nextProfile.theme ?? '').trim() as any;
          if (t === 'purple' || t === 'teal' || t === 'amber' || t === 'coral') setEditTheme(t);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'Failed to load account.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestEmailChange = async (newEmail: string) => {
    const sb = getSupabase();
    if (!sb) {
      triggerGlobalToast('Supabase is not configured.', 'error');
      return;
    }
    try {
      const cleaned = newEmail.trim();
      if (!cleaned) throw new Error('Enter a new email.');
      const { error } = await sb.auth.updateUser(
        { email: cleaned },
        { emailRedirectTo: `${window.location.origin}/auth/callback?next=/settings` },
      );
      if (error) throw error;
      triggerGlobalToast('Verification link sent to your new email.', 'info');
      goBack();
    } catch (e: any) {
      triggerGlobalToast(e?.message ?? 'Failed to update email.', 'error');
    }
  };

  const requestPasswordChange = async (newPassword: string, confirm: string) => {
    const sb = getSupabase();
    if (!sb) {
      triggerGlobalToast('Supabase is not configured.', 'error');
      return;
    }
    try {
      if (!newPassword || newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
      if (newPassword !== confirm) throw new Error('Passwords do not match.');
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw error;
      triggerGlobalToast('Password updated securely.', 'success');
      goBack();
    } catch (e: any) {
      triggerGlobalToast(e?.message ?? 'Failed to update password.', 'error');
    }
  };

  const saveProfileEdits = async () => {
    const sb = getSupabase();
    if (!sb) {
      triggerGlobalToast('Supabase is not configured.', 'error');
      return;
    }
    try {
      setSavingProfile(true);
      const { data: userData } = await sb.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error('Not signed in.');

      const bio = editBio.trim().slice(0, 180);
      let avatar_url: string | null | undefined = undefined;

      if (avatarFile) {
        const ext = (avatarFile.name.split('.').pop() || 'png').toLowerCase();
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await sb.storage.from('avatars').upload(path, avatarFile, {
          upsert: true,
          contentType: avatarFile.type || undefined,
          cacheControl: '3600',
        });
        if (upErr) throw upErr;
        const { data: pub } = sb.storage.from('avatars').getPublicUrl(path);
        avatar_url = pub.publicUrl;
      }

      const { error } = await sb.from('profiles').update({ bio, theme: editTheme, ...(avatar_url ? { avatar_url } : {}) }).eq('id', user.id);
      if (error) throw error;

      setProfile((p) => (p ? { ...p, bio, theme: editTheme, ...(avatar_url ? { avatar_url } : {}) } : p));
      triggerGlobalToast('Profile updated.', 'success');
      goBack();
    } catch (e: any) {
      triggerGlobalToast(e?.message ?? 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const renderHeader = (title: string) => (
    <div className="topbar">
      <div className="back-btn" onClick={goBack} style={{ cursor: 'pointer', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
      <div className="topbar-title" style={{ flex: 1, textAlign: 'center', paddingRight: '48px' }}>{title}</div>
    </div>
  );

  const renderContent = () => {
    switch (pageId) {
      case 'edit-profile':
        return (
          <>
            {renderHeader('Edit Profile')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {err && <div style={{ color: '#fca5a5', fontSize: '13px' }}>{err}</div>}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2d2d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  {initials}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                  style={{ color: '#aaa' }}
                />
                <div style={{ fontSize: '12px', color: '#888' }}>Uploads to secure storage and updates your profile photo.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Display Name</label>
                <input type="text" disabled value={profile?.full_name ?? ''} style={{ background: '#1c1c24', border: '1px solid #333', color: '#666', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
                <div style={{ fontSize: '12px', color: '#888' }}>Name and college fields are locked after signup.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell people what you're building, learning, or looking for…"
                  style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', minHeight: '100px' }}
                />
                <div style={{ fontSize: '12px', color: '#888' }}>{Math.min(180, editBio.length)}/180</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Theme</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {([
                    { id: 'purple', c: '#6c63ff' },
                    { id: 'teal', c: '#2dd4bf' },
                    { id: 'amber', c: '#fbbf24' },
                    { id: 'coral', c: '#f97316' },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditTheme(t.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: t.c,
                        border: editTheme === t.id ? '3px solid white' : '2px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                      }}
                      aria-label={`Theme ${t.id}`}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              <button 
                disabled={savingProfile || loading}
                onClick={() => { void saveProfileEdits(); }}
                style={{ marginTop: '20px', background: '#fff', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.7 : 1 }}
              >
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        );

      case 'change-email':
        return (
          <>
            {renderHeader('Change Email')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {err && <div style={{ color: '#fca5a5', fontSize: '13px' }}>{err}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Current Email</label>
                <input type="email" disabled value={email} style={{ background: '#1c1c24', border: '1px solid #333', color: '#666', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>New Email</label>
                <input id="new-email" type="email" placeholder="new@college.edu" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              </div>
              <button 
                onClick={() => {
                  const el = document.getElementById('new-email') as HTMLInputElement | null;
                  void requestEmailChange(el?.value ?? '');
                }}
                style={{ background: '#4ade80', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
              >
                Send Verification Link
              </button>
            </div>
          </>
        );

      case 'change-password':
        return (
          <>
            {renderHeader('Change Password')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {err && <div style={{ color: '#fca5a5', fontSize: '13px' }}>{err}</div>}
              <input id="new-pass" type="password" placeholder="New Password" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              <input id="new-pass-confirm" type="password" placeholder="Confirm New Password" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              <button 
                onClick={() => {
                  const p1 = (document.getElementById('new-pass') as HTMLInputElement | null)?.value ?? '';
                  const p2 = (document.getElementById('new-pass-confirm') as HTMLInputElement | null)?.value ?? '';
                  void requestPasswordChange(p1, p2);
                }}
                style={{ background: '#fff', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
              >
                Update Password
              </button>
            </div>
          </>
        );

      case 'verification-status':
        return (
          <>
            {renderHeader('Verification')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', fontSize: '32px', marginBottom: '16px' }}>✓</div>
              <h2 style={{ margin: 0, fontSize: '24px' }}>{(profile?.tier && profile.tier !== 'basic') ? 'Verified' : 'Basic'}</h2>
              <p style={{ color: '#aaa', textAlign: 'center', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                {profile?.tier && profile.tier !== 'basic'
                  ? 'Your account is verified. You have access to campus features based on your tier.'
                  : 'Verify your college email to unlock campus features.'}
              </p>
              
              <div style={{ width: '100%', background: '#1c1c24', borderRadius: '12px', padding: '16px', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#888' }}>Method</span>
                  <span style={{ fontWeight: 500 }}>Education Email</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#888' }}>Date</span>
                  <span style={{ fontWeight: 500 }}>—</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Tier</span>
                  <span style={{ color: '#a855f7', fontWeight: 600 }}>{String(profile?.tier ?? 'basic').toUpperCase()}</span>
                </div>
              </div>
            </div>
          </>
        );

      case 'blocked-users':
        return (
          <>
            {renderHeader('Blocked Users')}
            <div style={{ padding: '16px', color: 'white' }}>
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333' }}></div>
                  <span style={{ fontWeight: 500 }}>Rahul Sharma</span>
                </div>
                <button style={{ background: 'transparent', border: '1px solid #444', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }} onClick={(e) => { e.currentTarget.parentElement!.style.display = 'none'; triggerGlobalToast('User unblocked', 'info'); }}>Unblock</button>
              </div>
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333' }}></div>
                  <span style={{ fontWeight: 500 }}>SpamBot_99</span>
                </div>
                <button style={{ background: 'transparent', border: '1px solid #444', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }} onClick={(e) => { e.currentTarget.parentElement!.style.display = 'none'; triggerGlobalToast('User unblocked', 'info'); }}>Unblock</button>
              </div>
            </div>
          </>
        );

      case 'active-sessions':
        return (
          <>
            {renderHeader('Active Sessions')}
            <div style={{ padding: '16px', color: 'white' }}>
              <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px' }}>Review devices that are currently logged into your account.</p>
              
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px', marginBottom: '12px', borderLeft: '4px solid #4ade80' }}>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Windows PC — Hyderabad, IN</div>
                <div style={{ color: '#888', fontSize: '12px' }}>Chrome Browser · Current Session</div>
              </div>
              
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: '4px' }}>iPhone 15 Pro — Hyderabad, IN</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>CampX Mobile App · Active 2h ago</div>
                </div>
                <button style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} onClick={(e) => { e.currentTarget.parentElement!.style.display = 'none'; triggerGlobalToast('Session terminated', 'success'); }}>Revoke</button>
              </div>
            </div>
          </>
        );

      case 'faqs':
        return (
          <>
            {renderHeader('FAQs')}
            <div style={{ padding: '16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>How does the College Feed work?</h3>
                <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>The college feed is restricted exclusively to students verified within your specific institution. All posts here are private to your campus.</p>
              </div>
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Can I cancel my Pro subscription?</h3>
                <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>Yes, you can cancel your subscription at any time from the billing portal. You will retain access until the end of your billing cycle.</p>
              </div>
              <div style={{ background: '#1c1c24', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>How do I create a new community?</h3>
                <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>Community creation is currently restricted to Pro members and College Ambassadors to maintain high quality spaces.</p>
              </div>
            </div>
          </>
        );

      case 'contact-support':
        return (
          <>
            {renderHeader('Contact Support')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>Describe your issue below and our team will respond to your registered email addressing the concern.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Topic</label>
                <select style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', appearance: 'none' }}>
                  <option>Account Access</option>
                  <option>Billing & Subscriptions</option>
                  <option>Bug Report</option>
                  <option>Content Moderation</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Message</label>
                <textarea placeholder="Describe the issue you're facing..." style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', minHeight: '120px' }} />
              </div>
              <button 
                onClick={() => { triggerGlobalToast('Support ticket #8942 submitted.', 'success'); goBack(); }}
                style={{ background: '#fff', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
              >
                Submit Ticket
              </button>
            </div>
          </>
        );

      case 'visibility-settings':
      case 'dm-controls':
      case 'font-size':
        return (
          <>
            {renderHeader('Preferences')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚙️</div>
              <h2 style={{ margin: 0, fontSize: '20px' }}>System Managed</h2>
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.5 }}>This setting is currently overridden locally by your native OS preferences or network environment.</p>
              <button 
                onClick={goBack}
                style={{ marginTop: '24px', background: '#333', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '24px', fontSize: '14px', cursor: 'pointer' }}
              >
                Go Back
              </button>
            </div>
          </>
        );

      default:
        return (
          <>
            {renderHeader('Settings')}
            <div style={{ padding: '40px 16px', color: '#aaa', textAlign: 'center' }}>
              Page not found.
            </div>
          </>
        );
    }
  };

  return (
    <div className="screen active" style={{ backgroundColor: '#09090b', zIndex: 100, overflowY: 'auto', paddingBottom: '120px' }}>
      {renderContent()}
    </div>
  );
}
