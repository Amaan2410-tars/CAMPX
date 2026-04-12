import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

export default function Settings() {
  const navigate = useNavigate();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    activity_status: true,
    hide_from_explore: false,
    two_factor: true,
    notif_messages: true,
    notif_community: true,
    notif_events: true
  });

  const handleToggle = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setToggles(prev => {
      const newState = !prev[key];
      triggerGlobalToast(`${key.replace('_', ' ')} turned ${newState ? 'ON' : 'OFF'}`, 'info');
      return { ...prev, [key]: newState };
    });
  };

  const handleStaticToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerGlobalToast("System alerts cannot be disabled.", "info");
  };

  const notifyNav = (feature: string) => {
    navigate(`/settings/${feature.toLowerCase().replace(/ /g, '-')}`);
  };

  const runLogout = () => {
    triggerGlobalToast("Logging out securely...", "update");
    setTimeout(() => {
      navigate('/onboarding');
    }, 800);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Settings</div>
        <div className="search-pill" onClick={() => triggerGlobalToast("Search active", "info")}>
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          <span>Search</span>
        </div>
      </div>

      <div className="section">
        <div className="section-label">Profile</div>
      </div>
      
      <div className="profile-card" role="button" tabIndex={0} onClick={() => navigate('/profile')}>
        <div className="pc-avatar"><div className="pc-ring"></div>YK</div>
        <div className="pc-info">
          <div className="pc-name">Yash Kumar</div>
          <div className="pc-meta"><span className="pc-tier">Pro</span><span className="pc-college">CBIT · CSE · 3rd Year</span></div>
        </div>
        <div className="pc-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>

      <div className="settings-scroll" id="settings-scroll">
        
        {/* Account Section */}
        <div id="sec-account">
          <div className="section">
            <div className="upgrade-banner">
              <div className="ub-icon">⚡</div>
              <div className="ub-text">
                <div className="ub-title">Upgrade your plan</div>
                <div className="ub-sub">Choose Pro or Plus and pay securely with Razorpay</div>
              </div>
              <button className="ub-btn" type="button" onClick={() => navigate('/user-tiers')}>View plans</button>
            </div>
            
            <div className="section-label">Account</div>
            <div className="settings-group">
              <div className="settings-row" onClick={() => notifyNav("Edit Profile")}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
                <div className="row-text"><div className="row-title">Edit profile</div><div className="row-sub">Name, bio, photo</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
              
              <div className="settings-row" onClick={() => navigate('/settings/change-email')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg></div>
                <div className="row-text"><div className="row-title">Change email</div><div className="row-sub">example@cbit.ac.in</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/change-password')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                <div className="row-text"><div className="row-title">Change password</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/verification-status')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div className="row-text"><div className="row-title">Verification status</div><div className="row-sub">Verified · Pro</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
            </div>
            
            <div className="settings-group">
              <div className="settings-row danger" role="button" tabIndex={0} onClick={runLogout}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
                <div className="row-text"><div className="row-title">Log out</div></div>
              </div>
              <div className="settings-row danger" onClick={() => triggerGlobalToast("Account marked for deletion. Email sent.", "update")}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></div>
                <div className="row-text"><div className="row-title">Delete account</div><div className="row-sub">Permanent</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div id="sec-billing">
          <div className="section">
            <div className="section-label">Billing</div>
            <div className="settings-group">
              <div className="settings-row" onClick={() => navigate('/user-tiers')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                <div className="row-text"><div className="row-title">Manage subscription</div><div className="row-sub">Pro tier · Active</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
              <div className="settings-row" onClick={() => navigate('/subscription-billing?plan=pro')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
                <div className="row-text"><div className="row-title">Payment history</div><div className="row-sub">Last payment: Apr 1, 2026</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div id="sec-privacy">
          <div className="section">
            <div className="section-label">Privacy</div>
            <div className="settings-group">
              <div className="settings-row" onClick={() => navigate('/settings/visibility-settings')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg></div>
                <div className="row-text"><div className="row-title">Profile visibility</div></div>
                <div className="row-right"><div className="row-value">Public</div><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/dm-controls')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                <div className="row-text"><div className="row-title">Who can DM me</div></div>
                <div className="row-right"><div className="row-value">Everyone</div><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={(e) => handleToggle(e, 'activity_status')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
                <div className="row-text"><div className="row-title">Activity status</div><div className="row-sub">Show when online</div></div>
                <div className="row-right"><div className={`toggle-track ${toggles.activity_status ? 'on' : ''}`}><div className="toggle-thumb"></div></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/blocked-users')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
                <div className="row-text"><div className="row-title">Blocked users</div><div className="row-sub">2 blocked</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={(e) => handleToggle(e, 'hide_from_explore')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></div>
                <div className="row-text"><div className="row-title">Hide from Explore Feed</div><div className="row-sub">Pro feature</div></div>
                <div className="row-right"><div className={`toggle-track ${toggles.hide_from_explore ? 'on' : ''}`}><div className="toggle-thumb"></div></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Display & UI Section */}
        <div id="sec-display">
          <div className="section">
            <div className="section-label">Display & UI</div>
            <div className="settings-group">
              <div className="settings-row" onClick={() => triggerGlobalToast("Theme toggling natively overridden by OS.", "info")}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg></div>
                <div className="row-text"><div className="row-title">Theme</div></div>
                <div className="row-right"><div className="row-value">Dark</div><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/font-size')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg></div>
                <div className="row-text"><div className="row-title">Font size</div></div>
                <div className="row-right"><div className="row-value">Medium</div><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={() => triggerGlobalToast("Requires Pro subscription.", "info")}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg></div>
                <div className="row-text"><div className="row-title">Custom colour theme</div><div className="row-sub">Pro feature</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div id="sec-security">
          <div className="section">
            <div className="section-label">Security</div>
            <div className="settings-group">
              <div className="settings-row" onClick={(e) => handleToggle(e, 'two_factor')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
                <div className="row-text"><div className="row-title">Two-factor authentication</div><div className="row-sub">{toggles.two_factor ? 'Enabled' : 'Disabled'}</div></div>
                <div className="row-right"><div className={`toggle-track ${toggles.two_factor ? 'on' : ''}`}><div className="toggle-thumb"></div></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/active-sessions')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                <div className="row-text"><div className="row-title">Active sessions</div><div className="row-sub">2 devices logged in</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div id="sec-notifs">
          <div className="section">
            <div className="section-label">Notifications</div>
            <div className="settings-group">
              <div className="settings-row" onClick={(e) => handleToggle(e, 'notif_messages')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
                <div className="row-text"><div className="row-title">Messages & DMs</div></div>
                <div className="row-right"><div className={`toggle-track ${toggles.notif_messages ? 'on' : ''}`}><div className="toggle-thumb"></div></div></div>
              </div>

              <div className="settings-row" onClick={(e) => handleToggle(e, 'notif_community')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div className="row-text"><div className="row-title">Community activity</div></div>
                <div className="row-right"><div className={`toggle-track ${toggles.notif_community ? 'on' : ''}`}><div className="toggle-thumb"></div></div></div>
              </div>

              <div className="settings-row" onClick={(e) => handleToggle(e, 'notif_events')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div className="row-text"><div className="row-title">Events & announcements</div></div>
                <div className="row-right"><div className={`toggle-track ${toggles.notif_events ? 'on' : ''}`}><div className="toggle-thumb"></div></div></div>
              </div>

              <div className="settings-row" onClick={handleStaticToggle}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div className="row-text"><div className="row-title">KYC & billing alerts</div><div className="row-sub">Always on · Cannot disable</div></div>
                <div className="row-right"><div className="toggle-track on"><div className="toggle-thumb"></div></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div id="sec-help">
          <div className="section">
            <div className="section-label">Help & Support</div>
            <div className="settings-group">
              <div className="settings-row" onClick={() => navigate('/settings/faqs')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <div className="row-text"><div className="row-title">FAQs</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>

              <div className="settings-row" onClick={() => navigate('/settings/contact-support')}>
                <div className="row-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                <div className="row-text"><div className="row-title">Contact support</div></div>
                <div className="row-right"><div className="row-chev"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
              </div>
            </div>

            <div className="version-info">CampX v1.0.0 · Build 2026.04.12<br />Made with ❤️ in Hyderabad</div>
          </div>
        </div>

      </div>
    </>
  );
}
