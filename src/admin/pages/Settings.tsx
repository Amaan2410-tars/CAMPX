import React, { useState } from "react";
import { Shield, Users, Server, Mail, Activity, ToggleLeft, ToggleRight, Search } from "lucide-react";

const MOCK_AUDIT_LOGS = [
  { id: 1, action: "KYC Approved: Priya Reddy (SNIST)", admin: "Yash Kumar", time: "10 mins ago" },
  { id: 2, action: "College Created: IITH (Status: Hidden)", admin: "Neha Sharma", time: "1 hour ago" },
  { id: 3, action: "Post Removed (Violation: Hate Speech)", admin: "System Auto-Mod", time: "2 hours ago" },
  { id: 4, action: "User Suspended: rahul_v (7 Days)", admin: "Yash Kumar", time: "3 hours ago" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Team");
  const [toggles, setToggles] = useState({
    maintenance: false,
    newSignups: true,
    kycReview: true,
    autoMod: true
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage admin access, global toggles, and system audit logs.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Settings Navigation */}
        <div className="w-64 shrink-0 bg-[#1c1c27] border border-[#2a2a35] rounded-xl hidden md:flex flex-col p-2">
          {[
            { id: "Team", label: "Admin Team", icon: Users },
            { id: "Platform", label: "Platform Toggles", icon: Server },
            { id: "Audit", label: "Audit Logs", icon: Activity },
            { id: "Limits", label: "Rate Limits", icon: Shield },
            { id: "Email", label: "Email Templates", icon: Mail }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id 
                  ? "bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#13131a] border border-transparent"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-6 shadow-xl">
          
          {activeTab === "Team" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#2a2a35]">
                <h2 className="text-lg font-bold text-white">Admin Team Management</h2>
                <button className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e5] text-white text-sm font-semibold rounded-lg transition">Invite Admin</button>
              </div>

              <div className="bg-[#13131a] rounded-xl border border-[#2a2a35] divide-y divide-[#2a2a35]">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6c63ff] to-purple-400 flex items-center justify-center font-bold text-white">YK</div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">Yash Kumar <span className="bg-[#6c63ff]/20 text-[#6c63ff] text-[10px] uppercase px-1.5 py-0.5 rounded font-bold border border-[#6c63ff]/30">Founder</span></div>
                      <div className="text-xs text-gray-400">yash@campx.app</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Session Active</span>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400">NS</div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">Neha Sharma <span className="bg-gray-700 text-gray-300 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold border border-gray-600">Admin</span></div>
                      <div className="text-xs text-gray-400">neha@campx.app</div>
                    </div>
                  </div>
                  <button className="text-xs text-red-400 hover:text-red-300 transition border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded font-semibold">Revoke Access</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Platform" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white pb-4 border-b border-[#2a2a35]">Global Platform Controls</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Maintenance Mode</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Disables student access and displays a "We'll be right back" banner.</p>
                  </div>
                  <button onClick={() => setToggles({...toggles, maintenance: !toggles.maintenance})}>
                    {toggles.maintenance ? <ToggleRight size={32} className="text-red-500"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Allow New Signups</h3>
                    <p className="text-xs text-gray-400 mt-0.5">When disabled, new users cannot create accounts on the platform.</p>
                  </div>
                  <button onClick={() => setToggles({...toggles, newSignups: !toggles.newSignups})}>
                    {toggles.newSignups ? <ToggleRight size={32} className="text-emerald-500"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#13131a] rounded-xl border border-[#2a2a35]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Automated Moderation</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Use AI tools to instantly block severe policy violations entirely.</p>
                  </div>
                  <button onClick={() => setToggles({...toggles, autoMod: !toggles.autoMod})}>
                    {toggles.autoMod ? <ToggleRight size={32} className="text-[#6c63ff]"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Audit" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#2a2a35]">
                <h2 className="text-lg font-bold text-white">System Audit Log</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input type="text" placeholder="Search logs..." className="bg-[#13131a] border border-[#2a2a35] rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-[#6c63ff] text-white" />
                </div>
              </div>

              <div className="bg-[#13131a] rounded-xl border border-[#2a2a35] overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#1c1c27] text-xs text-gray-500 uppercase border-b border-[#2a2a35]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Action Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a35]">
                    {MOCK_AUDIT_LOGS.map(log => (
                      <tr key={log.id} className="hover:bg-[#1c1c27]">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.time}</td>
                        <td className="px-4 py-3 font-medium text-white">{log.admin}</td>
                        <td className="px-4 py-3">{log.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {["Limits", "Email"].includes(activeTab) && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Shield size={48} className="mb-4 opacity-20" />
              <p>Configuration panel for {activeTab} is locked to backend integration.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
