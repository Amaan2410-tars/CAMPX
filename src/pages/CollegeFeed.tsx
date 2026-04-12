import React, { useState } from 'react';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

export default function CollegeFeed() {
  const [postText, setPostText] = useState('');

  const handlePost = () => {
    if (!postText.trim()) return;
    triggerGlobalToast("Post published securely to campus!", 'success');
    setPostText('');
  };
  return (
    <>
      <div className="topbar college-topbar">
        <div className="cb-wrapper">
          <div className="cb-label">COLLEGE FEED</div>
          <div className="cb-row">
            <div className="cb-title">CBIT Hyderabad</div>
            <div className="cb-verified"></div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="icon-btn">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          </div>
          <div className="icon-btn cb-notif">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div className="cb-badge"></div>
          </div>
        </div>
      </div>

      <style>{`
        .stories-scroll {
          display: flex;
          overflow-x: auto;
          gap: 16px;
          padding: 16px 20px;
          scrollbar-width: none; /* Firefox */
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .stories-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .story-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          cursor: pointer;
        }
        .story-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(45deg, var(--accent), #f43f5e);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .story-ring.current-user {
          background: none;
          border: 2px dashed rgba(255, 255, 255, 0.2);
        }
        .story-ring.read {
          background: rgba(255, 255, 255, 0.1);
        }
        .story-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #2a2a32;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          border: 2px solid var(--bg);
        }
        .story-ring.current-user .story-avatar {
          border: none;
        }
        .story-name {
          font-size: 11px;
          color: var(--text-secondary);
          max-width: 68px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
      `}</style>

      <div className="stories-scroll">
        <div className="story-item">
          <div className="story-ring current-user">
            <div className="story-avatar">
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>
          <div className="story-name">Your story</div>
        </div>
        <div className="story-item">
          <div className="story-ring unread">
            <div className="story-avatar">RK</div>
          </div>
          <div className="story-name">Rahul K</div>
        </div>
        <div className="story-item">
          <div className="story-ring unread">
            <div className="story-avatar">PS</div>
          </div>
          <div className="story-name">Priya S</div>
        </div>
        <div className="story-item">
          <div className="story-ring read">
            <div className="story-avatar">AM</div>
          </div>
          <div className="story-name">Arjun M</div>
        </div>
        <div className="story-item">
          <div className="story-ring read">
            <div className="story-avatar">SV</div>
          </div>
          <div className="story-name">Sneha V</div>
        </div>
        <div className="story-item">
          <div className="story-ring read">
            <div className="story-avatar">KR</div>
          </div>
          <div className="story-name">Kiran R</div>
        </div>
      </div>

      <div className="feed" id="feed">
        <div id="campx-live-wrap" className="campx-live-wrap" style={{padding: '0 16px'}}>
          <div id="campx-feed-error" className="campx-feed-error" style={{display:"none"}}></div>
          <div className="campx-composer">
            <textarea 
              id="campx-post-body" 
              maxLength={2000} 
              placeholder="Share with your campus…"
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

        {/* Demo campus posts */}
        {[
          { author: 'Rahul K', initials: 'RK', tier: 'pro', time: '25m ago', text: 'Morning everyone! 🌅 DSA lab viva is this Friday — make sure you\'ve revised linked lists, trees and sorting. Good luck to everyone!', likes: 42, comments: 18, reposts: 3 },
          { author: 'Priya S', initials: 'PS', tier: 'verified', time: '1h ago', text: 'The new library wing looks amazing 📚 Finally got proper study pods with charging ports. Huge W for CBIT!', likes: 89, comments: 24, reposts: 7, hasImage: true },
          { author: 'Arjun Mehta', initials: 'AM', tier: 'verified', time: '2h ago', text: 'Lost my student ID card near the OAT area. Black lanyard with CBIT logo. If anyone finds it please DM me 🙏', likes: 12, comments: 8, reposts: 15 },
          { author: 'Sneha K', initials: 'SK', tier: 'plus', time: '3h ago', text: 'CN notes from last year\'s topper uploaded to the CSE Hub community channel! Check the Files tab 📝 #CBITNotes #Semester5', likes: 156, comments: 31, reposts: 42 },
        ].map((post, idx) => (
          <div key={idx} className="post">
            <div className="post-header">
              <div className="avatar" style={{background: 'linear-gradient(135deg, #2d1b4e, #3d2b6e)'}}>{post.initials}</div>
              <div className="post-meta">
                <div className="post-author">
                  {post.author}
                  <span className={`tier-badge ${post.tier === 'pro' ? 'badge-pro' : post.tier === 'plus' ? 'badge-plus' : 'badge-verified'}`}>{post.tier}</span>
                </div>
                <div className="post-info">
                  <span className="college-chip">CBIT</span>
                  <span className="dot-sep">·</span>
                  <span>{post.time}</span>
                </div>
              </div>
              <button type="button" className="post-more" aria-label="More">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <div className="post-text">{post.text}</div>
            {post.hasImage && (
              <div className="post-image">
                <div className="img-placeholder style1" style={{height: '160px'}}>
                  <div className="img-overlay"></div>
                  <div className="img-college-tag">CBIT Library Wing</div>
                </div>
              </div>
            )}
            <div className="engage-bar">
              <button type="button" className="engage-btn" onClick={() => triggerGlobalToast('Liked!', 'success')}>
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {post.likes}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {post.comments}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn">
                <svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                {post.reposts}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn" onClick={() => triggerGlobalToast('Post saved', 'success')}>
                <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compose FAB */}
      <button className="compose-fab" onClick={() => triggerGlobalToast('Opening composer...', 'info')}>
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Swipe hint */}
      <div className="swipe-hint">
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Explore</span>
      </div>
    </>
  );
}
