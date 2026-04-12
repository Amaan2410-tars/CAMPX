import React, { useState } from "react";
import { Search, Filter, Plus, ChevronLeft, Building2, Users, GraduationCap, MessagesSquare, Activity, CalendarDays, MoreVertical, X, Check, EyeOff, Ban, SearchX } from "lucide-react";

// Types corresponding to DB
type CollegeStatus = "Active" | "Hidden" | "Suspended" | "Deactivated";

interface College {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  type: string;
  status: CollegeStatus;
  usersCount: number;
  verifiedCount: number;
  hasAmbassador: boolean;
  addedAt: string;
}

// Mock Data
const MOCK_COLLEGES: College[] = [
  { id: "1", name: "Chaitanya Bharathi Institute of Technology", code: "CBIT", city: "Hyderabad", state: "Telangana", type: "Engineering", status: "Active", usersCount: 2450, verifiedCount: 1800, hasAmbassador: true, addedAt: "2024-01-10" },
  { id: "2", name: "IIT Hyderabad", code: "IITH", city: "Hyderabad", state: "Telangana", type: "Multiple", status: "Active", usersCount: 1200, verifiedCount: 1100, hasAmbassador: false, addedAt: "2024-02-15" },
  { id: "3", name: "VNR Vignana Jyothi Institute", code: "VNRVJIET", city: "Hyderabad", state: "Telangana", type: "Engineering", status: "Hidden", usersCount: 0, verifiedCount: 0, hasAmbassador: false, addedAt: "2024-04-12" },
  { id: "4", name: "Sreenidhi Institute of Science", code: "SNIST", city: "Hyderabad", state: "Telangana", type: "Engineering", status: "Suspended", usersCount: 840, verifiedCount: 620, hasAmbassador: true, addedAt: "2024-03-01" },
];

export default function Colleges() {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [activeTab, setActiveTab] = useState("Overview");

  const filteredColleges = MOCK_COLLEGES.filter(c => {
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: CollegeStatus) => {
    switch (status) {
      case "Active": return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full font-medium border border-emerald-500/20">Active</span>;
      case "Hidden": return <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-full font-medium border border-gray-500/20">Hidden</span>;
      case "Suspended": return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full font-medium border border-yellow-500/20">Suspended</span>;
      case "Deactivated": return <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full font-medium border border-red-500/20">Deactivated</span>;
    }
  };

  const handleCreateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddModalOpen(false);
    alert("New college created and set to Hidden status.");
  };

  if (selectedCollege) {
    return (
      <div className="space-y-6">
        {/* Detail View Header */}
        <div className="flex items-center gap-4 border-b border-[#2a2a35] pb-4">
          <button 
            onClick={() => setSelectedCollege(null)}
            className="p-2 hover:bg-[#1c1c27] rounded-lg transition text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{selectedCollege.name}</h2>
              {getStatusBadge(selectedCollege.status)}
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <span>{selectedCollege.code}</span> • 
              <span>{selectedCollege.city}, {selectedCollege.state}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-3">
            <button className="px-4 py-2 bg-[#1c1c27] text-white text-sm font-medium rounded-lg border border-[#333] hover:bg-[#2a2a35] transition">Edit Details</button>
            <button className="px-4 py-2 bg-[#6c63ff] text-white text-sm font-medium rounded-lg border border-[#6c63ff] hover:bg-[#5b54e5] transition">Change Status</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a35]">
          {[
            { id: "Overview", icon: Building2 },
            { id: "Users", icon: Users },
            { id: "Team", icon: GraduationCap },
            { id: "Communities", icon: MessagesSquare },
            { id: "Posts", icon: Activity },
            { id: "Events", icon: CalendarDays }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? "border-[#6c63ff] text-[#6c63ff]" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon size={16} />
              {tab.id}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-white">{selectedCollege.usersCount.toLocaleString()}</div>
                </div>
                <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Verified Users</div>
                  <div className="text-2xl font-bold text-green-400">{selectedCollege.verifiedCount.toLocaleString()}</div>
                </div>
                <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Ambassador</div>
                  <div className={`text-xl font-bold ${selectedCollege.hasAmbassador ? "text-purple-400" : "text-yellow-400"}`}>
                    {selectedCollege.hasAmbassador ? "Assigned" : "Not Assigned"}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#1c1c27] rounded-xl border border-[#2a2a35] max-w-2xl">
                <h3 className="font-semibold text-white mb-4">Registration Setup</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#2a2a35] pb-2">
                    <span className="text-gray-400">Official Domain (Path A)</span>
                    <span className="text-white font-medium">@{selectedCollege.code.toLowerCase()}.ac.in</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35] pb-2">
                    <span className="text-gray-400">Platform ID Cards (Path B)</span>
                    <span className="text-white font-medium">Enabled (Manual KYC)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35] pb-2">
                    <span className="text-gray-400">Course List</span>
                    <span className="text-white font-medium">B.Tech, M.Tech, MBA, MCA</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                {!selectedCollege.hasAmbassador && (
                   <button disabled className="px-6 py-2.5 bg-green-500/20 text-green-400 text-sm font-semibold rounded-lg border border-green-500/20 cursor-not-allowed opacity-50 flex items-center gap-2">
                     <Check size={16} /> Go Live (Needs Ambassador)
                   </button>
                )}
                {selectedCollege.status !== "Hidden" && (
                   <button className="px-6 py-2.5 bg-gray-500/20 text-gray-300 text-sm font-semibold rounded-lg border border-gray-500/30 flex items-center gap-2 hover:bg-gray-500/30 transition">
                     <EyeOff size={16} /> Hide College
                   </button>
                )}
                <button className="px-6 py-2.5 bg-yellow-500/20 text-yellow-500 text-sm font-semibold rounded-lg border border-yellow-500/30 flex items-center gap-2 hover:bg-yellow-500/30 transition">
                  <Ban size={16} /> Suspend Operations
                </button>
                <div className="flex-1"></div>
                <button className="px-6 py-2.5 bg-red-500/10 text-red-500 text-sm font-semibold rounded-lg border border-red-500/20 flex items-center gap-2 hover:bg-red-500/20 transition">
                  <X size={16} /> Deactivate
                </button>
              </div>
            </div>
          )}

          {activeTab !== "Overview" && (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <SearchX size={48} className="mb-4 opacity-20" />
              <p>Module loaded dynamically.</p>
              <p className="text-xs mt-2">Displaying data specific to {selectedCollege.name}.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Colleges Registry</h1>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search colleges..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          
          <select 
            className="bg-[#1c1c27] text-sm text-white border border-[#2a2a35] rounded-lg py-2 px-3 focus:outline-none focus:border-[#6c63ff]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Hidden">Hidden</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent"
          >
            <Plus size={16} /> Add College
          </button>
        </div>
      </div>

      {/* College Table */}
      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">College Name</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Users</th>
                <th className="px-6 py-4 font-semibold text-center">Ambassador</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    No colleges found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-[#13131a] transition cursor-pointer" onClick={() => setSelectedCollege(college)}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{college.name}</div>
                      <div className="text-xs mt-1 text-gray-500">{college.code} • Added {college.addedAt}</div>
                    </td>
                    <td className="px-6 py-4">{college.city}, {college.state}</td>
                    <td className="px-6 py-4">{college.type}</td>
                    <td className="px-6 py-4">{getStatusBadge(college.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium">{college.usersCount.toLocaleString()}</div>
                      <div className="text-xs text-green-400">{college.verifiedCount.toLocaleString()} verified</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {college.hasAmbassador ? (
                        <span className="inline-flex items-center justify-center p-1.5 bg-purple-500/10 text-purple-400 rounded-lg" title="Assigned">
                          <Check size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center p-1.5 bg-gray-500/10 text-gray-500 rounded-lg" title="Not Assigned">
                          <X size={16} />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a35] rounded transition" onClick={(e) => { e.stopPropagation(); }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2a2a35] flex items-center justify-between text-xs text-gray-500 bg-[#13131a]">
          <div>Showing 1 to {filteredColleges.length} of {filteredColleges.length} entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-[#1c1c27] border border-[#333] rounded hover:bg-[#2a2a35] transition text-white">Previous</button>
            <button className="px-3 py-1 bg-[#1c1c27] border border-[#333] rounded hover:bg-[#2a2a35] transition text-white">Next</button>
          </div>
        </div>
      </div>

      {/* Add College Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#2a2a35]">
              <h2 className="text-xl font-bold text-white">Add New College</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="add-college-form" onSubmit={handleCreateCollege} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">College Name*</label>
                    <input required type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" placeholder="e.g. Oxford Engineering College" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">College Code*</label>
                    <input required type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" placeholder="e.g. OXF" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Type*</label>
                    <select required className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]">
                      <option value="">Select Type...</option>
                      <option>Engineering</option>
                      <option>Medical</option>
                      <option>Management</option>
                      <option>Arts & Science</option>
                      <option>Multiple Disciplines</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">City*</label>
                    <input required type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">State*</label>
                    <input required type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Official Email Domain (Optional)</label>
                    <input type="text" className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6c63ff]" placeholder="@collegedomain.edu" />
                    <p className="text-xs text-gray-500 mt-1">Providing this enables automated Path A student verification.</p>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-[#2a2a35] bg-[#13131a] flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 bg-transparent border border-[#333] text-gray-300 rounded-lg hover:bg-[#2a2a35] transition text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                form="add-college-form"
                type="submit" 
                className="px-5 py-2.5 bg-[#6c63ff] border border-transparent text-white rounded-lg hover:bg-[#5b54e5] transition font-semibold text-sm"
              >
                Create College
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
