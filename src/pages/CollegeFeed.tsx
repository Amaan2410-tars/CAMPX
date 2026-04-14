import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { getSupabase } from '@/lib/supabase';
import { addPostComment, fetchPosts, getLikedSet, insertPost, repostPost, togglePostLike, type FeedPostRow } from '@/lib/campxFeed';
import '../index.css';

export default function CollegeFeed() {
  usePageTitle('College Feed');
  const navigate = useNavigate();
  const [postText, setPostText] = useState('');
  const [collegeName, setCollegeName] = useState('Loading...');
  const [tier, setTier] = useState<string>('basic');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPostRow[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setCollegeName('Your College');
      setErrMsg('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setErrMsg(null);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setErrMsg('Not signed in.');
        setLoading(false);
        return;
      }

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('tier, college')
        .eq('id', user.id)
        .maybeSingle();

      const t = String(profile?.tier ?? 'basic');
      const college = String(profile?.college ?? 'Your College');
      if (!cancelled) {
        setTier(t);
        setCollegeName(college);
      }

      if (t === 'basic') {
        triggerGlobalToast('Verify with your college email to access College Feed.', 'info');
        navigate('/explore-feed', { replace: true });
        if (!cancelled) setLoading(false);
        return;
      }

      if (pErr) {
        if (!cancelled) setErrMsg(pErr.message);
        if (!cancelled) setLoading(false);
        return;
      }

      const { data, error } = await fetchPosts(supabase, 'college');
      if (!cancelled) {
        if (error) setErrMsg(error.message);
        setPosts(data ?? []);
      }

      const ids = (data ?? []).map((p) => p.id);
      const likes = ids.length ? await getLikedSet(supabase, ids, user.id) : new Set<string>();
      if (!cancelled) setLikedSet(likes);

      if (!cancelled) setLoading(false);
    }

    void load();

    const channel = supabase
      .channel('campx-college-feed-react')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reposts' }, () => void load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const canEngage = useMemo(() => tier !== 'basic', [tier]);

  const handlePost = async () => {
    if (!postText.trim()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    const { error } = await insertPost(supabase, 'college', user.id, postText);
    if (error) {
      setErrMsg(error.message);
      return;
    }
    triggerGlobalToast('Posted to your campus.', 'success');
    setPostText('');
  };

  const handleAction = async (action: 'like' | 'comment' | 'repost', postId: string) => {
    if (!canEngage) {
      triggerGlobalToast('Verify your college email to engage.', 'info');
      navigate('/onboarding');
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    if (action === 'like') {
      const { error } = await togglePostLike(supabase, postId, user.id);
      if (error) setErrMsg(error.message);
      return;
    }
    if (action === 'comment') {
      const text = window.prompt('Write a comment:');
      if (text == null) return;
      const { error } = await addPostComment(supabase, postId, user.id, text);
      if (error) setErrMsg(error.message);
      return;
    }
    const { error } = await repostPost(supabase, postId, user.id);
    if (error) setErrMsg(error.message);
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
        <div className="campx-live-wrap" style={{padding: '0 16px'}}>
          {errMsg && (
            <div className="campx-feed-error" style={{display:'block', marginBottom: 10}}>{errMsg}</div>
          )}
          <div className="campx-composer" style={{ display: canEngage ? 'block' : 'none' }}>
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

        {loading && (
          <div style={{padding: '28px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
            Loading…
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
            <div style={{fontSize: '32px', marginBottom: '12px'}}>🎓</div>
            <div>No activity in your college yet.</div>
            <div style={{fontSize: '13px', marginTop: '4px'}}>Be the first to share something!</div>
          </div>
        )}
        {!loading && posts.map((p) => (
          <div key={p.id} className="post campx-post-live" style={{ marginTop: 12 }}>
            <div className="post-header">
              <div className="avatar" style={{background: 'linear-gradient(135deg,#2d1b4e,#3d2b6e)'}}>
                {(p.full_name || p.campx_id || 'S').slice(0,2).toUpperCase()}
              </div>
              <div className="post-meta">
                <div className="post-author">{p.full_name || p.campx_id || 'Student'}</div>
                <div className="post-info">
                  {p.college && <><span className="college-chip">{p.college}</span><span className="dot-sep">·</span></>}
                  <span>{new Date(p.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="post-text">{p.body}</div>
            <div className="campx-post-actions" style={{display:'flex', gap: 12, marginTop: 10, flexWrap:'wrap', alignItems:'center', fontSize: 13, color:'var(--text-muted)'}}>
              <button type="button" onClick={() => void handleAction('like', p.id)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer', padding:'4px 0'}}>
                ❤ {p.like_count + (likedSet.has(p.id) ? 1 : 0)}
              </button>
              <button type="button" onClick={() => void handleAction('comment', p.id)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer', padding:'4px 0'}}>
                💬 {p.comment_count}
              </button>
              <button type="button" onClick={() => void handleAction('repost', p.id)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer', padding:'4px 0'}}>
                🔁 {p.repost_count}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compose FAB */}
      <button className="compose-fab" onClick={() => canEngage ? triggerGlobalToast('Opening composer...', 'info') : navigate('/onboarding')}>
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>


    </>
  );
}
