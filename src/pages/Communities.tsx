import React, { useState, useRef, useEffect } from 'react';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

type ChannelTab = 'text' | 'announce' | 'files' | 'voice';

interface CommunityData {
  id: string;
  icon: string;
  name: string;
  type: 'college' | 'open';
  preview: string;
  time: string;
  unread?: number;
  members: number;
  online: number;
}

const COMMUNITIES: CommunityData[] = [
  { id: 'cse', icon: '💻', name: 'CSE Hub — CBIT', type: 'college', preview: 'Aryan: Has anyone started the OS assignment yet? The...', time: '2m', unread: 12, members: 248, online: 34 },
  { id: 'webdev', icon: '🌐', name: 'Web Dev India', type: 'open', preview: '📎 react-hooks-cheatsheet.pdf was shared', time: '18m', unread: 5, members: 1230, online: 89 },
  { id: 'hack', icon: '⚡', name: 'HackIndia Team', type: 'open', preview: "Priya: Let's sync at 8 PM today for the backend review", time: '1h', members: 64, online: 12 },
];

export default function Communities() {
  const [activeScreen, setActiveScreen] = useState<'list' | 'channel'>('list');
  const [activeCommunity, setActiveCommunity] = useState<CommunityData | null>(null);
  const [activeTab, setActiveTab] = useState<ChannelTab>('text');
  const [msgInput, setMsgInput] = useState('');
  const [inVoice, setInVoice] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', author: 'Rahul K', role: 'admin', initials: 'RK', time: '9:42 AM', text: 'Morning everyone! 🌅 Reminder — DSA lab viva is this Friday. Make sure you\'ve revised linked lists, trees and sorting algorithms. Good luck!', reactions: [{ emoji: '👍', count: 24, active: true }, { emoji: '🔥', count: 11, active: false }] },
    { id: '2', author: 'Priya S', role: 'mod', initials: 'PS', time: '10:15 AM', text: 'Has anyone solved the OS assignment question 4? The semaphore implementation is confusing me 😅', reactions: [] },
    { id: '3', author: 'Aryan M', role: '', initials: 'AM', time: '10:18 AM', text: '@Priya S Yes! Use a mutex with pthread_mutex_lock() — wrapping the critical section. I\'ll share my code snippet after lab.', reactions: [] },
    { id: '4', author: 'Aryan M', role: '', initials: '', time: '', text: 'Also check the NPTEL lecture 14 — it explains it way better than the textbook tbh', reactions: [], continued: true },
    { id: '5', author: 'Sneha K', role: '', initials: 'SK', time: '11:30 AM', text: 'Shared the CN notes from last year\'s topper — super helpful for the upcoming exam!', reactions: [{ emoji: '❤️', count: 31, active: true }, { emoji: '🙏', count: 18, active: false }, { emoji: '🔥', count: 9, active: false }], file: { name: 'CN_Notes_Final_2024.pdf', size: '3.2 MB · PDF' } },
    { id: '6', author: 'Vikram R', role: '', initials: 'VR', time: '2:05 PM', text: 'Anyone joining the voice channel for group study tonight? Planning 8–10 PM', reactions: [{ emoji: '✋', count: 7, active: false }] },
  ] as any[]);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const openCommunity = (c: CommunityData) => {
    setActiveCommunity(c);
    setActiveTab('text');
    setActiveScreen('channel');
  };

  const goBackToList = () => {
    setActiveScreen('list');
    setActiveCommunity(null);
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      author: 'You',
      role: '',
      initials: 'YK',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: msgInput,
      reactions: [],
    }]);
    setMsgInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleJoin = (name: string) => {
    triggerGlobalToast(`Joined "${name}" community!`, 'success');
  };

  return (
    <>
      <style>{`
        .screen { position: absolute; inset: 0; display: flex; flex-direction: column; transition: transform 0.42s cubic-bezier(0.77,0,0.175,1), opacity 0.3s ease; }
        .screen.active { transform: translateX(0); opacity: 1; }
        .screen.offright { transform: translateX(100%); opacity: 0; pointer-events: none; }
        .screen.offleft { transform: translateX(-30%); opacity: 0; pointer-events: none; }
      `}</style>

      {/* LIST SCREEN */}
      <div className={`screen ${activeScreen === 'list' ? 'active' : 'offleft'}`} id="list-screen">
        <div className="topbar">
          <div className="topbar-title">Communities</div>
          <div className="topbar-right">
            <div className="icon-btn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg></div>
            <div className="icon-btn"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          </div>
        </div>

        <div className="quota-bar">
          <div className="quota-text">Joined <strong>3 of 5</strong> communities</div>
          <div className="quota-track"><div className="quota-fill"></div></div>
          <div>Verified</div>
        </div>

        <div className="community-list">
          <div className="section-label">Your communities</div>

          {COMMUNITIES.map((c, i) => (
            <React.Fragment key={c.id}>
              <div className="community-item" onClick={() => openCommunity(c)} style={{cursor: 'pointer'}}>
                <div className="community-icon">{c.icon}</div>
                <div className="community-info">
                  <div className="community-name">
                    {c.name}
                    <span className={`comm-type-badge ${c.type === 'college' ? 'badge-college' : 'badge-open'}`}>{c.type === 'college' ? 'College' : 'Open'}</span>
                  </div>
                  <div className="community-preview">{c.preview}</div>
                </div>
                <div className="community-meta">
                  <div className="community-time">{c.time}</div>
                  {c.unread && <div className="unread-badge">{c.unread}</div>}
                </div>
              </div>
              {i < COMMUNITIES.length - 1 && <div className="community-divider"></div>}
            </React.Fragment>
          ))}

          <div className="section-label" style={{marginTop: '16px'}}>Discover communities</div>

          <div className="discover-card">
            <div className="discover-icon">🎨</div>
            <div className="discover-info">
              <div className="discover-name">Design &amp; UI Craft</div>
              <div className="discover-sub">Open · 2.4k members</div>
            </div>
            <button className="join-btn" onClick={() => handleJoin('Design & UI Craft')}>Join</button>
          </div>

          <div className="discover-card">
            <div className="discover-icon">🤖</div>
            <div className="discover-info">
              <div className="discover-name">AI &amp; ML Students</div>
              <div className="discover-sub">Open · 5.1k members</div>
            </div>
            <button className="join-btn" onClick={() => handleJoin('AI & ML Students')}>Join</button>
          </div>

          <div className="discover-card">
            <div className="discover-icon">📸</div>
            <div className="discover-info">
              <div className="discover-name">Campus Photography</div>
              <div className="discover-sub">College · CBIT · 312 members</div>
            </div>
            <button className="join-btn" onClick={() => triggerGlobalToast('Community limit reached (3 of 5)', 'info')}>Limit</button>
          </div>
        </div>
      </div>

      {/* CHANNEL SCREEN */}
      <div className={`screen ${activeScreen === 'channel' ? 'active' : 'offright'}`} id="channel-screen">
        <div className="ch-topbar">
          <div className="ch-topbar-row">
            <div className="back-btn" onClick={goBackToList} style={{cursor: 'pointer'}}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
            <div className="ch-comm-icon">{activeCommunity?.icon || '💻'}</div>
            <div className="ch-comm-info">
              <div className="ch-comm-name">{activeCommunity?.name || 'Community'}</div>
              <div className="ch-comm-members">
                <div className="online-dot"></div>
                <span>{activeCommunity?.members || 248} members · {activeCommunity?.online || 34} online</span>
              </div>
            </div>
            <div className="ch-topbar-icons">
              <div className="ch-icon-btn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg></div>
              <div className="ch-icon-btn"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            </div>
          </div>

          <div className="ch-tabs">
            <div className={`ch-tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              General
              {activeTab !== 'text' && activeCommunity?.unread && <span className="ch-unread">{activeCommunity.unread}</span>}
            </div>
            <div className={`ch-tab ${activeTab === 'announce' ? 'active' : ''}`} onClick={() => setActiveTab('announce')}>
              <svg viewBox="0 0 24 24"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
              Announcements
            </div>
            <div className={`ch-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Files
            </div>
            <div className={`ch-tab ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>
              <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
              Voice
            </div>
          </div>
        </div>

        {/* TEXT PANEL */}
        <div className="channel-panel" style={{display: activeTab === 'text' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
          <div className="announce-banner">
            <div className="announce-icon">📌</div>
            <div className="announce-text"><strong>Pinned:</strong> Mid-sem timetable released — check Files channel for PDF. DSA lab viva on Friday 10 AM.</div>
          </div>

          <div className="messages" id="messages" style={{flex: 1, overflowY: 'auto'}}>
            <div className="msg-date-divider">Today</div>
            {messages.map(m => (
              <div key={m.id} className={`msg ${m.continued ? 'continued' : ''}`}>
                <div className="msg-avatar">{m.initials}</div>
                <div className="msg-body">
                  {!m.continued && (
                    <div className="msg-header">
                      <span className="msg-author">{m.author}</span>
                      {m.role === 'admin' && <span className="msg-role role-admin">Admin</span>}
                      {m.role === 'mod' && <span className="msg-role role-mod">Mod</span>}
                      <span className="msg-time">{m.time}</span>
                    </div>
                  )}
                  <div className="msg-text">{m.text}</div>
                  {m.file && (
                    <div className="msg-file">
                      <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <div className="msg-file-info">
                        <div className="msg-file-name">{m.file.name}</div>
                        <div className="msg-file-size">{m.file.size}</div>
                      </div>
                    </div>
                  )}
                  {m.reactions?.length > 0 && (
                    <div className="msg-reactions">
                      {m.reactions.map((r: any, i: number) => (
                        <div key={i} className={`msg-react-pill ${r.active ? 'active' : ''}`}>
                          {r.emoji} <span className="msg-react-count">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>

          <div className="msg-input-bar">
            <div className="msg-input-wrap">
              <input className="msg-input" placeholder="Message #general" value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={handleKeyDown} />
              <div className="input-actions">
                <button className="input-action-btn" onClick={() => triggerGlobalToast('Attachment picker', 'info')}><svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
                <button className="input-action-btn" onClick={() => triggerGlobalToast('Emoji picker', 'info')}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
              </div>
              <button className="send-btn" onClick={sendMessage}>
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ANNOUNCEMENTS PANEL */}
        <div className="channel-panel" style={{display: activeTab === 'announce' ? 'block' : 'none', flex: 1, overflowY: 'auto', padding: '16px'}}>
          <div style={{background: 'var(--surface)', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '1px solid var(--border)'}}>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px'}}>Rahul K (Admin) · Nov 18</div>
            <div style={{fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px'}}>📢 Mid-sem timetable released</div>
            <div style={{fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5}}>The mid-semester examination timetable has been released. Check the Files channel for the PDF. DSA viva is this Friday at 10 AM in Lab 3.</div>
          </div>
          <div style={{background: 'var(--surface)', borderRadius: '14px', padding: '16px', border: '1px solid var(--border)'}}>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px'}}>Rahul K (Admin) · Nov 15</div>
            <div style={{fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px'}}>🎉 Welcome to CSE Hub!</div>
            <div style={{fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5}}>This is the official community for all CSE students at CBIT. Share notes, ask questions, collaborate on projects and keep up with department news here.</div>
          </div>
        </div>

        {/* FILES PANEL */}
        <div className="channel-panel" style={{display: activeTab === 'files' ? 'block' : 'none', flex: 1, overflowY: 'auto', padding: '16px'}}>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Recent files</div>
          {[
            { name: 'Mid_Sem_Timetable_Nov2025.pdf', size: '1.1 MB · Shared by Rahul K · 2 days ago', icon: 'file' },
            { name: 'CN_Notes_Final_2024.pdf', size: '3.2 MB · Shared by Sneha K · Today', icon: 'file' },
            { name: 'OS_Lab_Semaphore_Solution.c', size: '4 KB · Shared by Aryan M · Today', icon: 'code' },
            { name: 'DSA_Practice_Sheet_2025.xlsx', size: '890 KB · Shared by Priya S · Yesterday', icon: 'sheet' },
          ].map((f, i) => (
            <div key={i} className="msg-file" style={{marginBottom: '12px', cursor: 'pointer'}}>
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div className="msg-file-info">
                <div className="msg-file-name">{f.name}</div>
                <div className="msg-file-size">{f.size}</div>
              </div>
            </div>
          ))}
        </div>

        {/* VOICE PANEL */}
        <div className="voice-panel" style={{display: activeTab === 'voice' ? 'flex' : 'none', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
          <div className="voice-title">Study Room 🎧</div>
          <div className="voice-sub">{inVoice ? 5 : 4} members in voice</div>
          <div className="voice-members">
            {[{ initials: 'RK', name: 'Rahul K', speaking: true }, { initials: 'PS', name: 'Priya S' }, { initials: 'AM', name: 'Aryan M', muted: true }, { initials: 'SK', name: 'Sneha K' }, ...(inVoice ? [{ initials: 'YK', name: 'You (YK)', speaking: false }] : [])].map((m, i) => (
              <div key={i} className="voice-member">
                <div className={`voice-avatar ${m.speaking ? 'speaking' : ''} ${m.muted ? 'muted' : ''}`}>{m.initials}</div>
                <div className="voice-name">{m.name}</div>
              </div>
            ))}
          </div>
          <div className="voice-controls">
            <div className="v-ctrl"><svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div>
            <div className="v-ctrl"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></div>
            <div className="v-ctrl danger"><svg viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 16.29 7.62 14.48 6.29 12.37A19.79 19.79 0 0 1 3.22 3.74 2 2 0 0 1 5.21 1.55h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11z"/></svg></div>
          </div>
          <button 
            style={{marginTop: '20px', padding: '12px 32px', borderRadius: '14px', background: inVoice ? '#EF4444' : 'var(--accent)', border: 'none', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s, transform 0.1s'}} 
            onClick={() => setInVoice(!inVoice)}
          >
            {inVoice ? 'Disconnect' : 'Join voice channel'}
          </button>
        </div>
      </div>
    </>
  );
}
