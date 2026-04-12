import React from "react";
import { Search, Megaphone, Check, X, Link, Mail, IndianRupee } from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  contact: string;
  email: string;
  type: string;
  budget: string;
  audience: string;
  status: "Pending" | "Active" | "Rejected";
  submitted: string;
}

const MOCK_BRANDS: BrandItem[] = [
  { id: "b1", name: "Internshala", contact: "Neha Gupta", email: "neha@internshala.com", type: "Banner Ad", budget: "₹50,000", audience: "All Colleges", status: "Active", submitted: "May 10, 2026" },
  { id: "b2", name: "GeeksforGeeks", contact: "Rahul V", email: "marketing@gfg.org", type: "Sponsored Content", budget: "₹25,000", audience: "Engineering only", status: "Pending", submitted: "May 12, 2026" },
  { id: "b3", name: "RedBull India", contact: "Samir K", email: "samir@redbull.in", type: "Event Sponsorship", budget: "₹1,50,000", audience: "All Colleges", status: "Pending", submitted: "May 12, 2026" },
];

export default function Brands() {
  const getStatusBadge = (status: BrandItem["status"]) => {
    switch (status) {
      case "Active": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">Active</span>;
      case "Pending": return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20">Pending Review</span>;
      case "Rejected": return <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-bold border border-red-400/20">Rejected</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Brand Advertising</h1>
          <p className="text-gray-400 text-sm mt-1">Review B2B sponsorship and advertising applications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BRANDS.map(brand => (
          <div key={brand.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl flex flex-col hover:border-[#6c63ff]/30 transition overflow-hidden">
            <div className="p-5 border-b border-[#2a2a35] flex items-start justify-between bg-[#13131a]">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Megaphone size={18} className="text-[#6c63ff]" /> {brand.name}
                </h3>
                <div className="text-sm text-gray-500">{brand.submitted}</div>
              </div>
              {getStatusBadge(brand.status)}
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Contact Info</div>
                <div className="text-sm text-white">{brand.contact}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={12}/> {brand.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#13131a] p-3 rounded border border-[#2a2a35]">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Ad Format</div>
                  <div className="text-sm text-white font-medium">{brand.type}</div>
                </div>
                <div className="bg-[#13131a] p-3 rounded border border-[#2a2a35]">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Budget Setup</div>
                  <div className="text-sm text-emerald-400 font-bold flex items-center gap-1"><IndianRupee size={12}/>{brand.budget}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Target Audience</div>
                <div className="text-sm text-gray-300 bg-[#2a2a35]/30 px-3 py-1.5 rounded">{brand.audience}</div>
              </div>
            </div>

            {brand.status === "Pending" ? (
              <div className="p-4 border-t border-[#2a2a35] bg-[#13131a] grid grid-cols-2 gap-3">
                <button className="py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm"><X size={16}/> Reject</button>
                <button className="py-2.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition flex items-center justify-center gap-2 text-sm"><Check size={16}/> Approve</button>
              </div>
            ) : (
              <div className="p-4 border-t border-[#2a2a35] bg-[#13131a]">
                <button className="w-full py-2.5 bg-[#1c1c27] text-white border border-[#333] font-medium rounded-lg hover:bg-[#2a2a35] transition flex items-center justify-center gap-2 text-sm"><Link size={16}/> Review Metrics</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
