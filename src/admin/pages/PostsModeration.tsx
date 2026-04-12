import React, { useState } from "react";
import { Search, Filter, ShieldAlert, MoreVertical, Flag, MessageSquare, Image as ImageIcon, Trash2, UserX, AlertTriangle, X } from "lucide-react";

interface ReportedPost {
  id: string;
  type: "Post" | "Comment";
  content: string;
  author: string;
  college: string;
  reports: number;
  feedType: "College" | "Explore";
  reportedAt: string;
  hasMedia: boolean;
  status: "Pending" | "Reviewed";
}

const MOCK_REPORTS: ReportedPost[] = [
  { id: "p1", type: "Post", content: "Can someone share the leaked mid-term papers for DSA? Will pay ₹500.", author: "anonym_4x9", college: "CBIT", reports: 12, feedType: "College", reportedAt: "10 mins ago", hasMedia: false, status: "Pending" },
  { id: "p2", type: "Comment", content: "Stop acting so smart you complete idiot. Everyone hates your club.", author: "rahul_v", college: "VNRVJIET", reports: 4, feedType: "Explore", reportedAt: "1 hour ago", hasMedia: false, status: "Pending" },
  { id: "p3", type: "Post", content: "Join my new crypto betting app! Guaranteed 10x returns! [Link]", author: "cryptobro22", college: "IITH", reports: 28, feedType: "Explore", reportedAt: "2 hours ago", hasMedia: true, status: "Pending" },
];

export default function PostsModeration() {
  const [activeTab, setActiveTab] = useState<"Reported" | "All">("Reported");
  const [selectedPost, setSelectedPost] = useState<ReportedPost | null>(null);

  const renderReportedList = () => (
    <div className="space-y-4">
      {MOCK_REPORTS.map(post => (
        <div key={post.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl p-5 flex flex-col hover:border-[#6c63ff]/50 transition cursor-pointer" onClick={() => setSelectedPost(post)}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-500/10 text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                  <Flag size={12} /> {post.reports} Reports
                </span>
                <span className="text-gray-500 text-xs">{post.feedType} Feed • {post.type} • {post.reportedAt}</span>
              </div>
              <p className="text-white text-sm font-medium line-clamp-2 mb-3">"{post.content}"</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><UserX size={14} /> {post.author}</span>
                <span>{post.college}</span>
                {post.hasMedia && <span className="flex items-center gap-1 text-[#6c63ff]"><ImageIcon size={14} /> Attached Media</span>}
              </div>
            </div>
            <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#13131a] transition" onClick={(e) => { e.stopPropagation(); }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Posts & Moderation</h1>
          <p className="text-gray-400 text-sm mt-1">Review flagged content and enforce community guidelines.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search content..." 
              className="w-full sm:w-64 bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <button className="p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Column: List */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex border-b border-[#2a2a35] mb-4 shrink-0">
            <button
              onClick={() => setActiveTab("Reported")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "Reported" ? "border-red-500 text-red-500" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Reported Queue <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{MOCK_REPORTS.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("All")}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "All" ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              All Platform Posts
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === "Reported" ? renderReportedList() : (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-[#1c1c27] rounded-xl border border-[#2a2a35]">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>Global feed view is currently disabled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review Panel */}
        {selectedPost ? (
          <div className="w-full sm:w-[400px] flex flex-col border border-[#2a2a35] bg-[#1c1c27] rounded-xl shadow-xl overflow-hidden shrink-0">
            <div className="p-4 border-b border-[#2a2a35] flex items-center justify-between bg-[#13131a]">
              <h3 className="font-bold text-white flex items-center gap-2"><ShieldAlert size={18} className="text-red-400"/> Content Review</h3>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Reported Content</h4>
                <div className="p-4 bg-[#13131a] border border-[#2a2a35] rounded-xl text-white text-sm">
                  {selectedPost.content}
                </div>
                {selectedPost.hasMedia && (
                  <div className="mt-2 h-32 bg-[#2a2a35] rounded-xl border border-[#333] flex items-center justify-center text-gray-500">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Author Details</h4>
                <div className="p-3 bg-[#13131a] border border-[#2a2a35] rounded-xl text-sm flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{selectedPost.author}</div>
                    <div className="text-gray-500 text-xs">{selectedPost.college}</div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#1c1c27] border border-[#333] text-gray-300 rounded hover:text-white text-xs font-semibold">View Profile</button>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Report Breakdown ({selectedPost.reports})</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm bg-red-500/10 p-2 rounded text-red-400 border border-red-500/20">
                    <span>Spam or misleading</span>
                    <span className="font-bold text-red-500">72%</span>
                  </div>
                  <div className="flex justify-between text-sm bg-orange-500/10 p-2 rounded text-orange-400 border border-orange-500/20">
                    <span>Harassment</span>
                    <span className="font-bold text-orange-500">28%</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#2a2a35] bg-[#13131a] space-y-3">
              <button 
                onClick={() => { alert("Post removed."); setSelectedPost(null); }}
                className="w-full flex justify-between items-center px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
              >
                Delete Content <Trash2 size={18} />
              </button>
              <button 
                onClick={() => { alert("User warned."); }}
                className="w-full flex justify-between items-center px-4 py-3 bg-[#2a2a35] text-yellow-500 font-bold rounded-lg hover:bg-[#333] transition border border-[#333]"
              >
                Issue Warning to User <AlertTriangle size={18} />
              </button>
              <button 
                onClick={() => { alert("Report dismissed."); setSelectedPost(null); }}
                className="w-full text-center py-2 text-sm text-gray-500 hover:text-white font-medium transition"
              >
                Dismiss Report
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex w-[400px] flex-col items-center justify-center p-8 text-center bg-[#13131a] border border-[#2a2a35] rounded-xl text-gray-500 shrink-0">
             <ShieldAlert size={48} className="mb-4 opacity-20" />
             <h3 className="font-bold text-gray-400 mb-2">Select a Report</h3>
             <p className="text-sm">Click on any reported post from the queue to view full context, author history, and take moderation action.</p>
          </div>
        )}

      </div>
    </div>
  );
}
