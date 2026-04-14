import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { getSupabase } from '@/lib/supabase';
import { addPostComment, fetchPosts, getLikedSet, insertPost, repostPost, togglePostLike, type FeedPostRow } from '@/lib/campxFeed';
import '../index.css';

const FILTER_TABS = ['All', 'Tech', 'Arts', 'Sports', 'Management', 'Events'];

export default function ExploreFeed() {
  usePageTitle('Explore Feed');
  const navigate = useNavigate();
  const [postText, setPostText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [tier, setTier] = useState<string>('basic');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPostRow[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const canEngage = useMemo(() => tier !== 'basic', [tier]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setErrMsg('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setErrMsg(null);

      const { data: userData } = await sb.auth.getUser();
      const user = userData.user;
      if (!user) {
        if (!cancelled) setErrMsg('Not signed in.');
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: profile } = await sb
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) setTier(String(profile?.tier ?? 'basic'));

      const { data, error } = await fetchPosts(sb, 'explore');
      if (!cancelled) {
        if (error) setErrMsg(error.message);
        setPosts(data ?? []);
      }

      const ids = (data ?? []).map((p) => p.id);
      const likes = ids.length ? await getLikedSet(sb, ids, user.id) : new Set<string>();
      if (!cancelled) setLikedSet(likes);

      if (!cancelled) setLoading(false);
    }

    void load();
    const channel = sb
      .channel('campx-explore-feed-react')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reposts' }, () => void load())
      .subscribe();

    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, []);

  const handlePost = async () => {
    if (!postText.trim()) return;
    if (!canEngage) {
      setNudgeOpen(true);
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) return;
    const { error } = await insertPost(sb, 'explore', user.id, postText);
    if (error) {
      setErrMsg(error.message);
      return;
    }
    triggerGlobalToast('Posted to Explore.', 'success');
    setPostText('');
  };

  const handleAction = async (action: 'like' | 'comment' | 'repost', postId: string) => {
    if (!canEngage) {
      setNudgeOpen(true);
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) return;

    if (action === 'like') {
      const { error } = await togglePostLike(sb, postId, user.id);
      if (error) setErrMsg(error.message);
      return;
    }
    if (action === 'comment') {
      const text = window.prompt('Write a comment:');
      if (text == null) return;
      const { error } = await addPostComment(sb, postId, user.id, text);
      if (error) setErrMsg(error.message);
      return;
    }
    const { error } = await repostPost(sb, postId, user.id);
    if (error) setErrMsg(error.message);
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
          <div className="topbar-title">
            <img src="/campx-logo-512.png" alt="CampX" style={{ height: '24px', marginRight: '6px' }} />
          </div>
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

      {/* Basic mode banner */}
      {tier === 'basic' && (
        <div className="basic-banner">
          <div className="banner-icon">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="banner-text">
            <div className="banner-title">Basic tier</div>
            <div className="banner-sub">Verify your college email to unlock engagement</div>
          </div>
          <button className="banner-cta" onClick={() => setNudgeOpen(true)}>Verify</button>
        </div>
      )}

      <div className="feed" id="feed">
        {errMsg && (
          <div style={{ padding: '12px 16px', color: '#fca5a5' }}>{errMsg}</div>
        )}

        {/* Composer - hidden in Basic mode */}
        {tier !== 'basic' && (
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

        {loading && (
          <div style={{padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>Loading…</div>
        )}

        {!loading && posts.map((p) => (
          <div key={p.id} className="post campx-post-live" style={{position: 'relative'}}>
            <div className="post-header">
              <div className="avatar" style={{background: 'linear-gradient(135deg, #2d1b4e, #3d2b6e)'}}>
                {(p.full_name || p.campx_id || 'S').slice(0,2).toUpperCase()}
              </div>
              <div className="post-meta">
                <div className="post-author">
                  {p.full_name || p.campx_id || 'Student'}
                </div>
                <div className="post-info">
                  {p.college && <><span className="college-chip">{p.college}</span><span className="dot-sep">·</span></>}
                  <span>{new Date(p.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button type="button" className="post-more" aria-label="More">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <div className="post-text">{p.body}</div>

            <div className={`engage-bar ${tier === 'basic' ? 'engage-disabled' : ''}`} style={{position: 'relative'}}>
              <button type="button" className={`engage-btn ${likedSet.has(p.id) ? 'liked' : ''}`} onClick={() => void handleAction('like', p.id)}>
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {p.like_count + (likedSet.has(p.id) ? 1 : 0)}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn" onClick={() => void handleAction('comment', p.id)}>
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {p.comment_count}
              </button>
              <div className="engage-sep"></div>
              <button type="button" className="engage-btn" onClick={() => void handleAction('repost', p.id)}>
                <svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                {p.repost_count}
              </button>
              {tier === 'basic' && (
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

        {!loading && posts.length === 0 && (
          <div style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
            <div style={{fontSize: '32px', marginBottom: '12px'}}>🌍</div>
            <div>No posts in the global feed yet.</div>
          </div>
        )}
      </div>

      {/* Compose FAB — hidden in Basic mode */}
      {tier !== 'basic' && (
        <button className="compose-fab" onClick={() => triggerGlobalToast('Opening composer...', 'info')}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}



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
          <button className="nudge-btn" onClick={() => { setNudgeOpen(false); window.location.href = '/onboarding'; }}>Verify my college email</button>
          <button className="nudge-close" onClick={() => setNudgeOpen(false)}>Maybe later</button>
        </div>
      </div>
    </>
  );
}
