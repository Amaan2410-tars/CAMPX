import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SpeedDialNav from "./SpeedDialNav";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "info" | "update";
}

// Global emitter for Toasts so anywhere in the app can trigger a popup
export const triggerGlobalToast = (message: string, type: "success" | "info" | "update" = "success") => {
  const event = new CustomEvent("campx-toast", { detail: { message, type } });
  window.dispatchEvent(event);
};

export default function AppLayout() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newToast: ToastProps = {
        id: Date.now().toString() + Math.random().toString(),
        message: customEvent.detail.message,
        type: customEvent.detail.type,
      };
      
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000); // Exists for 4s before disappearing
    };

    window.addEventListener("campx-toast", handleToast);
    return () => window.removeEventListener("campx-toast", handleToast);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;
    
    // Check if it's a clear horizontal right swipe
    if (diffX > 100 && Math.abs(diffX) > Math.abs(diffY) * 2) {
      navigate('/dms');
    }
  };

  return (
    <div className="app" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <style>{`
        .toast-container {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          width: 90%;
          max-width: 400px;
        }

        .toast-popup {
          background-color: var(--card-bg, #1e1e24);
          color: white;
          padding: 14px 18px;
          border-radius: 16px;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, fadeOut 0.4s ease 3.5s forwards;
        }

        .toast-popup.update {
          border-color: rgba(99, 102, 241, 0.4);
        }

        .toast-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .toast-icon.success { background-color: rgba(74, 222, 128, 0.2); color: #4ade80; }
        .toast-icon.info { background-color: rgba(96, 165, 250, 0.2); color: #60a5fa; }
        .toast-icon.update { background-color: rgba(129, 140, 248, 0.2); color: #818cf8; }

        @keyframes popIn {
          0% { transform: translateY(-40px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        @keyframes fadeOut {
          to { transform: translateY(-20px); opacity: 0; }
        }
      `}</style>

      <div className="phone">
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast-popup ${toast.type}`}>
              <div className={`toast-icon ${toast.type}`}>
                {toast.type === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                {toast.type === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
                {toast.type === 'update' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              </div>
              <div>{toast.message}</div>
            </div>
          ))}
        </div>

        <Outlet />
        <SpeedDialNav />
      </div>
    </div>
  );
}
