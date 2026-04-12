import React, { useState } from "react";
import { Search, Filter, MoreVertical, ShieldAlert, GraduationCap, Clock, AlertTriangle, Ban, X, CheckCircle2 } from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  year: string;
  tier: "Basic" | "Verified" | "Pro" | "Plus";
  kycStatus: "Pending" | "Approved" | "Rejected" | "None";
  joinedAt: string;
  lastActive: string;
}

const MOCK_USERS: UserRecord[] = [
  { id: "101", name: "Yash Kumar", email: "yash.cse@cbit.ac.in", mobile: "+91 9876543210", college: "CBIT", course: "B.Tech CSE", year: "3rd Year", tier: "Pro", kycStatus: "Approved", joinedAt: "2024-01-12", lastActive: "Just now" },
  { id: "102", name: "Aditi Rao", email: "aditi.r@vnr.edu", mobile: "+91 8765432109", college: "VNRVJIET", course: "MBA", year: "1st Year", tier: "Basic", kycStatus: "None", joinedAt: "2024-03-01", lastActive: "2 hours ago" },
  { id: "103", name: "Rohan Verma", email: "rohanv@iith.ac.in", mobile: "+91 7654321098", college: "IITH", course: "M.Tech", year: "2nd Year", tier: "Verified", kycStatus: "Pending", joinedAt: "2024-04-10", lastActive: "1 day ago" },
  { id: "104", name: "Snehil Sharma", email: "sneha123@gmail.com", mobile: "+91 6543210987", college: "SNIST", course: "B.Tech IT", year: "4th Year", tier: "Basic", kycStatus: "Rejected", joinedAt: "2024-02-28", lastActive: "3 days ago" },
];

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const getTierBadge = (tier: UserRecord["tier"]) => {
    switch (tier) {
      case "Pro": return <span className="text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded text-xs font-bold border border-[#a855f7]/20 uppercase">Pro</span>;
      case "Plus": return <span className="text-[#ec4899] bg-[#ec4899]/10 px-2 py-0.5 rounded text-xs font-bold border border-[#ec4899]/20 uppercase">Plus</span>;
      case "Verified": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20 uppercase">Verified</span>;
      default: return <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded text-xs font-bold border border-gray-400/20 uppercase">Basic</span>;
    }
  };

  const getKycBadge = (kyc: UserRecord["kycStatus"]) => {
    switch (kyc) {
      case "Approved": return <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={14}/> Approved</span>;
      case "Pending": return <span className="flex items-center gap-1 text-yellow-400 text-xs"><Clock size={14}/> Pending</span>;
      case "Rejected": return <span className="flex items-center gap-1 text-red-400 text-xs"><X size={14}/> Rejected</span>;
      default: return <span className="text-gray-500 text-xs">-</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Users</h1>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, mobile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <button className="flex items-center justify-center p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">College Info</th>
                <th className="px-6 py-4 font-semibold">Tier</th>
                <th className="px-6 py-4 font-semibold">KYC Status</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-[#13131a] transition cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs mt-1 text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.mobile}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{user.college}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.course} • {user.year}</div>
                  </td>
                  <td className="px-6 py-4">{getTierBadge(user.tier)}</td>
                  <td className="px-6 py-4">{getKycBadge(user.kycStatus)}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300">Joined: {user.joinedAt}</div>
                    <div className="text-xs text-gray-500 mt-1">Last: {user.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a35] rounded transition" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#1c1c27] w-full max-w-md h-full border-l border-[#2a2a35] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-[#2a2a35]">
              <h2 className="text-lg font-bold text-white">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6c63ff] to-purple-400 flex items-center justify-center text-xl font-bold text-white shadow-xl">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                  <div className="text-sm text-gray-400">{selectedUser.email}</div>
                  <div className="mt-2">{getTierBadge(selectedUser.tier)}</div>
                </div>
              </div>

              <div className="bg-[#13131a] rounded-xl p-4 border border-[#2a2a35]">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Educational Identity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">College</div>
                    <div className="text-white font-medium">{selectedUser.college}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">KYC Status</div>
                    <div className="font-medium">{getKycBadge(selectedUser.kycStatus)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Course</div>
                    <div className="text-white font-medium">{selectedUser.course}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Year</div>
                    <div className="text-white font-medium">{selectedUser.year}</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#13131a] rounded-xl p-4 border border-[#2a2a35]">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Platform Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Total Posts</div>
                    <div className="text-white font-medium">142</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Communities joined</div>
                    <div className="text-white font-medium">8</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Reports against</div>
                    <div className="text-emerald-400 font-medium">0 Clean</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#2a2a35]">
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Moderation Actions</h4>
                <button className="w-full flex items-center justify-between p-3 bg-[#13131a] border border-[#2a2a35] hover:border-yellow-500/50 rounded-lg transition text-white text-sm font-medium">
                  <span className="flex items-center gap-2 text-yellow-500"><AlertTriangle size={18}/> Issue Warning</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-[#13131a] border border-[#2a2a35] hover:border-red-500/50 rounded-lg transition text-white text-sm font-medium">
                  <span className="flex items-center gap-2 text-red-500"><ShieldAlert size={18}/> Suspend Account (7 Days)</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-lg transition text-red-500 text-sm font-bold">
                  <span className="flex items-center gap-2"><Ban size={18}/> Permanent Ban (Founder Only)</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
