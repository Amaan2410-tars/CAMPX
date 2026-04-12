import React, { useState } from "react";
import { Search, Filter, Shield, MoreVertical, Ban, Check, X, Users } from "lucide-react";

interface CommunityMock {
  id: string;
  name: string;
  type: "College" | "Open";
  college: string;
  members: number;
  channels: number;
  createdBy: string;
  status: "Active" | "Suspended" | "Pending";
  createdDate: string;
}

const MOCK_COMMUNITIES: CommunityMock[] = [
  { id: "c1", name: "CBIT Hackers", type: "College", college: "CBIT", members: 450, channels: 5, createdBy: "Yash Kumar", status: "Active", createdDate: "2024-02-14" },
  { id: "c2", name: "AI Enthusiasts Hyd", type: "Open", college: "Multiple", members: 1200, channels: 8, createdBy: "Neha Reddy", status: "Active", createdDate: "2024-01-20" },
  { id: "c3", name: "Meme Central", type: "Open", college: "Multiple", members: 3400, channels: 4, createdBy: "Anonymous", status: "Suspended", createdDate: "2023-11-10" },
  { id: "c4", name: "SNIST Placement Prep", type: "College", college: "SNIST", members: 0, channels: 1, createdBy: "Karan S", status: "Pending", createdDate: "2 mins ago" },
];

export default function Communities() {
  const [activeTab, setActiveTab] = useState<"All" | "Pending">("All");

  const pendingRequests = MOCK_COMMUNITIES.filter(c => c.status === "Pending");
  const activeList = MOCK_COMMUNITIES.filter(c => c.status !== "Pending");

  const getStatusBadge = (status: CommunityMock["status"]) => {
    switch (status) {
      case "Active": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">Active</span>;
      case "Suspended": return <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-bold border border-red-400/20">Suspended</span>;
      case "Pending": return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Communities</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform groups and creation requests.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search communities..." 
              className="w-full sm:w-64 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <button className="flex items-center justify-center p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a35]">
        <button
          onClick={() => setActiveTab("All")}
          className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "All" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          All Communities
        </button>
        <button
          onClick={() => setActiveTab("Pending")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "Pending" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Pending Requests 
          {pendingRequests.length > 0 && (
            <span className="bg-[#6c63ff] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "Pending" && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
             <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
               <Shield size={48} className="mb-4 opacity-20" />
               <p>No pending community creation requests.</p>
             </div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{req.name}</h3>
                    {getStatusBadge(req.status)}
                    <span className="text-xs border border-gray-600 px-1.5 py-0.5 rounded text-gray-400">{req.type}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Requested by <span className="text-white">{req.createdBy}</span> • {req.college} • {req.createdDate}
                  </div>
                  <div className="mt-3 text-sm text-gray-300 bg-[#13131a] p-3 rounded-lg border border-[#2a2a35]">
                    <span className="text-gray-500 font-medium">Purpose: </span> 
                    A dedicated space for students to discuss placement strategies, share interview experiences, and prepare for upcoming campus drives.
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/20 transition flex items-center gap-2 text-sm">
                    <X size={16}/> Reject
                  </button>
                  <button className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition flex items-center gap-2 text-sm">
                    <Check size={16}/> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "All" && (
        <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Community</th>
                  <th className="px-6 py-4 font-semibold">Scope</th>
                  <th className="px-6 py-4 font-semibold">Creator</th>
                  <th className="px-6 py-4 font-semibold">Stats</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a35]">
                {activeList.map((comm) => (
                  <tr key={comm.id} className="hover:bg-[#13131a] transition cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{comm.name}</div>
                      <div className="text-xs mt-1 text-gray-500">Created {comm.createdDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      {comm.type === "College" ? (
                        <div>
                          <span className="text-purple-400">College-Specific</span>
                          <div className="text-xs mt-1 text-gray-500">{comm.college}</div>
                        </div>
                      ) : (
                        <span className="text-emerald-400">Open Platform</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white">{comm.createdBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <span className="flex items-center gap-1"><Users size={14} className="text-gray-500"/> {comm.members}</span>
                         <span className="text-gray-500">•</span>
                         <span className="text-gray-400">{comm.channels} ch</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(comm.status)}</td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      <button className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition" title="Suspend">
                        <Ban size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a35] rounded transition">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
