import React from 'react';
import '../index.css';

export default function CampusAmbassadorDashboard() {
  return (
    <>
      
  <div className="wrap">
    <div className="top">
      <h1>Campus Ambassador Dashboard</h1>
      <a href="/feed">Back to app</a>
    </div>

    <div className="grid">
      <div className="card"><div className="k">Referrals This Week</div><div className="v" id="campx-amb-metric-referrals">—</div></div>
      <div className="card"><div className="k">Events Assisted</div><div className="v" id="campx-amb-metric-events">—</div></div>
      <div className="card"><div className="k">Pending Leads</div><div className="v" id="campx-amb-metric-pending">—</div></div>
      <div className="card"><div className="k">Recognition Points</div><div className="v" id="campx-amb-metric-points">—</div></div>
    </div>

    <div className="section">
      <h2>Ambassador Structure</h2>
      <ul>
        <li>College-level reps with scoped responsibilities and targets.</li>
        <li>Progress tracking for invites, events and growth campaigns.</li>
      </ul>
    </div>

    <div className="section">
      <h2>Dashboard Modules</h2>
      <ul>
        <li>Referral funnel and onboarding conversion.</li>
        <li>Community activation and retention snapshots.</li>
        <li>College campaign reporting and handoff to founder team.</li>
      </ul>
    </div>

    <div className="section">
      <h2>Perks and Recognition</h2>
      <ul>
        <li>Tiered incentives from activity and verified growth impact.</li>
        <li>Leaderboard-ready metric cards for ambassador performance.</li>
      </ul>
    </div>
  </div>
  

    </>
  );
}
