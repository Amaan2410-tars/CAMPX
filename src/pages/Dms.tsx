import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import CallWindow from '../components/CallWindow';
import { usePageTitle } from '../hooks/usePageTitle';
import { getSupabase } from '@/lib/supabase';
import { decryptFromSenderEphemeral, decryptPrivateKeyBackup, encryptForRecipient, encryptPrivateKeyBackup, generateIdentityKeypair } from '@/lib/e2ee';
import '../index.css';

const CONVERSATIONS: any[] = [];

export default function Dms() {
  usePageTitle('Messages');
  const navigate = useNavigate();
  const [tier, setTier] = useState<string>('basic');
  const [blocked, setBlocked] = useState<boolean>(false); // Basic blocked only
  const [myPrivJwk, setMyPrivJwk] = useState<JsonWebKey | null>(null);
  const [myPubJwk, setMyPubJwk] = useState<JsonWebKey | null>(null);
  const [needsRestore, setNeedsRestore] = useState<boolean>(false);
  const [restorePass, setRestorePass] = useState<string>('');
  const [backupStatus, setBackupStatus] = useState<'unknown' | 'missing' | 'present'>('unknown');
  const [backupPass, setBackupPass] = useState<string>('');
  const [peerId, setPeerId] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [thread, setThread] = useState<Array<{ id: string; sender_id: string; created_at: string; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'inbox' | 'chat'>('inbox');
  const [activeConv, setActiveConv] = useState<{id: string, name: string, initials: string, online?: boolean, tier?: string} | null>(null);
  const [activeCall, setActiveCall] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingVisible, setTypingVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [explodeConfig, setExplodeConfig] = useState<{ active: boolean; type: 'confetti' | 'balloons' | null }>({ active: false, type: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setBlocked(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data: userData } = await sb.auth.getUser();
      const user = userData.user;
      if (!user) {
        setBlocked(true);
        return;
      }
      const { data: profile } = await sb
        .from('profiles')
        .select('tier, dm_identity_pub_jwk')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const t = String(profile?.tier ?? 'basic');
      setTier(t);
      if (t === 'basic') {
        setBlocked(true);
        triggerGlobalToast('Verify with your college email to unlock DMs.', 'info');
      } else {
        setBlocked(false);
        setErr(null);

        // Identity keypair: private stays client-side; public stored in profiles.dm_identity_pub_jwk
        const privKeyRaw = localStorage.getItem('campx_dm_identity_priv_jwk');
        const pubKeyRaw = localStorage.getItem('campx_dm_identity_pub_jwk');

        let privJwk: JsonWebKey | null = privKeyRaw ? JSON.parse(privKeyRaw) : null;
        let pubJwk: JsonWebKey | null = pubKeyRaw ? JSON.parse(pubKeyRaw) : null;

        // If missing local private key, attempt restore from encrypted backup.
        if (!privJwk || !pubJwk) {
          const { data: backup } = await sb
            .from('dm_key_backups')
            .select('kdf, salt_b64, nonce_b64, ciphertext_b64')
            .eq('user_id', user.id)
            .maybeSingle();
          if (backup) {
            setBackupStatus('present');
            setNeedsRestore(true);
            // Wait for user to enter passphrase in UI; do not generate a new keypair.
            return;
          }
          setBackupStatus('missing');
          // No backup exists: generate new identity keypair, then prompt user to back it up.
          const kp = await generateIdentityKeypair();
          privJwk = kp.privateJwk;
          pubJwk = kp.publicJwk;
          localStorage.setItem('campx_dm_identity_priv_jwk', JSON.stringify(privJwk));
          localStorage.setItem('campx_dm_identity_pub_jwk', JSON.stringify(pubJwk));
        } else {
          const { data: backup } = await sb
            .from('dm_key_backups')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();
          setBackupStatus(backup ? 'present' : 'missing');
        }

        setMyPrivJwk(privJwk);
        setMyPubJwk(pubJwk);

        const dbPub = profile?.dm_identity_pub_jwk as JsonWebKey | null | undefined;
        if (!dbPub) {
          await sb.from('profiles').update({ dm_identity_pub_jwk: pubJwk }).eq('id', user.id);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const canUse = useMemo(() => !blocked && Boolean(myPrivJwk && myPubJwk), [blocked, myPrivJwk, myPubJwk]);

  async function restoreFromBackup(): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    setErr(null);
    setLoading(true);
    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) {
      setErr('Not signed in.');
      setLoading(false);
      return;
    }
    const { data: backup } = await sb
      .from('dm_key_backups')
      .select('kdf, salt_b64, nonce_b64, ciphertext_b64')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!backup) {
      setErr('No backup found.');
      setLoading(false);
      return;
    }
    try {
      const priv = await decryptPrivateKeyBackup(
        { kdf: (backup.kdf as { iter: number }) ?? { iter: 310_000 }, saltB64: backup.salt_b64, nonceB64: backup.nonce_b64, ciphertextB64: backup.ciphertext_b64 },
        restorePass,
      );
      localStorage.setItem('campx_dm_identity_priv_jwk', JSON.stringify(priv));
      // If pub key missing, derive by regenerating a keypair is not possible; require pub to already exist locally or in profile.
      const { data: profile } = await sb.from('profiles').select('dm_identity_pub_jwk').eq('id', user.id).maybeSingle();
      const pub = profile?.dm_identity_pub_jwk as JsonWebKey | null | undefined;
      if (!pub) {
        setErr('Missing public identity key on profile.');
        setLoading(false);
        return;
      }
      localStorage.setItem('campx_dm_identity_pub_jwk', JSON.stringify(pub));
      setMyPrivJwk(priv);
      setMyPubJwk(pub);
      setNeedsRestore(false);
      triggerGlobalToast('Secure DM keys restored on this device.', 'success');
    } catch {
      setErr('Incorrect passphrase.');
    } finally {
      setLoading(false);
    }
  }

  async function backupKeys(): Promise<void> {
    const sb = getSupabase();
    if (!sb || !myPrivJwk) return;
    setErr(null);
    setLoading(true);
    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) {
      setErr('Not signed in.');
      setLoading(false);
      return;
    }
    try {
      const enc = await encryptPrivateKeyBackup(myPrivJwk, backupPass);
      const payload = {
        user_id: user.id,
        kdf: enc.kdf,
        salt_b64: enc.saltB64,
        nonce_b64: enc.nonceB64,
        ciphertext_b64: enc.ciphertextB64,
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from('dm_key_backups').upsert(payload, { onConflict: 'user_id' });
      if (error) {
        setErr(error.message);
      } else {
        setBackupStatus('present');
        setBackupPass('');
        triggerGlobalToast('E2EE key backup saved.', 'success');
      }
    } finally {
      setLoading(false);
    }
  }

  async function openOrCreateConversation(): Promise<void> {
    setErr(null);
    const sb = getSupabase();
    if (!sb) return;
    const peer = peerId.trim();
    if (!peer) return;
    setLoading(true);
    const { data, error } = await sb.rpc('get_or_create_dm', { _other: peer });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    const convId = data as string;
    setActiveConvId(convId);
    setActiveScreen('chat');
    setActiveConv({ id: convId, name: peer.slice(0, 8) + '…', initials: peer.slice(0, 2).toUpperCase() });
    await loadThread(convId);
  }

  async function loadThread(convId: string): Promise<void> {
    const sb = getSupabase();
    if (!sb || !myPrivJwk) return;
    setErr(null);
    const { data, error } = await sb
      .from('messages')
      .select('id, sender_id, created_at, e2ee_ciphertext, e2ee_nonce, e2ee_ephemeral_pub_jwk')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(80);
    if (error) {
      setErr(error.message);
      return;
    }
    const rows = (data ?? []) as Array<{
      id: string;
      sender_id: string;
      created_at: string;
      e2ee_ciphertext: string | null;
      e2ee_nonce: string | null;
      e2ee_ephemeral_pub_jwk: JsonWebKey | null;
    }>;
    const out: Array<{ id: string; sender_id: string; created_at: string; text: string }> = [];
    for (const r of rows) {
      if (!r.e2ee_ciphertext || !r.e2ee_nonce || !r.e2ee_ephemeral_pub_jwk) continue;
      try {
        const text = await decryptFromSenderEphemeral(r.e2ee_ciphertext, r.e2ee_nonce, r.e2ee_ephemeral_pub_jwk, myPrivJwk);
        out.push({ id: r.id, sender_id: r.sender_id, created_at: r.created_at, text });
      } catch {
        out.push({ id: r.id, sender_id: r.sender_id, created_at: r.created_at, text: '[Unable to decrypt]' });
      }
    }
    setThread(out);
  }

  async function sendE2eeMessage(): Promise<void> {
    if (!activeConvId) return;
    const sb = getSupabase();
    if (!sb || !myPrivJwk) return;
    const msg = inputText.trim();
    if (!msg) return;
    setErr(null);

    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) return;

    // Determine other participant and fetch their identity public key
    const { data: parts } = await sb
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', activeConvId);
    const ids = (parts ?? []).map((p) => p.user_id as string).filter(Boolean);
    const other = ids.find((id) => id !== user.id);
    if (!other) {
      setErr('Unable to find peer.');
      return;
    }

    const { data: peerProfile } = await sb
      .from('profiles')
      .select('dm_identity_pub_jwk')
      .eq('id', other)
      .maybeSingle();
    const peerPub = peerProfile?.dm_identity_pub_jwk as JsonWebKey | null | undefined;
    if (!peerPub) {
      setErr('Peer does not have E2EE keys yet.');
      return;
    }

    const enc = await encryptForRecipient(msg, peerPub);
    const { error } = await sb.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: user.id,
      body: null,
      e2ee_version: enc.version,
      e2ee_ephemeral_pub_jwk: enc.ephemeralPubJwk,
      e2ee_nonce: enc.nonceB64,
      e2ee_ciphertext: enc.ciphertextB64,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setInputText('');
    await loadThread(activeConvId);
  }

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
      {blocked && (
        <div style={{ padding: '28px 18px', color: 'var(--text)', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Direct messages are unavailable</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
            {tier === 'basic'
              ? 'Verify with your college email to unlock messaging.'
              : 'Setting up secure messaging…'}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/onboarding')}
            style={{ maxWidth: 260, width: '100%', margin: '0 auto' }}
          >
            {tier === 'basic' ? 'Verify college email' : 'Back to onboarding'}
          </button>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/explore-feed')}
              style={{ maxWidth: 260, width: '100%', margin: '0 auto' }}
            >
              Go to Explore
            </button>
          </div>
        </div>
      )}

      {!blocked && (
        <div style={{ padding: '12px 16px' }}>
          {needsRestore && (
            <div style={{ marginBottom: 14, padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Restore secure messages</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                This device doesn’t have your DM encryption key yet. Enter your backup passphrase to restore it.
              </div>
              <input
                type="password"
                value={restorePass}
                onChange={(e) => setRestorePass(e.target.value)}
                placeholder="Backup passphrase"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={() => void restoreFromBackup()}
                disabled={!restorePass.trim() || loading}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  opacity: !restorePass.trim() || loading ? 0.6 : 1,
                  cursor: !restorePass.trim() || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Restoring…' : 'Restore keys'}
              </button>
            </div>
          )}

          {backupStatus !== 'present' && !needsRestore && myPrivJwk && (
            <div style={{ marginBottom: 14, padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Enable multi-device continuity</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                Set a backup passphrase once. This lets you restore your encrypted messages on new devices.
              </div>
              <input
                type="password"
                value={backupPass}
                onChange={(e) => setBackupPass(e.target.value)}
                placeholder="Create backup passphrase"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={() => void backupKeys()}
                disabled={!backupPass.trim() || loading}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  opacity: !backupPass.trim() || loading ? 0.6 : 1,
                  cursor: !backupPass.trim() || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving…' : 'Save backup'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              placeholder="Peer user UUID"
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={() => void openOrCreateConversation()}
              disabled={!canUse || loading}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                opacity: !canUse || loading ? 0.6 : 1,
                cursor: !canUse || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Opening…' : 'Open'}
            </button>
          </div>
          {err && <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 12 }}>{err}</div>}

          {activeConvId && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                Conversation: <span style={{ color: 'var(--text)' }}>{activeConvId.slice(0, 8)}…</span>
              </div>
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 14,
                  padding: 10,
                  maxHeight: 260,
                  overflow: 'auto',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {thread.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 10 }}>
                    No messages yet.
                  </div>
                ) : (
                  thread.map((m) => (
                    <div key={m.id} style={{ fontSize: 13, color: 'var(--text)', padding: '6px 2px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 2 }}>
                        {m.sender_id.slice(0, 8)}… · {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                      <div>{m.text}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Message…"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'var(--surface2)',
                    color: 'var(--text)',
                    fontSize: 13,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void sendE2eeMessage();
                  }}
                />
                <button
                  type="button"
                  onClick={() => void sendE2eeMessage()}
                  disabled={!inputText.trim()}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    opacity: inputText.trim() ? 1 : 0.6,
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
    </>
  );
}
