import React from 'react';
import '../index.css';

export default function FounderDashboard() {
  return (
    <>
      
  <div className="wrap">
    <div className="top">
      <h1>Founder Dashboard</h1>
      <a href="/feed">Back to app</a>
    </div>

    <div className="grid">
      <div className="card"><div className="k">Daily Active Users</div><div className="v" id="campx-metric-dau">—</div></div>
      <div className="card"><div className="k">New Signups (24h)</div><div className="v" id="campx-metric-signups">—</div></div>
      <div className="card"><div className="k">KYC Pending</div><div className="v" id="campx-metric-kyc">—</div></div>
      <div className="card"><div className="k">Reported Content</div><div className="v" id="campx-metric-reports">—</div></div>
    </div>

    <div className="section">
      <h2>Access and Roles</h2>
      <ul>
        <li>Founder-level overview with global moderation and product controls.</li>
        <li>Role separation for operations, moderation and growth functions.</li>
      </ul>
    </div>

    <div className="section">
      <h2>Modules</h2>
      <ul>
        <li>User growth analytics and verification funnel.</li>
        <li>Content health and trust/safety metrics.</li>
        <li>Billing, payout and subscription overview.</li>
      </ul>
    </div>

    <div className="section">
      <h2>Verification Requests (Founder Approval)</h2>
      <p className="muted">Users with pending verification can be approved or rejected here.</p>
      <div id="campx-verify-queue" className="table-wrap"></div>
    </div>

    <div className="section">
      <h2>Access Points</h2>
      <ul>
        <li>Primary web dashboard for founder/admin controls.</li>
        <li>Fast links to college onboarding and ambassador modules.</li>
      </ul>
    </div>
  </div>
  

    </>
  );
}
