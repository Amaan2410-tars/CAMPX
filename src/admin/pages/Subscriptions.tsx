import React from "react";
import { Search, Filter, IndianRupee, TrendingUp, CreditCard, RefreshCw, AlertTriangle } from "lucide-react";

interface SubItem {
  id: string;
  user: string;
  college: string;
  plan: "Pro" | "Plus";
  amount: string;
  cycle: "Monthly" | "Annual";
  status: "Active" | "Past Due" | "Canceled";
  nextRenewal: string;
}

const MOCK_SUBS: SubItem[] = [
  { id: "sub_1", user: "Yash Kumar", college: "CBIT", plan: "Pro", amount: "₹199", cycle: "Monthly", status: "Active", nextRenewal: "Jun 1, 2026" },
  { id: "sub_2", user: "Karan Singh", college: "VNRVJIET", plan: "Plus", amount: "₹499", cycle: "Monthly", status: "Active", nextRenewal: "May 28, 2026" },
  { id: "sub_3", user: "Neha Reddy", college: "IITH", plan: "Pro", amount: "₹1,999", cycle: "Annual", status: "Past Due", nextRenewal: "Payment Failed" },
  { id: "sub_4", user: "Aditi Rao", college: "SNIST", plan: "Pro", amount: "₹199", cycle: "Monthly", status: "Canceled", nextRenewal: "Ends May 30" },
];

export default function Subscriptions() {
  const getStatusBadge = (status: SubItem["status"]) => {
    switch (status) {
      case "Active": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20 flex items-center gap-1 w-fit"><RefreshCw size={10}/> Active</span>;
      case "Past Due": return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20 flex items-center gap-1 w-fit"><AlertTriangle size={10}/> Grace Period</span>;
      case "Canceled": return <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded text-xs font-bold border border-gray-400/20 w-fit">Canceled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Revenue</h1>
          <p className="text-gray-400 text-sm mt-1">Manage user tiers, billing cycles, and MRR metrics.</p>
        </div>
        <button className="px-4 py-2 bg-[#1c1c27] text-white text-sm font-semibold rounded-lg border border-[#333] hover:bg-[#2a2a35] transition">Export CSV</button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total MRR</div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-white flex items-center"><IndianRupee size={20} className="mr-1 text-gray-400"/> 4,12,500</div>
          <div className="text-xs text-emerald-400 font-medium mt-1">+12% from last month</div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pro Tier</div>
            <div className="p-2 bg-[#a855f7]/10 text-[#a855f7] rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#a855f7]">8,204</div>
          <div className="text-xs text-gray-400 font-medium mt-1">₹1.6M ARR contribution</div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Plus Tier</div>
            <div className="p-2 bg-[#ec4899]/10 text-[#ec4899] rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#ec4899]">1,140</div>
          <div className="text-xs text-gray-400 font-medium mt-1">₹680K ARR contribution</div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Churn Rate</div>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><TrendingUp size={16} className="rotate-180" /></div>
          </div>
          <div className="text-2xl font-bold text-white">2.4%</div>
          <div className="text-xs text-yellow-500 font-medium mt-1">32 past due invoices</div>
        </div>
      </div>

      <div className="flex w-full items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search subscriptions..." 
            className="w-full bg-[#1c1c27] text-sm text-white placeholder-gray-500 border border-[#2a2a35] rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] focus:outline-none"
          />
        </div>
        <button className="flex items-center justify-center p-2 bg-[#1c1c27] border border-[#2a2a35] rounded-lg text-gray-400 hover:text-white transition">
           <Filter size={20} />
        </button>
      </div>

      <div className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#13131a] border-b border-[#2a2a35]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">College</th>
                <th className="px-6 py-4 font-semibold">Plan Details</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Next Renewal / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {MOCK_SUBS.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#13131a] transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{sub.user}</div>
                    <div className="text-xs mt-1 text-gray-500">{sub.id}</div>
                  </td>
                  <td className="px-6 py-4">{sub.college}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${sub.plan === "Pro" ? "text-[#a855f7]" : "text-[#ec4899]"}`}>{sub.plan}</span>
                    <span className="text-gray-500 ml-2">({sub.cycle})</span>
                  </td>
                  <td className="px-6 py-4 flex items-center font-medium text-white">
                    <IndianRupee size={14} className="text-gray-500 mr-0.5" />{sub.amount}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                  <td className="px-6 py-4">
                    {sub.status === "Past Due" ? (
                       <button className="text-xs text-white bg-yellow-600 hover:bg-yellow-500 transition px-3 py-1.5 rounded font-medium shadow-lg">Retry Payment</button>
                    ) : (
                       <span className="text-gray-300">{sub.nextRenewal}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2a2a35] bg-[#13131a] flex justify-between items-center text-xs text-gray-500">
           <div>Showing 4 of 9,344 Subscriptions</div>
        </div>
      </div>
    </div>
  );
}
