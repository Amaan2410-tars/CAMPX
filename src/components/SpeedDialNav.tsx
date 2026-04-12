import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "college",
    label: "College",
    href: "/college-feed",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "community",
    label: "Community",
    href: "/communities",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "explore",
    label: "Explore",
    href: "/explore-feed",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "swift-zone",
    label: "Swift Zone",
    href: "/swift-zone",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const FAN_POSITIONS = [
  { x: -140, y: 120 },
  { x: -90,  y: 165 },
  { x: -30,  y: 190 },
  { x: 30,   y: 190 },
  { x: 90,   y: 165 },
  { x: 140,  y: 120 },
];

export default function SpeedDialNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dialOpen, setDialOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const holdHintTimer = useRef<number | null>(null);
  const holdOpenTimer = useRef<number | null>(null);
  const touchStartY = useRef(0);
  const hasOpened = useRef(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Determine current nav from pathname
  const currentNavId = NAV_ITEMS.find((n) => location.pathname.startsWith(n.href))?.id || "explore";
  const currentLabel = NAV_ITEMS.find((n) => n.id === currentNavId)?.label || "Explore";

  const openDial = useCallback(() => {
    setDialOpen(true);
    setHeld(false);
    setHintVisible(false);
  }, []);

  const closeDial = useCallback(() => {
    setDialOpen(false);
    setHeld(false);
  }, []);

  const selectNav = useCallback(
    (item: (typeof NAV_ITEMS)[0]) => {
      closeDial();
      navigate(item.href);
    },
    [closeDial, navigate]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      touchStartY.current = e.clientY;
      hasOpened.current = false;
      setHeld(true);

      if (holdHintTimer.current) clearTimeout(holdHintTimer.current);
      if (holdOpenTimer.current) clearTimeout(holdOpenTimer.current);

      holdHintTimer.current = window.setTimeout(() => {
        setHintVisible(true);
      }, 200);

      holdOpenTimer.current = window.setTimeout(() => {
        hasOpened.current = true;
        openDial();
      }, 400);

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [openDial]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const dy = touchStartY.current - e.clientY;
      if (dy > 20 && !hasOpened.current) {
        if (holdHintTimer.current) clearTimeout(holdHintTimer.current);
        if (holdOpenTimer.current) clearTimeout(holdOpenTimer.current);
        hasOpened.current = true;
        openDial();
      }
    },
    [openDial]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (holdHintTimer.current) clearTimeout(holdHintTimer.current);
      if (holdOpenTimer.current) clearTimeout(holdOpenTimer.current);
      setHintVisible(false);
      setHeld(false);
      const dy = touchStartY.current - e.clientY;
      if (dy < 10 && !dialOpen && !hasOpened.current) {
        openDial();
      }
    },
    [dialOpen, openDial]
  );

  const handlePointerCancel = useCallback(() => {
    if (holdHintTimer.current) clearTimeout(holdHintTimer.current);
    if (holdOpenTimer.current) clearTimeout(holdOpenTimer.current);
    setHeld(false);
    setHintVisible(false);
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (holdHintTimer.current) clearTimeout(holdHintTimer.current);
      if (holdOpenTimer.current) clearTimeout(holdOpenTimer.current);
    };
  }, []);

  // Handle scroll to hide/show pill
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Use window/document scrolling if target is document, otherwise Element scroll
      const currentScrollY = target.scrollTop ?? window.scrollY;

      // Ignore bounces or very small scrolls
      if (currentScrollY <= 0) {
        setHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current + 5) {
        // Scrolling down
        if (!dialOpen) setHidden(true);
      } else if (currentScrollY < lastScrollY.current - 5) {
        // Scrolling up
        setHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    // Capture true to catch scroll events from any nested scrollable container (.phone)
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [dialOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`dial-backdrop ${dialOpen ? "open" : ""}`}
        onClick={closeDial}
      />

      {/* Nav Dock */}
      <div
        className={`campx-nav-dock ${dialOpen ? "is-dial-open" : ""} ${hidden ? "nav-hidden" : ""}`}
        id="campx-navDock"
        style={{
          transform: hidden ? "translateY(150%)" : "translateY(0)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* Hold hint */}
        <div className={`hold-hint ${hintVisible ? "visible" : ""}`}>
          {typeof window !== "undefined" && window.innerWidth >= 768
            ? "Click and hold — or swipe up — for menu"
            : "Swipe up to open menu"}
        </div>

        {/* Speed dial items */}
        <div className={`speed-dial-wrap ${dialOpen ? "open" : ""}`}>
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className={`dial-item ${dialOpen ? "visible" : ""} ${
                item.id === currentNavId ? "active-nav" : ""
              }`}
              style={{
                left: dialOpen ? `calc(50% + ${FAN_POSITIONS[i].x}px)` : "50%",
                bottom: dialOpen ? `${FAN_POSITIONS[i].y}px` : "0px",
                transitionDelay: dialOpen
                  ? `${i * 0.05}s`
                  : `${(NAV_ITEMS.length - 1 - i) * 0.03}s`,
              }}
            >
              <button
                type="button"
                className="dial-btn"
                aria-label={item.label}
                onClick={() => selectNav(item)}
              >
                {item.icon}
              </button>
              <div className="dial-lbl">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Nav pill */}
        <div
          ref={pillRef}
          className={`nav-pill ${held ? "held" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="pill-arrows">
            <span></span>
            <span></span>
          </div>
          <span className="pill-label">{currentLabel}</span>
          <div className="pill-dot"></div>
        </div>
      </div>
    </>
  );
}
