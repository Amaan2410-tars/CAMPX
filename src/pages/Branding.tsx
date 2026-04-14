import React from 'react';

export default function Branding() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f8] font-sans selection:bg-[#6c63ff] selection:text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page 1: Cover Header */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c63ff] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-32 h-32 md:w-48 md:h-48 mx-auto bg-black rounded-3xl border border-[#333] flex items-center justify-center p-6 mb-8 shadow-2xl">
              <img src="/campx-logo.png" alt="CampX Official Logo" className="w-full h-full object-contain" />
            </div>
            
            <h2 className="text-[#9b8fff] font-bold tracking-[0.2em] text-sm uppercase mb-4">Official Brand Identity</h2>
            <h1 className="text-5xl md:text-7xl font-black font-['Syne'] tracking-tighter mb-4 text-[#f0f0f8]">
              Camp<span className="text-[#6c63ff]">X</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              The exclusive, verified network elevating the campus experience.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/campx-logo.png" 
                download="CampX_Official_Logo.png"
                className="bg-[#6c63ff] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5b54e5] transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Master Logo (PNG)
              </a>
              <a 
                href="/brand-guidelines.html" 
                target="_blank"
                className="bg-[#1c1c27] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#2a2a35] border border-[#333] transition flex items-center justify-center gap-2"
              >
                View Print-Ready PDF/HTML
              </a>
            </div>
          </div>
        </section>

        {/* Strategy Section */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-10 md:p-16">
          <h3 className="text-[#9b8fff] font-bold tracking-[0.2em] text-sm uppercase mb-2">01. Strategy</h3>
          <h2 className="text-3xl font-bold font-['Syne'] mb-8 text-white">Brand Tone & Voice</h2>
          
          <p className="text-gray-400 mb-10 leading-relaxed text-lg">
            CampX exists to bridge the gap between fragmented college campuses, offering a unified, verified digital ecosystem where students network, engage, and grow safely.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0f] border border-[#1c1c27] p-8 rounded-2xl">
              <h4 className="text-[#6c63ff] font-bold text-xl mb-3 font-['Syne']">Exclusive & Elevating</h4>
              <p className="text-gray-400 text-sm leading-relaxed">The tone implies VIP status. Users earned their spot by passing verification. We celebrate their milestones.</p>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1c1c27] p-8 rounded-2xl">
              <h4 className="text-[#6c63ff] font-bold text-xl mb-3 font-['Syne']">Dynamic & Energetic</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Our language is punchy, action-oriented, and vibrant. We use strong verbs and concise sentences.</p>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-10 md:p-16">
          <h3 className="text-[#9b8fff] font-bold tracking-[0.2em] text-sm uppercase mb-2">02. Colors</h3>
          <h2 className="text-3xl font-bold font-['Syne'] mb-8 text-white">Palette & Hex Codes</h2>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#0a0a0f] border border-[#1c1c27] p-6 rounded-2xl flex flex-col items-center text-center relative group">
              <div className="w-full h-32 bg-[#6c63ff] rounded-xl mb-4 shadow-[0_0_30px_rgba(108,99,255,0.3)] transition-transform group-hover:scale-105 duration-300"></div>
              <h4 className="font-bold text-lg text-white">Neon Accent</h4>
              <p className="text-gray-500 font-mono text-sm mt-1 select-all cursor-pointer hover:text-white" title="Click to copy">#6C63FF</p>
            </div>
            <div className="bg-[#1c1c27] border border-[#333] p-6 rounded-2xl flex flex-col items-center text-center relative group">
              <div className="w-full h-32 bg-[#0a0a0f] rounded-xl mb-4 border border-[#333] transition-transform group-hover:scale-105 duration-300"></div>
              <h4 className="font-bold text-lg text-white">Deep Space Base</h4>
              <p className="text-gray-500 font-mono text-sm mt-1 select-all cursor-pointer hover:text-white" title="Click to copy">#0A0A0F</p>
            </div>
          </div>
        </section>
        
        {/* Typography Section */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-10 md:p-16">
          <h3 className="text-[#9b8fff] font-bold tracking-[0.2em] text-sm uppercase mb-2">03. Typography</h3>
          <h2 className="text-3xl font-bold font-['Syne'] mb-8 text-white">System Fonts</h2>
          
          <div className="space-y-8">
            <div className="bg-[#0a0a0f] border border-[#1c1c27] p-8 rounded-2xl overflow-hidden">
              <h4 className="text-gray-500 font-bold tracking-widest text-xs mb-4">DISPLAY FONT</h4>
              <div className="font-['Syne'] text-5xl md:text-7xl font-bold text-white mb-4">Syne</div>
              <p className="text-gray-400 font-['Syne'] text-lg md:text-2xl leading-relaxed break-words">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>abcdefghijklmnopqrstuvwxyz</p>
            </div>
            
            <div className="bg-[#0a0a0f] border border-[#1c1c27] p-8 rounded-2xl overflow-hidden">
              <h4 className="text-gray-500 font-bold tracking-widest text-xs mb-4">BODY FONT</h4>
              <div className="font-sans text-5xl md:text-7xl font-bold text-white mb-4">DM Sans</div>
              <p className="text-gray-400 font-sans text-lg md:text-2xl leading-relaxed break-words">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>abcdefghijklmnopqrstuvwxyz</p>
            </div>
          </div>
        </section>

        {/* AI Context Section */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-10 md:p-16 mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[#9b8fff] font-bold tracking-[0.2em] text-sm uppercase mb-2">04. AI Context Generator</h3>
              <h2 className="text-3xl font-bold font-['Syne'] text-white">Social Media AI Prompt</h2>
            </div>
            <button 
              onClick={() => {
                const text = `You are acting as the Chief Marketing Officer and Social Media Manager for CampX.\n\n**What is CampX?**\nCampX is an exclusive, verified digital network designed solely for college and university students in India. Unlike fragmented public platforms like Instagram or LinkedIn, CampX uses institutional email verification. This creates a safe, spam-free ecosystem where students can network, collaborate on projects, buy/sell college items securely, and participate in campus-specific and inter-college events.\n\n**The Aesthetic:**\nA sleek, futuristic "Dark Mode First" interface using Deep Space Black (#0A0A0F) and Neon Accent Purple (#6C63FF). The typography relies on 'Syne' for bold, striking headers and 'DM Sans' for clean, modern readability.\n\n**Tone & Voice:**\n- Direct & Authentic: No corporate fluff. We speak directly to young adults.\n- Exclusive & Elevating: Users earned their spot by verifying their college email. Treat the platform like a VIP club that celebrates milestones.\n- Dynamic & Energetic: Punchy, action-oriented, and vibrant writing that drives engagement.\n\n**Core Mission:**\nTo bridge the gap between fragmented college campuses and offer a unified space to unlock the true potential of campus life. Core hashtags: #CampX #VerifiedCampus #UnlockYourCampus.`;
                navigator.clipboard.writeText(text);
                alert("Prompt copied to clipboard!");
              }}
              className="bg-[#2a2a35] hover:bg-[#333] transition px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-[#444]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              Copy AI Prompt
            </button>
          </div>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            Provide the block below to any generative AI tool (ChatGPT, Claude, etc.) so it immediately understands CampX's brand identity, mission, and features.
          </p>
          
          <div className="bg-[#0a0a0f] border border-[#1c1c27] p-6 rounded-2xl overflow-hidden relative group">
            <pre className="font-mono text-sm text-gray-500 whitespace-pre-wrap leading-relaxed select-all">
{`You are acting as the Chief Marketing Officer and Social Media Manager for CampX.

**What is CampX?**
CampX is an exclusive, verified digital network designed solely for college and university students in India. Unlike fragmented public platforms like Instagram or LinkedIn, CampX uses institutional email verification. This creates a safe, spam-free ecosystem where students can network, collaborate on projects, buy/sell college items securely, and participate in campus-specific and inter-college events.

**The Aesthetic:**
A sleek, futuristic "Dark Mode First" interface using Deep Space Black (#0A0A0F) and Neon Accent Purple (#6C63FF). The typography relies on 'Syne' for bold, striking headers and 'DM Sans' for clean, modern readability.

**Tone & Voice:**
- Direct & Authentic: No corporate fluff. We speak directly to young adults.
- Exclusive & Elevating: Users earned their spot by verifying their college email. Treat the platform like a VIP club that celebrates milestones.
- Dynamic & Energetic: Punchy, action-oriented, and vibrant writing that drives engagement.

**Core Mission:**
To bridge the gap between fragmented college campuses and offer a unified space to unlock the true potential of campus life. Core hashtags: #CampX #VerifiedCampus #UnlockYourCampus.`}
            </pre>
          </div>
        </section>

        {/* Footer for Razorpay/Legal Compliance */}
        <footer className="text-center pb-12 pt-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-4">
            <a href="/policies#terms" target="_blank" rel="noreferrer" className="hover:text-white transition">Terms &amp; Conditions</a>
            <a href="/policies#privacy" target="_blank" rel="noreferrer" className="hover:text-white transition">Privacy Policy</a>
            <a href="/policies#refunds" target="_blank" rel="noreferrer" className="hover:text-white transition">Refunds/Cancellations</a>
            <a href="/policies#pricing" target="_blank" rel="noreferrer" className="hover:text-white transition">Pricing</a>
            <a href="/policies#shipping" target="_blank" rel="noreferrer" className="hover:text-white transition">Shipping Policy</a>
            <a href="/policies#contact" target="_blank" rel="noreferrer" className="hover:text-white transition">Contact Us</a>
          </div>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} CampX Technologies Pvt Ltd. All rights reserved.
          </p>
        </footer>

      </div>
    </div>
  );
}
