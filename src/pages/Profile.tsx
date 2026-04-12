import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [otherActiveTab, setOtherActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(true);
  const [showOtherProfile, setShowOtherProfile] = useState(false);
  const [activeTheme, setActiveTheme] = useState('purple');

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    triggerGlobalToast(isFollowing ? "Unfollowed Neha Patel" : "Following Neha Patel", 'info');
  };

  const changeTheme = (color: string) => {
    setActiveTheme(color);
    triggerGlobalToast(`Theme changed to ${color}`, 'success');
  };

  return (
    <>
      


  
  <div className={`screen ${showOtherProfile ? 'offleft' : 'active'}`} id="own-profile" style={{overflowY: 'auto', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transition: 'transform 0.42s cubic-bezier(0.77,0,0.175,1), opacity 0.3s ease', transform: showOtherProfile ? 'translateX(-30%)' : 'translateX(0)', opacity: showOtherProfile ? 0 : 1, pointerEvents: showOtherProfile ? 'none' : 'auto' as any}}>

    <div className="topbar">
      <div className="topbar-title">Profile</div>
      <div className="topbar-right">
        <div className="icon-btn" onClick={() => navigate('/settings')} style={{cursor: 'pointer'}} title="Settings" aria-label="Settings">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        <div className="icon-btn" onClick={() => setShowOtherProfile(true)} style={{cursor: 'pointer'}} title="View other profile">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
      </div>
    </div>

    <div className="profile-scroll">

      
      <div className="profile-hero">
        <div className="hero-glow"></div>

        <div className="avatar-wrap">
          <div className="profile-avatar" >
            <div className="avatar-ring"></div>
            YK
          </div>
          <div className="edit-avatar-btn">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
        </div>

        <div className="profile-name">Yash Kumar</div>

        <div className="tier-row">
          <div className="tier-badge-main badge-pro-main">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Pro
          </div>
          <div className="profile-badge">🏆 Achiever</div>
          <div className="profile-badge">⚡ Top Poster</div>
        </div>

        <div className="college-tag">
          <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          CBIT Hyderabad · CSE · 3rd Year
        </div>

        <div className="profile-bio">
          Building things that matter 🛠️ · Open source · DSA grinder · <span className="accent">@Google</span> intern aspirant · Coffee-fuelled debugger ☕
        </div>

        
        <div className="scheme-row" >
          <span className="scheme-label">Theme:</span>
          <div className={`scheme-dot ${activeTheme === 'purple' ? 'active' : ''}`} style={{background: '#6c63ff'}} title="Purple" onClick={() => changeTheme('purple')}></div>
          <div className={`scheme-dot ${activeTheme === 'teal' ? 'active' : ''}`} style={{background: '#2dd4bf'}} title="Teal" onClick={() => changeTheme('teal')}></div>
          <div className={`scheme-dot ${activeTheme === 'amber' ? 'active' : ''}`} style={{background: '#fbbf24'}} title="Amber" onClick={() => changeTheme('amber')}></div>
          <div className={`scheme-dot ${activeTheme === 'coral' ? 'active' : ''}`} style={{background: '#f97316'}} title="Coral-Pink" onClick={() => changeTheme('coral')}></div>
          <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>Pro feature</span>
        </div>

        
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-num">48</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">1.2k</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">384</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">7</div>
            <div className="stat-label">Wins</div>
          </div>
        </div>

        
        <div className="profile-actions">
          <button className="action-btn btn-edit" onClick={() => triggerGlobalToast("Opening Edit Profile flow...", "update")}>
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit profile
          </button>
          <button className="action-btn btn-share" onClick={() => triggerGlobalToast("Profile link copied to clipboard!", "success")}>
            <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>

        
        <div className="upgrade-nudge" id="upgrade-nudge" onClick={() => navigate('/user-tiers')}>
          <div className="upgrade-icon">✨</div>
          <div className="upgrade-text">
            <div className="upgrade-title">Upgrade to Pro</div>
            <div className="upgrade-sub">Customise theme, create communities & more</div>
          </div>
          <div className="upgrade-arrow">›</div>
        </div>

      </div>

      
      <div className="content-tabs">
        <div className={`content-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Posts
        </div>
        <div className={`content-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Activity
        </div>
        <div className={`content-tab ${activeTab === 'wins' ? 'active' : ''}`} onClick={() => setActiveTab('wins')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          Wins
        </div>
        <div className={`content-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Saved
        </div>
      </div>

      
      <div id="tab-grid" style={{ display: activeTab === 'posts' ? 'block' : 'none' }}>
        <div className="posts-grid">
          
          <div className="grid-item" >
            <div className="grid-item-inner" ></div>
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          </div>
          <div className="grid-item grid-accomplish" >
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div>
            <div className="trophy">🏆</div>
            <div className="mini-label">Google Intern</div>
          </div>
          <div className="grid-item" >
            <div className="grid-item-inner" ></div>
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          </div>
          
          <div className="grid-item" >
            <div className="grid-item-inner" ></div>
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          </div>
          <div className="grid-item" >
            <div className="grid-item-inner" ></div>
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          </div>
          <div className="grid-item grid-accomplish" >
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div>
            <div className="trophy">🎯</div>
            <div className="mini-label">Hackathon Winner</div>
          </div>
          
          <div className="grid-item" >
            <div className="grid-item-inner" ></div>
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          </div>
          <div className="grid-item" >
            <div className="grid-item-inner" ></div>
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          </div>
          <div className="grid-item grid-accomplish" >
            <div className="grid-overlay"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div>
            <div className="trophy">📜</div>
            <div className="mini-label">AWS Certified</div>
          </div>
        </div>
      </div>

      
      <div id="tab-list" style={{ display: activeTab === 'activity' ? 'block' : 'none' }}>
        <div className="list-post">
          <div className="list-post-text">Placement season is absolutely brutal this year — companies asking DSA + system design + HR all in one day 😮‍💨 <span >#Placements2025</span></div>
          <div className="list-post-meta">
            <div className="list-post-stat"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 176</div>
            <div className="list-post-stat"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 63</div>
            <div className="list-post-stat" >12h ago</div>
          </div>
        </div>
        <div className="list-post">
          <div className="list-post-text">Hacky night in the lab — IoT sensor readings are finally stable after 6 hours 🛠️ Presenting next Thursday. <span >#IoT #ECE</span></div>
          <div className="list-post-meta">
            <div className="list-post-stat"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 87</div>
            <div className="list-post-stat"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 22</div>
            <div className="list-post-stat" >Yesterday</div>
          </div>
        </div>
      </div>

      
      <div id="tab-wins" style={{ display: activeTab === 'wins' ? 'flex' : 'none', flexDirection: 'column', gap: '16px', padding: '0 16px', paddingBottom: '80px' }}>
        <div className="accomplish-item">
          <div className="acc-icon">🏆</div>
          <div className="acc-info">
            <div className="acc-title">Google SWE Internship 2025</div>
            <div className="acc-org">Google LLC · Summer 2025 · ₹1.2L/month</div>
            <div className="acc-investigate"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg> View how-to</div>
          </div>
        </div>
        <div className="accomplish-item">
          <div className="acc-icon">🎯</div>
          <div className="acc-info">
            <div className="acc-title">HackIndia 2024 — 1st Place</div>
            <div className="acc-org">HackIndia National Hackathon · ₹50,000 Prize</div>
            <div className="acc-investigate"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg> View how-to</div>
          </div>
        </div>
        <div className="accomplish-item">
          <div className="acc-icon">📜</div>
          <div className="acc-info">
            <div className="acc-title">AWS Certified Solutions Architect</div>
            <div className="acc-org">Amazon Web Services · Nov 2024</div>
            <div className="acc-investigate"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg> View how-to</div>
          </div>
        </div>
      </div>

      
      <div id="tab-saved" style={{ display: activeTab === 'saved' ? 'block' : 'none' }}>
        <div className="list-post">
          <div className="list-post-text">Hot take: GitHub profile matters more than GPA for tech jobs in 2025. Recruiters skip resumes and go straight to your repos. Build in public.</div>
          <div className="list-post-meta">
            <div className="list-post-stat" >Karthik Menon · IIIT Hyd</div>
            <div className="list-post-stat" >Saved Mon</div>
          </div>
        </div>
      </div>

    </div>

  </div>

  
  <div className={`screen ${showOtherProfile ? 'active' : 'offright'}`} id="other-profile" style={{overflowY: 'auto', background: 'var(--bg)', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transition: 'transform 0.42s cubic-bezier(0.77,0,0.175,1), opacity 0.3s ease', transform: showOtherProfile ? 'translateX(0)' : 'translateX(100%)', opacity: showOtherProfile ? 1 : 0, pointerEvents: showOtherProfile ? 'auto' : 'none' as any}}>

    <div className="other-topbar">
      <div className="back-btn" onClick={() => setShowOtherProfile(false)} style={{cursor: 'pointer'}}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
      <div className="other-topbar-name">Neha Patel</div>
      <div className="other-topbar-icons">
        <div className="sm-icon-btn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg></div>
        <div className="sm-icon-btn"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></div>
      </div>
    </div>

    <div className="other-scroll">

      <div className="other-hero">
        <div className="other-hero-glow"></div>

        <div className="other-avatar" >
          <div className="other-avatar-ring" ></div>
          NP
        </div>

        <div className="other-name">Neha Patel</div>

        <div className="other-badges">
          <div className="tier-badge-main badge-pro-main">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Pro
          </div>
          <div className="profile-badge">🏆 Achiever</div>
        </div>

        <div className="other-college">
          <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          CBIT Hyderabad · CSE · 3rd Year
        </div>

        <div className="other-bio">
          CSE student passionate about ML & system design ✨ Google SWE Intern 2025 · Building in public · Open to collabs
        </div>

        <div className="other-stats-row">
          <div className="other-stat">
            <div className="other-stat-num">62</div>
            <div className="other-stat-label">Posts</div>
          </div>
          <div className="other-stat">
            <div className="other-stat-num">3.4k</div>
            <div className="other-stat-label">Followers</div>
          </div>
          <div className="other-stat">
            <div className="other-stat-num">291</div>
            <div className="other-stat-label">Following</div>
          </div>
          <div className="other-stat">
            <div className="other-stat-num">4</div>
            <div className="other-stat-label">Wins</div>
          </div>
        </div>

        
        <div className="mutual-row">
          <svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Mutual follow — you can DM each other
        </div>

        
        <div className="other-actions">
          <button className={`btn-follow ${isFollowing ? 'following' : ''}`} onClick={toggleFollow}>
            {isFollowing ? <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> : <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="btn-msg" onClick={() => triggerGlobalToast("Opening message thread...", "success")}>
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Message
          </button>
        </div>

      </div>

      
      <div className="other-tabs">
        <div className={`other-tab ${otherActiveTab === 'posts' ? 'active' : ''}`} onClick={() => setOtherActiveTab('posts')}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Posts
        </div>
        <div className={`other-tab ${otherActiveTab === 'wins' ? 'active' : ''}`} onClick={() => setOtherActiveTab('wins')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          Wins
        </div>
        <div className={`other-tab ${otherActiveTab === 'about' ? 'active' : ''}`} onClick={() => setOtherActiveTab('about')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          About
        </div>
      </div>

      
      <div id="tab-ogrid" style={{ display: otherActiveTab === 'posts' ? 'block' : 'none' }}>
        <div className="posts-grid">
          <div className="grid-item"><div className="grid-item-inner" ></div><div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div></div>
          <div className="grid-item grid-accomplish"><div className="grid-overlay"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div><div className="trophy">🏆</div><div className="mini-label">Google Intern</div></div>
          <div className="grid-item"><div className="grid-item-inner" ></div><div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div></div>
          <div className="grid-item"><div className="grid-item-inner" ></div><div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div></div>
          <div className="grid-item grid-accomplish"><div className="grid-overlay"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div><div className="trophy">🎯</div><div className="mini-label">ML Project</div></div>
          <div className="grid-item"><div className="grid-item-inner" ></div><div className="grid-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div></div>
        </div>
      </div>

      
      <div id="tab-owins" style={{ display: otherActiveTab === 'wins' ? 'flex' : 'none', flexDirection: 'column', gap: '16px', padding: '16px', paddingBottom: '80px' }}>
        <div className="accomplish-item">
          <div className="acc-icon">🏆</div>
          <div className="acc-info">
            <div className="acc-title">Google SWE Internship 2025</div>
            <div className="acc-org">Google LLC · Summer 2025</div>
            <div className="acc-investigate"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg> Investigate — how she did it</div>
          </div>
        </div>
        <div className="accomplish-item">
          <div className="acc-icon">🤖</div>
          <div className="acc-info">
            <div className="acc-title">Best ML Project — InnovateFest 2024</div>
            <div className="acc-org">CBIT Annual Tech Fest</div>
            <div className="acc-investigate"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg> Investigate — how she did it</div>
          </div>
        </div>
      </div>

      
      <div id="tab-oabout" style={{ display: otherActiveTab === 'about' ? 'block' : 'none', padding: '16px', paddingBottom: '80px' }}>
        <div>
          <div ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span >CBIT Hyderabad</span></div>
          <div ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg><span >B.Tech CSE · 3rd Year</span></div>
          <div ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span >Verified student</span></div>
          <div ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span >Joined CampX · August 2025</span></div>
        </div>
      </div>

  </div>
  </div>
</>
  );
}
