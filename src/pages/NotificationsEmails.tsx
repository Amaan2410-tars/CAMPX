import React from 'react';
import '../index.css';

export default function NotificationsEmails() {
  return (
    <>
      
  <div className="wrap">
    <h1>Notifications and Emails</h1>
    <div className="box">Triggers: likes, comments, follows, mentions, messages, moderation updates.</div>
    <div className="box">Channels: in-app, push, email with user-level notification controls.</div>
    <div id="campx-notifications-live" className="box"></div>
    <div className="box"><a href="/feed">Back to app</a></div>
  </div>
  

    </>
  );
}
