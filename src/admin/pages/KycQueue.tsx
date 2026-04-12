import React, { useState, useEffect } from "react";
import { Search, Play, Check, X, CheckSquare, AlertTriangle, Video, ArrowRight } from "lucide-react";

interface KYCMockItem {
  id: string;
  userName: string;
  email: string;
  college: string;
  submittedAt: string;
  attempt: number;
  duration: string;
}

const MOCK_QUEUE: KYCMockItem[] = [
  { id: "kyc-001", userName: "Aditya Sharma", email: "aditya@vnr.edu", college: "VNRVJIET", submittedAt: "10 mins ago", attempt: 1, duration: "0:15" },
  { id: "kyc-002", userName: "Priya Reddy", email: "priya.reddy@snist.edu.in", college: "SNIST", submittedAt: "32 mins ago", attempt: 2, duration: "0:22" },
  { id: "kyc-003", userName: "Karan Singh", email: "karan_mec@cbit.ac.in", college: "CBIT", submittedAt: "1 hour ago", attempt: 3, duration: "0:18" },
];

export default function KycQueue() {
  const [queue, setQueue] = useState<KYCMockItem[]>(MOCK_QUEUE);
  const [reviewingItem, setReviewingItem] = useState<KYCMockItem | null>(null);

  const [checklist, setChecklist] = useState({
    faceVisible: false,
    idCardShown: false,
    idNextToFace: false,
    nameStated: false,
    idValid: false,
    faceMatches: false
  });

  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    alert(`Approved ${reviewingItem?.userName}. They are now Verified! User notified via push + email.`);
    setQueue(prev => prev.filter(item => item.id !== reviewingItem?.id));
    setReviewingItem(null);
  };

  const handleReject = () => {
    if (!rejectReason) return alert("Select a rejection reason first.");
    alert(`Rejected ${reviewingItem?.userName} due to: ${rejectReason}. User notified.`);
    setQueue(prev => prev.filter(item => item.id !== reviewingItem?.id));
    setReviewingItem(null);
  };

  // Keyboard Shortcuts Example
  useEffect(() => {
    if (!reviewingItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in generic inputs
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      if (e.key === "A" || e.key === "a") {
        e.preventDefault();
        const allChecked = Object.values(checklist).every(Boolean);
        if (allChecked) handleApprove();
        else alert("You must check all checklist items before approving.");
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewingItem, checklist, rejectReason]);

  const allChecklistItemsChecked = Object.values(checklist).every(Boolean);

  if (reviewingItem) {
    return (
      <div className="h-full flex flex-col sm:flex-row gap-6">
        {/* Verification Video Panel */}
        <div className="flex-1 bg-[#1c1c27] rounded-xl border border-[#2a2a35] overflow-hidden flex flex-col relative shadow-xl">
          <div className="p-4 border-b border-[#2a2a35] flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Video size={20}/> Validation Feed</h2>
            <button onClick={() => setReviewingItem(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>
          
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[400px]">
            {/* Mock Video Layout */}
            <div className="absolute inset-0 border-[4px] border-[#6c63ff]/20"></div>
            <div className="text-center text-gray-500">
               <Video size={48} className="mx-auto mb-4 opacity-50" />
               <p>Secure Video Proxy Stream</p>
               <p className="text-xs mt-1">Duration: {reviewingItem.duration}</p>
            </div>
            
            <button className="absolute bottom-6 left-6 p-4 bg-[#6c63ff] hover:bg-[#5b54e5] text-white rounded-full shadow-lg transition">
              <Play size={24} className="ml-1" />
            </button>
            
            {reviewingItem.attempt >= 3 && (
              <div className="absolute top-4 left-4 bg-red-600 border border-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow flex items-center gap-2 animate-pulse">
                <AlertTriangle size={16} /> Maximum Attempts Reached
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full sm:w-[350px] bg-[#1c1c27] rounded-xl border border-[#2a2a35] flex flex-col overflow-hidden shrink-0 shadow-xl">
          {/* User Profile Block */}
          <div className="p-5 border-b border-[#2a2a35] bg-[#13131a]">
            <h3 className="text-lg font-bold text-white mb-1">{reviewingItem.userName}</h3>
            <div className="text-sm text-gray-400">{reviewingItem.email}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-[#1c1c27] p-2 rounded border border-[#2a2a35]">
                <div className="text-xs text-gray-500 font-bold uppercase">College</div>
                <div className="font-semibold text-white">{reviewingItem.college}</div>
              </div>
              <div className="bg-[#1c1c27] p-2 rounded border border-[#2a2a35]">
                <div className="text-xs text-gray-500 font-bold uppercase">Submitted</div>
                <div className="font-semibold text-white">{reviewingItem.submittedAt}</div>
              </div>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex justify-between">
              Verification Checklist 
              <span className="text-[#6c63ff]">
                {Object.values(checklist).filter(Boolean).length}/6
              </span>
            </h4>
            
            <div className="space-y-3">
              {[
                { id: "faceVisible", label: "Face clearly visible" },
                { id: "idCardShown", label: "College ID card shown" },
                { id: "idNextToFace", label: "ID held next to face" },
                { id: "nameStated", label: "Name and college stated verbally" },
                { id: "idValid", label: "ID card appears valid" },
                { id: "faceMatches", label: "Face matches ID card photo" },
              ].map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={(checklist as any)[item.id]}
                      onChange={(e) => setChecklist({...checklist, [item.id]: e.target.checked})}
                    />
                    <div className="w-5 h-5 rounded border border-[#333] bg-[#13131a] peer-checked:bg-[#6c63ff] peer-checked:border-[#6c63ff] transition flex items-center justify-center">
                      <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className={`text-sm select-none transition ${
                    (checklist as any)[item.id] ? "text-gray-300" : "text-gray-400 group-hover:text-gray-200"
                  }`}>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Rejection Category</h4>
              <select 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#13131a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="">Select reason to reject...</option>
                <option value="ID not clearly visible">ID not clearly visible</option>
                <option value="Face not matching ID">Face not matching ID</option>
                <option value="Incomplete video">Incomplete video presentation</option>
                <option value="Suspected fake ID">Suspected fake ID (Flag for Ban)</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-[#2a2a35] grid grid-cols-2 gap-3 bg-[#13131a]">
            <button 
              onClick={handleReject}
              className="py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/20 transition flex items-center justify-center gap-2"
            >
              Reject <span className="hidden lg:inline text-[10px] bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded text-red-400 ml-1">R</span>
            </button>
            <button 
              onClick={handleApprove}
              disabled={!allChecklistItemsChecked}
              className={`py-3 font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                allChecklistItemsChecked 
                  ? "bg-emerald-500 text-[#0a0a0f] hover:bg-emerald-400" 
                  : "bg-emerald-500/20 text-emerald-500/50 border border-emerald-500/20 cursor-not-allowed"
              }`}
            >
              Approve <span className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded ml-1 ${allChecklistItemsChecked ? "bg-black/20 text-black border-black/30" : "bg-emerald-500/10 text-emerald-500/40 border-emerald-500/20"}`}>A</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">KYC Review Queue</h1>
          <p className="text-gray-400 text-sm mt-1">Review student video identity submissions manually.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#1c1c27] px-4 py-2 border border-[#2a2a35] rounded-xl">
          <div className="text-center px-4 border-r border-[#2a2a35]">
            <div className="text-2xl font-bold text-white">{queue.length}</div>
            <div className="text-[10px] tracking-wider uppercase text-gray-500 font-bold">Pending</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-emerald-400">42</div>
            <div className="text-[10px] tracking-wider uppercase text-gray-500 font-bold">Done Today</div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">Submitted</th>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Attempt</th>
                <th className="px-6 py-4 font-semibold">Video Info</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {queue.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <CheckSquare size={32} className="mx-auto mb-3 opacity-20" />
                    Queue is empty! Great job.
                  </td>
                </tr>
              )}
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-[#13131a] transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{item.submittedAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{item.userName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.email} • {item.college}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.attempt === 1 && <span className="px-2 py-0.5 rounded text-xs border border-gray-500/30 text-gray-400 bg-gray-500/10 font-medium">Attempt 1</span>}
                    {item.attempt === 2 && <span className="px-2 py-0.5 rounded text-xs border border-yellow-500/30 text-yellow-500 bg-yellow-500/10 font-bold">Attempt 2</span>}
                    {item.attempt >= 3 && <span className="px-2 py-0.5 rounded text-xs border border-red-500/30 text-red-500 bg-red-500/10 font-bold">Attempt {item.attempt}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Video size={16} className="text-[#6c63ff]" />
                       <span className="font-medium text-white">{item.duration} HD</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setReviewingItem(item)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent"
                    >
                      Review <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
