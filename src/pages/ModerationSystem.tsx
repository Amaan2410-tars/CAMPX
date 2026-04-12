import React from 'react';
import '../index.css';

export default function ModerationSystem() {
  return (
    <>
      
  <div className="wrap">
    <h1>Moderation System</h1>
    <div className="box">Content violation categories, reporting flow and evidence capture.</div>
    <div className="box">Actions: warn, hide, suspend, appeal handling and repeat-violation tracking.</div>
    <div id="campx-moderation-live" className="box"></div>
    <div className="box"><a href="/feed">Back to app</a></div>
  </div>
  

    </>
  );
}
