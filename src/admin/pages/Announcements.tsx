import React, { useState } from "react";
import { Megaphone, Send, Clock, Users, Building, MousePointerClick, History } from "lucide-react";

export default function Announcements() {
  const [target, setTarget] = useState("All");
  const [channel, setChannel] = useState("In-App");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Announcements</h1>
          <p className="text-gray-400 text-sm mt-1">Broadcast targeted updates and notifications to users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composer */}
        <div className="lg:col-span-2 bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#2a2a35] bg-[#13131a] flex items-center gap-2">
            <Megaphone size={18} className="text-[#6c63ff]" />
            <h2 className="font-bold text-white tracking-wider uppercase text-sm">Compose Message</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Target Audience</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["All", "Pro/Plus", "Basic", "Specific College"].map(t => (
                    <label key={t} className={`p-3 rounded-lg border text-sm font-medium cursor-pointer transition flex items-center justify-center text-center ${target === t ? "bg-[#6c63ff]/10 border-[#6c63ff] text-white" : "bg-[#13131a] border-[#2a2a35] text-gray-400 hover:text-white"}`}>
                      <input type="radio" className="sr-only" checked={target===t} onChange={() => setTarget(t)} />
                      {t}
                    </label>
                  ))}
                </div>
                {target === "Specific College" && (
                  <input type="text" placeholder="Enter college code (e.g. CBIT)..." className="mt-3 w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]" />
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Delivery Channels</label>
                <div className="grid grid-cols-3 gap-3">
                  {["In-App", "Email", "Both"].map(c => (
                    <label key={c} className={`p-3 rounded-lg border text-sm font-medium cursor-pointer transition flex items-center justify-center text-center ${channel === c ? "bg-[#6c63ff]/10 border-[#6c63ff] text-white" : "bg-[#13131a] border-[#2a2a35] text-gray-400 hover:text-white"}`}>
                      <input type="radio" className="sr-only" checked={channel===c} onChange={() => setChannel(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Notification Title</label>
                <input type="text" placeholder="e.g. Server Maintenance Tonight" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Message Body</label>
                <textarea rows={4} placeholder="Type your announcement here..." className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff] resize-none"></textarea>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button className="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-2">
                  <Clock size={16} /> Schedule Send
                </button>
                <button 
                  onClick={() => alert("Announcement queued for delivery.")}
                  className="bg-[#6c63ff] hover:bg-[#5b54e5] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                >
                  <Send size={16} /> Broadcast Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History / Stats */}
        <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 border-b border-[#2a2a35] bg-[#13131a] flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            <h2 className="font-bold text-white tracking-wider uppercase text-sm">Recent Broadcasts</h2>
          </div>
          
          <div className="divide-y divide-[#2a2a35] flex-1 overflow-y-auto">
            <div className="p-5 hover:bg-[#13131a] transition">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 uppercase">Sent</span>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">New Update v1.0.4 is live!</h3>
              <p className="text-xs text-gray-400 mb-3 truncate">We've added requested features to DMs and...</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><Users size={12}/> 24.5k Sent</span>
                <span className="flex items-center gap-1 text-blue-400"><MousePointerClick size={12}/> 64% Open</span>
              </div>
            </div>

            <div className="p-5 hover:bg-[#13131a] transition">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 uppercase">Sent</span>
                <span className="text-xs text-gray-500">Last week</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Campus Ambassador Applications Open</h3>
              <p className="text-xs text-gray-400 mb-3 truncate">Represent CampX at your college. Apply now via...</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><Building size={12}/> SNIST Only</span>
                <span className="flex items-center gap-1 text-blue-400"><MousePointerClick size={12}/> 82% Open</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
