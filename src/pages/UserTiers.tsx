import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import '../index.css';

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  currency: string;
  interval: string;
}

export default function UserTiers() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      const mockPlans = [
        { id: '1', slug: 'pro', name: 'Pro', price_cents: 99900, currency: 'INR', interval: 'month' },
        { id: '2', slug: 'plus', name: 'Plus', price_cents: 149900, currency: 'INR', interval: 'month' }
      ];

      if (!isSupabaseConfigured()) {
        setPlans(mockPlans);
        setLoading(false);
        return;
      }

      const sb = getSupabase();
      if (!sb) {
        setPlans(mockPlans);
        setLoading(false);
        return;
      }

      try {
        const fetchPromise = sb
          .from('plans')
          .select('id, slug, name, price_cents, currency, interval, active')
          .eq('active', true)
          .order('price_cents', { ascending: true })
          .throwOnError();

        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase fetch timed out after 1.5s')), 1500)
        );

        const { data } = await Promise.race([fetchPromise, timeoutPromise]);

        if (!data || data.length === 0) {
          setPlans(mockPlans);
        } else {
          setPlans(data as Plan[]);
        }
      } catch (err: any) {
        setPlans(mockPlans);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const formatMoney = (cents: number) => {
    if (cents === 0) return '₹0';
    return `₹${Math.round(cents / 100)}`; // Dropping raw decimals to look clean like $17, $100
  };

  return (
    <div className="pricing-page">
      <style>{`
        .pricing-page {
          min-height: 100vh;
          background-color: #fafafa;
          color: #111;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px 140px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        /* Dark mode compatibility if parent forces dark bg, override to standard high-contrast light theme to match reference */
        .app .phone .pricing-page {
           background-color: #ffffff;
           border-radius: 20px;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .pricing-header h1 {
          font-size: 36px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .billing-toggle {
          display: inline-flex;
          background: #f1f1f1;
          padding: 4px;
          border-radius: 8px;
          margin: 0 auto;
        }
        .billing-toggle span {
          padding: 8px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 4px;
          color: #555;
        }
        .billing-toggle span.active {
          background: #fff;
          color: #111;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: 100%;
          max-width: 800px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        .pricing-card {
          background: #fff;
          border: 1px solid #eaeaec;
          border-radius: 16px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 24px;
          color: #1a1a1a;
        }

        .pricing-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .plan-name {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .plan-desc {
          font-size: 14px;
          color: #666;
          margin-bottom: 24px;
          min-height: 40px;
        }

        .plan-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 24px;
          min-height: 48px;
        }

        .plan-price {
          font-size: 40px;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: -1px;
        }

        .plan-price-meta {
          font-size: 13px;
          color: #666;
          display: flex;
          flex-direction: column;
        }

        .btn-action {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          margin-bottom: 12px;
        }

        .btn-primary-dark {
          background: #1a1a1a;
          color: #fff;
          border: 1px solid #1a1a1a;
        }
        .btn-primary-dark:hover {
          background: #333;
        }
        
        .btn-outline {
          background: #fff;
          color: #1a1a1a;
          border: 1px solid #eaeaec;
        }
        .btn-outline:hover {
          background: #f9f9f9;
        }

        .btn-ghost-note {
          text-align: center;
          font-size: 12px;
          color: #888;
          margin-bottom: 32px;
          min-height: 14px;
        }

        .features-divider {
          width: 100%;
          height: 1px;
          background: #f1f1f1;
          margin-bottom: 24px;
        }

        .features-list {
          flex-grow: 1;
        }

        .feature-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .feature-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #444;
          line-height: 1.4;
          align-items: flex-start;
        }

        .feature-item svg {
          margin-top: 2px;
          color: #1a1a1a;
          flex-shrink: 0;
        }

        .back-nav {
          margin-top: 24px;
          display: inline-block;
          font-size: 14px;
          color: #666;
          text-decoration: underline;
        }
      `}</style>

      <div className="pricing-header">
        <h1>Plans that grow with you</h1>
      </div>

      <div className="pricing-grid">
        {loading ? (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: '#666'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation: 'spin 1s linear infinite'}}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p style={{marginTop: '16px'}}>Loading plans...</p>
          </div>
        ) : (
          plans.map((p) => {
            const lower = (p.name || '').toLowerCase();
            const isPlus = lower.includes('plus') || lower.includes('max');
            
            const btnClass = isPlus ? 'btn-action btn-primary-dark' : 'btn-action btn-outline';
            const btnText = `Get ${p.name} plan`;
            
            const featureTitle = isPlus 
              ? 'Everything in Pro, plus:' 
              : 'Core features for everyday use:';

            const featureList = isPlus 
              ? [
                  "Up to 20x more usage than Pro*",
                  "Early access to advanced AI features",
                  "Higher output limits for all tasks",
                  "Priority access at high traffic times"
                ]
              : [
                  "Access to premium campus content",
                  "Power through tasks with Cowork",
                  "Higher usage capacity limits",
                  "Deep research and AI assistance",
                  "Extended verification benefits"
                ];

            return (
              <div key={p.id} className="pricing-card">
                {/* SVG Icon resembling the reference */}
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20 M12 2a4 4 0 0 0-4 4 M12 2a4 4 0 0 1 4 4 M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M18 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M10 16L6 14 M14 16l4-2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>

                <div className="pricing-card-header">
                  <span className="plan-name">{p.name || 'Plan'}</span>
                </div>
                
                <div className="plan-desc">
                  {isPlus ? "Higher limits, priority access" : "Research, code, and organize"}
                </div>

                <div className="plan-price-row">
                  <div className="plan-price">{formatMoney(p.price_cents)}</div>
                  <div className="plan-price-meta">
                    <span>INR / {p.interval}</span>
                    <span>billed {p.interval === 'year' ? 'annually' : 'monthly'}</span>
                  </div>
                </div>

                <Link to={`/subscription-billing?plan=${encodeURIComponent(p.slug)}`} className={btnClass}>
                  {btnText}
                </Link>
                
                <div className="btn-ghost-note">
                  {p.price_cents > 0 ? "No commitment · Cancel anytime" : ""}
                </div>

                <div className="features-divider"></div>

                <div className="features-list">
                  {featureTitle && <div className="feature-title">{featureTitle}</div>}
                  {featureList.map((feat, idx) => (
                    <div className="feature-item" key={idx}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && (
         <div style={{fontSize: '11px', color: '#888', textAlign: 'center', maxWidth: '800px', lineHeight: '1.5'}}>
           *Usage limits apply. Prices shown don't include applicable tax. Prices and plans are subject to change.
         </div>
      )}

      <Link to="/explore-feed" className="back-nav">Back to app</Link>
    </div>
  );
}
