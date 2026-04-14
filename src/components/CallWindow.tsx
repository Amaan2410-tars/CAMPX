import React, { useEffect, useRef, useState } from 'react';
import { Peer, MediaConnection } from 'peerjs';

interface CallWindowProps {
  activeConvName: string;
  activeConvInitials: string;
  onClose: () => void;
  isIncomingCall?: boolean;
}

export default function CallWindow({ activeConvName, activeConvInitials, onClose, isIncomingCall }: CallWindowProps) {
  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    // 1. Initialize local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize PeerJS connection (Mocking connection for pure UI demo if no ID specified, or connect to a room)
        const peer = new Peer();
        peerInstance.current = peer;

        peer.on('open', (id) => {
          if (isIncomingCall) {
            setCallState('ringing');
          } else {
            setCallState('ringing');
            // Simulate their answer after 3 seconds for demo purposes
            setTimeout(() => {
              setCallState('connected');
              // Normally here we would call peer.call(remoteId, stream)
            }, 3000);
          }
        });

        // Answer incoming calls
        peer.on('call', (call: MediaConnection) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setCallState('connected');
          });
        });

      })
      .catch((err) => {
        // Avoid noisy console errors in production UI; show ended state instead.
        setCallState('ended');
      });

    return () => {
      // Cleanup
      mediaStream.current?.getTracks().forEach(track => track.stop());
      peerInstance.current?.destroy();
    };
  }, [isIncomingCall]);

  const toggleMute = () => {
    if (mediaStream.current) {
      mediaStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (mediaStream.current) {
      mediaStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const terminateCall = () => {
    setCallState('ended');
    setTimeout(onClose, 500); // Wait a bit before unmounting to show "Ended"
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#0A0A0F] text-white flex flex-col" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Background Layer (Blurred remote avatar if ringing, or video if connected) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {callState === 'connected' ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
            style={{transform: 'scaleX(-1)'}} // Mocking local as remote if testing solo
          />
        ) : (
          <div className="w-full h-full bg-[#1A1A24] flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#6c63ff]/20 to-transparent opacity-50"></div>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2a2a35] to-[#3a3a45] border-2 border-[#6c63ff]/30 shadow-[0_0_40px_rgba(108,99,255,0.2)] flex items-center justify-center text-5xl font-bold mb-8 z-10 animate-pulse">
              {activeConvInitials}
            </div>
            <div className="z-10 text-3xl font-bold mb-2">{activeConvName}</div>
            <div className="z-10 text-[#a8a0ff] tracking-widest uppercase text-sm">
              {callState === 'connecting' ? 'Connecting...' : 
               callState === 'ringing' ? 'Ringing...' : 'Call Ended'}
            </div>
          </div>
        )}
      </div>

      {/* Floating Local Camera Pip */}
      {(callState === 'connected' || callState === 'ringing') && !isVideoOff && (
        <div className="absolute top-16 right-6 w-28 h-40 bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20 transition-all duration-300">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover" 
            style={{transform: 'scaleX(-1)'}}
          />
        </div>
      )}

      {/* Top action bar (minimize/back) */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-30 bg-gradient-to-b from-black/60 to-transparent">
         <button onClick={terminateCall} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
         </button>
         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            End-to-end Encrypted
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 pb-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30">
         <div className="flex items-center justify-center gap-6 max-w-sm mx-auto">
            {/* Mute */}
            <button onClick={toggleMute} className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isMuted ? 'bg-white text-black' : 'bg-[#2a2a35]/80 text-white hover:bg-[#3a3a45]'}`}>
              {isMuted ? (
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              )}
            </button>
            
            {/* Hangup */}
            <button onClick={terminateCall} className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" strokeWidth="2" style={{transform: 'rotate(135deg)'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>

            {/* Video Toggle */}
            <button onClick={toggleVideo} className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-[#2a2a35]/80 text-white hover:bg-[#3a3a45]'}`}>
              {isVideoOff ? (
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              )}
            </button>
         </div>
      </div>
    </div>
  );
}
