import React, { useState } from 'react';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

const FILTER_TABS = ['All', 'Tech', 'Arts', 'Sports', 'Management', 'Events'];

const DEMO_POSTS = [
  { id: '1', author: 'Karthik Menon', college: 'IIIT Hyderabad', tier: 'pro', time: '2h ago', text: 'Hot take: GitHub profile matters more than GPA for tech jobs in 2025. Recruiters skip resumes and go straight to your repos. Build in public. 🚀', likes: 234, comments: 67, reposts: 18, type: 'text' as const },
  { id: '2', author: 'Priya Sharma', college: 'CBIT Hyderabad', tier: 'verified', time: '4h ago', text: 'Just finished my first full-stack project using Next.js + Supabase. The DX is incredible compared to traditional backend setups. #WebDev #NextJS', likes: 156, comments: 42, reposts: 12, type: 'text' as const },
  { id: '3', author: 'CampX Spotlight', college: '', tier: 'brand', time: 'Sponsored', text: 'Internshala is hiring! 500+ internships open for engineering students. Apply before Dec 30. 🎯', likes: 89, comments: 15, reposts: 8, type: 'sponsored' as const },
  { id: '4', author: 'Rahul K', college: 'MJCET', tier: 'plus', time: '6h ago', text: 'Placement season is absolutely brutal this year — companies asking DSA + system design + HR all in one day 😮‍💨 #Placements2025', likes: 412, comments: 128, reposts: 45, type: 'text' as const },
  { id: '5', author: 'Sneha Verma', college: 'Osmania University', tier: 'verified', time: '8h ago', text: 'Campus photography club showcase was 🔥 Check out the shots from our annual exhibition! #CampusLife #Photography', likes: 198, comments: 34, reposts: 22, type: 'photo' as const },
];

export default function ExploreFeed() {
  const [postText, setPostText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isBasicMode, setIsBasicMode] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const handlePost = () => {
    if (!postText.trim()) return;
    triggerGlobalToast("Post published securely to entire platform!", 'success');
    setPostText('');
  };

  const toggleLike = (id: string) => {
    if (isBasicMode) { setNudgeOpen(true); return; }
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    if (isBasicMode) { setNudgeOpen(true); return; }
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); triggerGlobalToast('Removed from saved', 'info'); }
      else { next.add(id); triggerGlobalToast('Post saved', 'success'); }
      return next;
    });
  };

  const handleEngageAction = (action: string) => {
    if (isBasicMode) { setNudgeOpen(true); return; }
    triggerGlobalToast(`${action} action`, 'info');
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'pro': return <span className="tier-badge badge-pro">Pro</span>;
      case 'plus': return <span className="tier-badge badge-plus">Plus</span>;
      case 'verified': return <span className="tier-badge badge-verified">Verified</span>;
      case 'brand': return <span className="tier-badge" style={{background: 'var(--amber-dim)', color: 'var(--amber)'}}>Brand</span>;
      default: return null;
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-row">
          <div className="topbar-title">Explore</div>
          <div className="topbar-right">
            <div className="icon-btn" onClick={() => triggerGlobalToast('Search opened', 'info')}>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
            </div>
            <div className="icon-btn">
              <svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
            </div>
          </div>
        </div>
        <div className="filter-tabs">
          {FILTER_TABS.map(tab => (
            <div
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Demo toggle */}
      <div className="state-toggle">
        <span className="toggle-label">Demo:</span>
        <div className={`toggle-track ${!isBasicMode ? 'on' : ''}`} onClick={() => setIsBasicMode(!isBasicMode)}>
          <div className="toggle-thumb"></div>
        </div>
        <span className="toggle-state-label">{isBasicMode ? 'Basic' : 'Verified'}</span>
      </div>

      {/* Basic mode banner */}
      {isBasicMode && (
        <div className="basic-banner">
          <div className="banner-icon">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="banner-text">
            <div className="banner-title">Viewing as Basic user</div>
            <div className="banner-sub">Verify your college email to unlock engagement</div>
          </div>
          <button className="banner-cta" onClick={() => setNudgeOpen(true)}>Verify</button>
        </div>
      )}

      <div className="feed" id="feed">
        {/* Composer - hidden in Basic mode */}
        {!isBasicMode && (
          <div className="campx-live-wrap" style={{padding: '0 16px'}}>
            <div className="campx-composer">
              <textarea
                id="campx-post-body"
                maxLength={2000}
                placeholder="Post to Explore…"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              ></textarea>
              <button
                type="button"
                id="campx-post-submit"
                className="campx-post-submit"
                onClick={handlePost}
                disabled={!postText.trim()}
                style={{ opacity: postText.trim() ? 1 : 0.5 }}
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        {DEMO_POSTS.map(post => (
          <div key={post.id} className="post" style={{position: 'relative'}}>
            {post.type === 'sponsored' && (
              <div className="sponsored-tag">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Sponsored
              </div>
            )}
            <div className="post-header">
              <div className="avatar" style={{background: 'linear-gradient(135deg, #2d1b4e, #3d2b6e)'}}>
                {post.author.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div className="post-meta">
                <div className="post-author">
                  {post.author}
                  {getTierBadge(post.tier)}
                </div>
                <div className="post-info">
                  {post.college && <><span className="college-chip">{post.college}</span><span className="dot-sep">·</span></>}
                  <span>{post.time}</span>
                </div>
              </div>
              <button type="button" className="post-more" aria-label="More">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <div className="post-text">{post.text}</div>

            {post.type === 'photo' && (
              <div className="post-image">
                <div className="img-placeholder style1" style={{height: '170px'}}>
                  <div className="img-overlay"></div>
                  <div className="img-college-tag">{post.college}</div>
                </div>
              </div>
            )}

            <div className={`engage-bar ${isBasicMode ? 'engage-disabled' : ''}`} style={{position: 'relative'}}>
              <button type="button" className={`engage-btn ${likedPosts.has(post.id) ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {likedPosts.has(post.id) ? post.likes + 1 : post.likes}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn" onClick={() => handleEngageAction('Comment')}>
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {post.comments}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn" onClick={() => handleEngageAction('Repost')}>
                <svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                {post.reposts}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className={`engage-btn ${savedPosts.has(post.id) ? 'liked' : ''}`} onClick={() => toggleSave(post.id)}>
                <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
              {isBasicMode && (
                <div className="lock-overlay visible" onClick={() => setNudgeOpen(true)}>
                  <div className="lock-chip">
                    <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Verify to engage
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compose FAB — hidden in Basic mode */}
      {!isBasicMode && (
        <button className="compose-fab" onClick={() => triggerGlobalToast('Opening composer...', 'info')}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}

      {/* Swipe hint */}
      <div className="swipe-hint">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        <span>College</span>
      </div>

      {/* Nudge modal */}
      <div className={`nudge-overlay ${nudgeOpen ? 'open' : ''}`} onClick={() => setNudgeOpen(false)}>
        <div className="nudge-sheet" onClick={e => e.stopPropagation()}>
          <div className="nudge-handle"></div>
          <div className="nudge-icon">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="nudge-title">Verify to unlock</div>
          <div className="nudge-sub">Confirm your college email to like, comment, repost and connect with students across campuses.</div>
          <div className="unlock-list">
            <div className="unlock-item"><div className="unlock-dot"></div>Like & comment on posts</div>
            <div className="unlock-item"><div className="unlock-dot"></div>Access your college feed</div>
            <div className="unlock-item"><div className="unlock-dot"></div>DM other verified students</div>
            <div className="unlock-item"><div className="unlock-dot"></div>Join communities</div>
          </div>
          <button className="nudge-btn" onClick={() => { setNudgeOpen(false); triggerGlobalToast('Opening verification...', 'info'); }}>Verify my college email</button>
          <button className="nudge-close" onClick={() => setNudgeOpen(false)}>Maybe later</button>
        </div>
      </div>
    </>
  );
}
