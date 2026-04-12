import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { triggerGlobalToast } from '../components/AppLayout';
import '../index.css';

export default function SubscriptionBilling() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const planSlug = searchParams.get('plan') || 'pro';
  const isPlus = planSlug.toLowerCase() === 'plus';

  const planName = isPlus ? 'CampX Plus' : 'CampX Pro';
  const planPrice = isPlus ? '₹1,499' : '₹999';
  const billingCycle = 'billed monthly';

  const handleCheckout = () => {
    setIsProcessing(true);
    triggerGlobalToast("Initializing Razorpay Secure Checkout...", "info");
    
    // Simulate payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      triggerGlobalToast(`Payment Successful! You are now on ${planName} tier ✨`, "success");
      navigate('/settings');
    }, 2500);
  };

  return (
    <div className="screen active" style={{ backgroundColor: '#09090b', zIndex: 100, overflowY: 'auto', paddingBottom: '140px' }}>
      
      {/* Top Navigation */}
      <div className="topbar">
        <div className="back-btn" onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <div className="topbar-title" style={{ flex: 1, textAlign: 'center', paddingRight: '48px' }}>Checkout</div>
      </div>

      <div style={{ padding: '32px 24px', color: 'white', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header Intro */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>Secure Checkout</h1>
          <p style={{ color: '#aaa', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>Review your selected plan and proceed to payment. Your membership activates instantly upon success.</p>
        </div>

        {/* Order Summary Card */}
        <div style={{ background: '#1c1c24', border: '1px solid #333', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', margin: '0 0 16px 0' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isPlus ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'linear-gradient(135deg, #3b82f6, #2dd4bf)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{planName}</div>
                <div style={{ color: '#aaa', fontSize: '13px' }}>{billingCycle}</div>
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{planPrice}</div>
          </div>

          <div style={{ borderTop: '1px solid #333', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ccc', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              {isPlus ? 'Everything in Pro' : 'Access to premium campus content'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ccc', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              {isPlus ? 'Priority access at high traffic times' : 'Power through tasks with Cowork'}
            </div>
            {isPlus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ccc', fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Up to 20x more usage than Pro
              </div>
            )}
          </div>
        </div>

        {/* Security & Final Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '14px' }}>
            <span>Subtotal</span>
            <span style={{ color: 'white' }}>{planPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '14px' }}>
            <span>Taxes</span>
            <span style={{ color: 'white' }}>Calculated at checkout</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '18px', fontWeight: 700, borderTop: '1px solid #333', paddingTop: '16px', marginTop: '4px' }}>
            <span>Total Due Today</span>
            <span>{planPrice}</span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '16px' }}>
          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{ 
              width: '100%', 
              background: isProcessing ? '#444' : '#fff', 
              color: isProcessing ? '#888' : '#000', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '12px', 
              fontSize: '18px', 
              fontWeight: 700, 
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            {isProcessing ? 'Processing Payment...' : `Proceed with Razorpay`}
          </button>
          <div style={{ textAlign: 'center', marginTop: '16px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Guaranteed safe & secure checkout
          </div>
        </div>

      </div>
    </div>
  );
}
