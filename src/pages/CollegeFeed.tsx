import React, { useState, useEffect } from 'react';
import { triggerGlobalToast } from '../components/AppLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePageTitle } from '../hooks/usePageTitle';
import { getSupabase } from '@/lib/supabase';
import '../index.css';

export default function CollegeFeed() {
  usePageTitle('College Feed');
  const [postText, setPostText] = useState('');
  const [collegeName, setCollegeName] = useState('Loading...');

  useEffect(() => {
    const fetchCollege = async () => {
      const supabase = getSupabase();
      if (!supabase) { setCollegeName('Your College'); return; }
      const { data } = await supabase.auth.getUser();
      setCollegeName(data?.user?.user_metadata?.college || 'Your College');
    };
    fetchCollege();
  }, []);

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
            <div className="cb-title">{collegeName}</div>
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

        {/* Dynamic campus posts */}
        <div style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
          <div style={{fontSize: '32px', marginBottom: '12px'}}>🎓</div>
          <div>No activity in your college yet.</div>
          <div style={{fontSize: '13px', marginTop: '4px'}}>Be the first to share something!</div>
        </div>
      </div>

      {/* Compose FAB */}
      <button className="compose-fab" onClick={() => triggerGlobalToast('Opening composer...', 'info')}>
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>


    </>
  );
}
