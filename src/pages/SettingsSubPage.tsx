import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

export default function SettingsSubPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  // Return to settings natively
  const goBack = () => navigate('/settings');

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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2d2d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  YK
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Display Name</label>
                <input type="text" defaultValue="Yash Kumar" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Bio</label>
                <textarea defaultValue="Building things that matter 🛠️ · Open source · DSA grinder" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', minHeight: '100px' }} />
              </div>
              <button 
                onClick={() => { triggerGlobalToast('Profile updated successfully!', 'success'); goBack(); }}
                style={{ marginTop: '20px', background: '#fff', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </>
        );

      case 'change-email':
        return (
          <>
            {renderHeader('Change Email')}
            <div style={{ padding: '24px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Current Email</label>
                <input type="email" disabled defaultValue="example@cbit.ac.in" style={{ background: '#1c1c24', border: '1px solid #333', color: '#666', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>New Email</label>
                <input type="email" placeholder="new@example.edu" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              </div>
              <button 
                onClick={() => { triggerGlobalToast('Verification link sent to new email.', 'info'); goBack(); }}
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
              <input type="password" placeholder="Current Password" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              <input type="password" placeholder="New Password" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              <input type="password" placeholder="Confirm New Password" style={{ background: '#1c1c24', border: '1px solid #333', color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} />
              <button 
                onClick={() => { triggerGlobalToast('Password updated securely.', 'success'); goBack(); }}
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
              <h2 style={{ margin: 0, fontSize: '24px' }}>Fully Verified</h2>
              <p style={{ color: '#aaa', textAlign: 'center', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>Your educational identity is verified with CBIT. You have full access to campus feeds and communities.</p>
              
              <div style={{ width: '100%', background: '#1c1c24', borderRadius: '12px', padding: '16px', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#888' }}>Method</span>
                  <span style={{ fontWeight: 500 }}>Education Email</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#888' }}>Date</span>
                  <span style={{ fontWeight: 500 }}>Aug 12, 2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Tier</span>
                  <span style={{ color: '#a855f7', fontWeight: 600 }}>Pro Tier Active</span>
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
