import React, { useState, useRef, useEffect } from 'react';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

const CONVERSATIONS = [
  { id: 'neha', name: 'Neha Patel', initials: 'NP', college: 'CSE · CBIT', tier: 'pro', online: true, preview: 'You: That\'s amazing, congrats again! 🎉', time: '2m', unread: 0 },
  { id: 'arjun', name: 'Arjun Mehta', initials: 'AM', college: 'ECE · JNTU', tier: 'verified', online: true, preview: 'Arjun: Can you share the IoT sensor code?', time: '15m', unread: 3 },
  { id: 'priya', name: 'Priya Sharma', initials: 'PS', college: 'CSE · IIIT Hyd', tier: 'plus', online: false, preview: 'Priya: The hackathon results are out!! 🎊', time: '1h', unread: 1 },
  { id: 'karthik', name: 'Karthik Menon', initials: 'KM', college: 'IT · Osmania', tier: 'pro', online: false, preview: 'You: I\'ll check and get back to you', time: '3h', unread: 0 },
  { id: 'sneha', name: 'Sneha Verma', initials: 'SV', college: 'CSE · VNR', tier: 'verified', online: true, preview: '📸 Sent a photo', time: 'Yesterday', unread: 0 },
];

export default function Dms() {
  const [activeScreen, setActiveScreen] = useState<'inbox' | 'chat'>('inbox');
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0]);
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: 'Hey! Did you see my post on the feed? 👀', sender: 'them', timestamp: '10:04 AM', type: 'text' },
    { id: '2', text: 'Yes omg!! Google internship!! That\'s insane 🔥🔥', sender: 'me', timestamp: '10:06 AM', type: 'text' },
    { id: '3', text: 'Hahaha thank you!! It still feels surreal tbh 😭', sender: 'them', timestamp: '10:07 AM', type: 'text' },
    { id: '4', text: '4 rounds in one day was absolutely brutal though', sender: 'them', timestamp: '10:07 AM', type: 'text' },
    { id: '5', type: 'image', sender: 'them', timestamp: '10:08 AM', caption: 'My offer letter! 🎉' },
    { id: '6', type: 'file', sender: 'them', timestamp: '10:09 AM', fileName: 'Interview_Prep_Notes.pdf', fileSize: '2.4 MB' },
    { id: '7', text: 'That\'s amazing, congrats again! 🎉', sender: 'me', timestamp: '10:10 AM', type: 'text' },
  ]);
  const [inputText, setInputText] = useState('');
  const [typingVisible, setTypingVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [explodeConfig, setExplodeConfig] = useState<{ active: boolean; type: 'confetti' | 'balloons' | null }>({ active: false, type: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const triggerExplosion = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('congrats') || lower.includes('congratulations') || lower.includes('lfg')) {
      setExplodeConfig({ active: true, type: 'confetti' });
    } else if (lower.includes('happy birthday') || lower.includes('hbd')) {
      setExplodeConfig({ active: true, type: 'balloons' });
    } else return;
    setTimeout(() => setExplodeConfig({ active: false, type: null }), 3000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: any = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    if (replyTo) {
      newMsg.replyTo = { text: replyTo.text || replyTo.caption || replyTo.fileName, author: replyTo.sender === 'me' ? 'You' : activeConv.name };
    }
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setReplyTo(null);
    triggerExplosion(newMsg.text);
    // Simulate typing + response
    setTypingVisible(true);
    setTimeout(() => {
      setTypingVisible(false);
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const openChat = (conv: typeof CONVERSATIONS[0]) => {
    setActiveConv(conv);
    setActiveScreen('chat');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingVisible]);

  return (
    <>
      <style>{`
        .dms-wrapper {
          display: grid;
          flex: 1;
          width: 100%;
          min-height: 100%; /* Ensure it spans the mobile view */
        }
        .screen {
          grid-area: 1 / 1;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
          background-color: var(--bg, #000); 
          z-index: 10; 
          display: flex;
          flex-direction: column;
        }
        .screen.hidden-right { transform: translateX(100%); opacity: 0; pointer-events: none; }
        .screen.hidden-left { transform: translateX(-30%); opacity: 0; pointer-events: none; }
        .screen.active { transform: translateX(0); opacity: 1; pointer-events: auto; z-index: 20; }

        .chat-explode-container { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 999; overflow: hidden; }
        .particle { position: absolute; bottom: 10%; left: 50%; font-size: 2rem; animation: floatUp 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; opacity: 0; }
        @keyframes floatUp {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tx), -80vh) scale(1.5) rotate(var(--rot)); opacity: 0; }
        }
        .typing-indicator { display: flex; align-items: center; gap: 6px; padding: 8px 14px; margin: 0 16px 4px; align-self: flex-start; }
        .typing-indicator .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: typingBounce 1.4s infinite; }
        .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .reply-strip {
          display: flex; align-items: center; gap: 8px; padding: 8px 16px;
          background: var(--surface, #13131a); border-top: 1px solid var(--border);
          border-left: 3px solid var(--accent); font-size: 13px; color: var(--text-sub);
        }
        .reply-strip .reply-cancel { background: none; border: none; color: var(--text-muted); cursor: pointer; margin-left: auto; padding: 4px; }
        .msg-request-row {
          display: flex; align-items: center; gap: 12px; padding: 12px 20px;
          background: var(--surface); border-bottom: 1px solid var(--border); cursor: pointer;
        }
        .msg-request-row:hover { background: var(--surface2); }
        .voice-note-bubble { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--surface2); border-radius: 14px; }
        .voice-wave { display: flex; align-items: center; gap: 2px; height: 20px; }
        .voice-wave span { width: 3px; border-radius: 1px; background: var(--accent); animation: waveAnim 0.8s ease-in-out infinite alternate; }
        .voice-wave span:nth-child(2) { animation-delay: 0.1s; height: 16px; }
        .voice-wave span:nth-child(3) { animation-delay: 0.2s; height: 20px; }
        .voice-wave span:nth-child(4) { animation-delay: 0.3s; height: 12px; }
        .voice-wave span:nth-child(5) { animation-delay: 0.4s; height: 8px; }
        @keyframes waveAnim { from { height: 4px; } to { height: 20px; } }

        /* ADDED CLASSES FOR UI */
        .dms-wrapper {
          --bg: #030303;
          --surface: #111115;
          --surface2: #1e1e24;
          --border: #2a2a35;
          --border2: #3a3a45;
          --text: #ffffff;
          --text-sub: #d0d0d0;
          --text-muted: #888899;
          --accent: #6c63ff;
          --accent-dim: rgba(108, 99, 255, 0.15);
          color: var(--text);
        }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
        .topbar-title { font-size: 20px; font-weight: 700; color: var(--text); }
        .topbar-right { display: flex; gap: 16px; align-items: center; }
        .icon-btn svg { width: 24px; height: 24px; stroke: var(--text); fill: none; stroke-width: 2; cursor: pointer; transition: opacity 0.2s; }
        .icon-btn svg:hover { opacity: 0.8; }

        .e2ee-notice { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 12px; margin: 16px 20px; border-radius: 8px; background: rgba(108, 99, 255, 0.08); font-size: 11px; color: #a8a0ff; }
        .e2ee-notice svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; }
        
        .search-bar { padding: 0 20px 16px; }
        .search-wrap { display: flex; align-items: center; background: var(--surface2); border-radius: 12px; padding: 10px 14px; gap: 10px; border: 1px solid transparent; transition: border-color 0.2s; }
        .search-wrap:focus-within { border-color: var(--accent); }
        .search-wrap svg { width: 18px; height: 18px; stroke: var(--text-muted); fill: none; stroke-width: 2; }
        .search-wrap input { flex: 1; background: transparent; border: none; color: var(--text); outline: none; font-size: 14px; }
        .search-wrap input::placeholder { color: var(--text-muted); }
        
        .conv-list { flex: 1; overflow-y: auto; }
        .section-label { font-size: 13px; font-weight: 600; color: var(--text-muted); padding: 8px 20px 12px; }
        .conv-item { display: flex; align-items: center; padding: 12px 20px; gap: 12px; transition: background 0.2s; }
        .conv-item:hover { background: var(--surface); }
        .conv-avatar-wrap { position: relative; }
        .conv-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #2a2a35, #3a3a45); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: var(--text); }
        .online-ring { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: #4ADE80; border: 2px solid var(--bg); }
        .conv-body { flex: 1; overflow: hidden; }
        .conv-name-row { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
        .conv-name { font-weight: 600; font-size: 15px; color: var(--text); }
        .tier-dot { width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
        .dot-pro { background: #FFD700; }
        .dot-plus { background: #E5E4E2; }
        .dot-verified { background: #00B2FF; }
        .tier-dot::after { content: "✓"; font-size: 9px; color: #000; font-weight: bold; }
        .conv-college { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
        .conv-preview { font-size: 13px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .conv-time { font-size: 12px; color: var(--text-muted); }
        .conv-divider { height: 1px; background: var(--border); margin-left: 82px; }
        
        .chat-topbar { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); gap: 12px; }
        .back-btn svg { width: 24px; height: 24px; stroke: var(--text); fill: none; stroke-width: 2; transition: transform 0.2s; }
        .back-btn:hover svg { transform: translateX(-2px); }
        .chat-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2a2a35, #3a3a45); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; color: var(--text); position: relative; }
        .chat-online { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: #4ADE80; border: 2px solid var(--bg); }
        .chat-info { flex: 1; }
        .chat-name { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 6px; }
        .chat-status { font-size: 12px; color: var(--text-muted); }
        .chat-status.online { color: #4ADE80; }
        .chat-topbar-actions { display: flex; align-items: center; gap: 16px; }
        .chat-action-btn svg { width: 22px; height: 22px; stroke: var(--text-muted); fill: none; stroke-width: 2; cursor: pointer; transition: stroke 0.2s; }
        .chat-action-btn:hover svg { stroke: var(--text); }
        
        .date-div { text-align: center; font-size: 12px; color: var(--text-muted); margin: 20px 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .bubble-row { display: flex; gap: 10px; margin-bottom: 16px; padding: 0 16px; align-items: flex-end; }
        .bubble-row.me { flex-direction: row-reverse; }
        .mini-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--text-sub); flex-shrink: 0; }
        .bubble-group { display: flex; flex-direction: column; gap: 4px; max-width: 75%; }
        .bubble-row.me .bubble-group { align-items: flex-end; }
        .bubble-row.them .bubble-group { align-items: flex-start; }
        .bubble { padding: 10px 16px; border-radius: 20px; font-size: 14px; line-height: 1.4; word-break: break-word; }
        .bubble.them { background: var(--surface2); color: var(--text); border-bottom-left-radius: 4px; }
        .bubble.me { background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
        .msg-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
        
        .input-bar { border-top: 1px solid var(--border); padding: 12px 16px; background: var(--bg); }
        .input-row { display: flex; align-items: flex-end; gap: 10px; }
        .input-action { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .input-action:hover { color: var(--text); }
        .input-action svg { width: 24px; height: 24px; stroke: currentColor; fill: none; stroke-width: 2; }
        .input-wrap { flex: 1; background: var(--surface2); border-radius: 20px; padding: 2px 16px; display: flex; align-items: center; min-height: 40px; border: 1px solid transparent; transition: border-color 0.2s; }
        .input-wrap:focus-within { border-color: var(--accent); }
        .msg-input { width: 100%; background: transparent; border: none; color: var(--text); outline: none; font-size: 14px; padding: 8px 0; }
        .msg-input::placeholder { color: var(--text-muted); }
        .send-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--accent); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.2s, background 0.2s; }
        .send-btn:hover { background: #5a52e6; }
        .send-btn:active { transform: scale(0.95); }
        .send-btn svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; }
      `}</style>
      
      {/* INBOX SCREEN */}
      <div className="dms-wrapper">
        <div className={`screen ${activeScreen === 'inbox' ? 'active' : 'hidden-left'}`} style={{overflowY: 'auto'}} id="inbox">
        <div className="topbar">
          <div className="topbar-title">Messages</div>
          <div className="topbar-right">
            <div className="icon-btn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg></div>
            <div className="icon-btn"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          </div>
        </div>

        <div className="e2ee-notice">
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>All messages are <strong>end-to-end encrypted</strong></span>
        </div>

        {/* Message requests */}
        <div className="msg-request-row" onClick={() => triggerGlobalToast('Opening message requests...', 'info')}>
          <div style={{width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border2)'}}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--text-muted)" fill="none" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: '14px', fontWeight: 500, color: 'var(--text)'}}>Message requests</div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>2 pending requests</div>
          </div>
          <div className="unread-badge" style={{width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white'}}>2</div>
        </div>

        <div className="search-bar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
            <input type="text" placeholder="Search messages" />
          </div>
        </div>

        <div className="conv-list">
          <div className="section-label">Recent</div>
          
          {CONVERSATIONS.map(conv => (
            <React.Fragment key={conv.id}>
              <div className="conv-item" onClick={() => openChat(conv)} style={{cursor: 'pointer'}}>
                <div className="conv-avatar-wrap">
                  <div className="conv-avatar">{conv.initials}</div>
                  {conv.online && <div className="online-ring"></div>}
                </div>
                <div className="conv-body">
                  <div className="conv-name-row">
                    <span className="conv-name">{conv.name}</span>
                    <div className={`tier-dot ${conv.tier === 'pro' ? 'dot-pro' : conv.tier === 'plus' ? 'dot-plus' : 'dot-verified'}`}></div>
                  </div>
                  <div className="conv-college">{conv.college}</div>
                  <div className="conv-preview">{conv.preview}</div>
                </div>
                <div className="conv-meta">
                  <div className="conv-time">{conv.time}</div>
                  {conv.unread > 0 && <div className="unread-dot" style={{width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white'}}>{conv.unread}</div>}
                </div>
              </div>
              <div className="conv-divider"></div>
            </React.Fragment>
          ))}
        </div>

        {/* Mutual follow rule */}
        <div style={{padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5}}>
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="var(--text-muted)" fill="none" strokeWidth="1.5" style={{marginRight: '6px', verticalAlign: 'middle'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Only mutual follows can exchange messages
        </div>
      </div>

      {/* CHAT SCREEN */}
      <div className={`screen ${activeScreen === 'chat' ? 'active' : 'hidden-right'}`} id="chat" style={{display: 'flex', flexDirection: 'column'}}>
        
        {explodeConfig.active && (
          <div className="chat-explode-container">
            {Array.from({ length: 30 }).map((_, i) => {
              const emoji = explodeConfig.type === 'confetti' 
                ? ['🎉', '🎊', '✨', '🔥'][Math.floor(Math.random() * 4)] 
                : ['🎈', '🎂', '🥳', '🎁'][Math.floor(Math.random() * 4)];
              const tx = `${(Math.random() - 0.5) * 400}px`;
              const rot = `${(Math.random() - 0.5) * 360}deg`;
              const delay = `${Math.random() * 0.2}s`;
              return (
                <div key={i} className="particle" style={{ '--tx': tx, '--rot': rot, animationDelay: delay } as React.CSSProperties}>
                  {emoji}
                </div>
              );
            })}
          </div>
        )}

        <div className="chat-topbar" style={{flexShrink: 0}}>
          <div className="back-btn" onClick={() => setActiveScreen('inbox')} style={{cursor: 'pointer'}}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
          <div className="chat-avatar" id="chat-avatar">{activeConv.initials}{activeConv.online && <div className="chat-online"></div>}</div>
          <div className="chat-info">
            <div className="chat-name" id="chat-name">{activeConv.name} <span style={{fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'var(--accent-dim)', color: '#a89fff', fontWeight: 600, textTransform: 'uppercase'}}>{activeConv.tier}</span></div>
            <div className={`chat-status ${activeConv.online ? 'online' : ''}`} id="chat-status">{activeConv.online ? 'Online now' : 'Last seen recently'}</div>
          </div>
          <div className="chat-topbar-actions">
            <div className="chat-action-btn" onClick={() => triggerGlobalToast('Starting voice call...', 'info')}><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <div className="chat-action-btn" onClick={() => triggerGlobalToast('Starting video call...', 'info')}><svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>
            <div className="chat-action-btn"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></div>
          </div>
        </div>

        {/* E2EE notice in chat */}
        <div className="e2ee-notice" style={{margin: '0', borderRadius: 0, borderBottom: '1px solid var(--border)'}}>
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Messages are <strong>end-to-end encrypted</strong></span>
        </div>

        <div className="chat-messages" id="chat-messages" style={{flexGrow: 1, overflowY: 'auto', paddingBottom: '20px'}}>
          <div className="date-div">Today</div>
          
          {messages.map((m: any) => (
            <div key={m.id} className={`bubble-row ${m.sender}`} onClick={m.sender === 'them' ? () => setReplyTo(m) : undefined} style={m.sender === 'them' ? {cursor: 'pointer'} : undefined}>
              {m.sender === 'them' && <div className="mini-avatar">{activeConv.initials}</div>}
              <div className="bubble-group">
                {m.replyTo && (
                  <div style={{fontSize: '11px', color: 'var(--text-muted)', padding: '4px 10px', borderLeft: '2px solid var(--accent)', marginBottom: '4px', background: 'rgba(108,99,255,0.05)', borderRadius: '4px'}}>
                    <strong>{m.replyTo.author}:</strong> {m.replyTo.text?.slice(0, 50)}{m.replyTo.text?.length > 50 ? '...' : ''}
                  </div>
                )}
                {m.type === 'text' && <div className={`bubble ${m.sender}`}>{m.text}</div>}
                {m.type === 'image' && (
                  <div className={`bubble ${m.sender}`} style={{padding: '4px'}}>
                    <div style={{width: '200px', height: '140px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a2e4a, #2a4a6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)'}}>📸 Photo</div>
                    {m.caption && <div style={{fontSize: '13px', marginTop: '6px', padding: '0 6px'}}>{m.caption}</div>}
                  </div>
                )}
                {m.type === 'file' && (
                  <div className={`bubble ${m.sender}`} style={{padding: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <div>
                        <div style={{fontSize: '13px', fontWeight: 500}}>{m.fileName}</div>
                        <div style={{fontSize: '11px', opacity: 0.6}}>{m.fileSize}</div>
                      </div>
                    </div>
                  </div>
                )}
                {m.type === 'voice' && (
                  <div className={`bubble ${m.sender}`} style={{padding: '10px'}}>
                    <div className="voice-note-bubble">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <div className="voice-wave">
                        <span style={{height: '8px'}}></span>
                        <span style={{height: '16px'}}></span>
                        <span style={{height: '20px'}}></span>
                        <span style={{height: '12px'}}></span>
                        <span style={{height: '8px'}}></span>
                      </div>
                      <span style={{fontSize: '11px', opacity: 0.6}}>0:14</span>
                    </div>
                  </div>
                )}
                <div className="msg-meta">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typingVisible && (
            <div className="bubble-row them">
              <div className="mini-avatar">{activeConv.initials}</div>
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply strip */}
        {replyTo && (
          <div className="reply-strip">
            <div style={{flex: 1}}>
              <div style={{fontSize: '11px', color: 'var(--accent)', fontWeight: 600}}>Replying to {replyTo.sender === 'me' ? 'yourself' : activeConv.name}</div>
              <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px'}}>{(replyTo.text || replyTo.caption || replyTo.fileName)?.slice(0, 60)}</div>
            </div>
            <button className="reply-cancel" onClick={() => setReplyTo(null)}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        <div className="input-bar" style={{flexShrink: 0}}>
          <div className="input-row">
            <button className="input-action" onClick={() => triggerGlobalToast('Opening attachments...', 'info')}><svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
            <div className="input-wrap">
              <input 
                className="msg-input" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeConv.name}... (Try 'congrats' or 'happy birthday')`}
              />
            </div>
            {inputText.trim() ? (
              <button className="send-btn" onClick={handleSend}>
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            ) : (
              <button className="send-btn" onClick={() => triggerGlobalToast('Recording voice message...', 'info')} style={{background: 'var(--surface2)', border: '1px solid var(--border2)'}}>
                <svg viewBox="0 0 24 24" style={{stroke: 'var(--text-sub)'}}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
