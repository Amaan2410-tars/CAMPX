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

      </div>
    </div>
  );
}
