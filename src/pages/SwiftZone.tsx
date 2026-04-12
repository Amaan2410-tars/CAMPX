import React from "react";
import { Link } from "react-router-dom";

export default function SwiftZone() {
  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">Swift Zone</div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '120px',
        textAlign: 'center',
        padding: '0 28px 120px',
      }}>
        <div style={{
          marginBottom: '20px',
          width: '72px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(251,191,36,0.12))',
          border: '1px solid rgba(108,99,255,0.35)',
          fontSize: '36px',
        }}>
          ⚡
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '10px',
        }}>
          Coming soon
        </h1>
        <p style={{
          maxWidth: '300px',
          fontSize: '14px',
          lineHeight: 1.65,
          color: 'var(--text-sub)',
        }}>
          Swift Zone is a Plus-only verified connection experience. It is not part of the initial launch scope per CampX product spec.
        </p>
        <span style={{
          marginTop: '18px',
          display: 'inline-block',
          borderRadius: '10px',
          border: '1px solid rgba(251,191,36,0.25)',
          background: 'rgba(251,191,36,0.12)',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#fbbf24',
        }}>
          Plus tier
        </span>
      </div>
    </>
  );
}
