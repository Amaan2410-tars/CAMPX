import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Activity, BarChart2 } from "lucide-react";

const DAU_DATA = [
  { day: "Mon", dau: 3200 },
  { day: "Tue", dau: 3400 },
  { day: "Wed", dau: 3100 },
  { day: "Thu", dau: 3800 },
  { day: "Fri", dau: 4500 },
  { day: "Sat", dau: 5100 },
  { day: "Sun", dau: 4900 },
];

const FUNNEL_DATA = [
  { step: "Signed Up", count: 25000 },
  { step: "Email Verified", count: 22000 },
  { step: "KYC Submitted", count: 18000 },
  { step: "KYC Approved", count: 15400 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Deep dive into user retention, active usage, and conversion funnels.</p>
        </div>
        <select className="bg-[#1c1c27] text-sm text-white border border-[#2a2a35] rounded-lg py-2 px-4 focus:outline-none focus:border-[#6c63ff]">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Quarter</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Daily Active Users (DAU)</div>
          <div className="flex items-end gap-3 mb-1">
            <h2 className="text-3xl font-bold text-white">4,812</h2>
            <span className="text-sm font-semibold text-emerald-400 mb-1 flex items-center"><TrendingUp size={14} className="mr-0.5"/> 8.4%</span>
          </div>
          <p className="text-xs text-gray-500">Average across selected period</p>
        </div>
        
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Monthly Active Users (MAU)</div>
          <div className="flex items-end gap-3 mb-1">
            <h2 className="text-3xl font-bold text-white">18,590</h2>
            <span className="text-sm font-semibold text-emerald-400 mb-1 flex items-center"><TrendingUp size={14} className="mr-0.5"/> 12.1%</span>
          </div>
          <p className="text-xs text-gray-500">Average across selected period</p>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Stickiness Ratio (DAU/MAU)</div>
          <div className="flex items-end gap-3 mb-1">
            <h2 className="text-3xl font-bold text-white">25.8%</h2>
          </div>
          <p className="text-xs text-gray-500">Healthy engaged ecosystem marker</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DAU Chart */}
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={18} className="text-[#6c63ff]"/> User Engagement Density
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={DAU_DATA}>
                 <defs>
                   <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                 <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                 <RechartsTooltip contentStyle={{ backgroundColor: "#13131a", borderColor: "#2a2a35", borderRadius: "8px" }} />
                 <Area type="monotone" dataKey="dau" stroke="#6c63ff" strokeWidth={3} fillOpacity={1} fill="url(#colorDau)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* KYC Funnel Chart */}
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart2 size={18} className="text-emerald-400"/> Identity Verification Funnel
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ left: 40 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" horizontal={false} />
                 <XAxis type="number" stroke="#6b7280" fontSize={12} hide />
                 <YAxis dataKey="step" type="category" stroke="#fff" fontSize={12} axisLine={false} tickLine={false} />
                 <RechartsTooltip cursor={{fill: '#2a2a35', opacity: 0.4}} contentStyle={{ backgroundColor: "#13131a", borderColor: "#2a2a35", borderRadius: "8px" }} />
                 <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Cohort Retention Table Placeholder */}
      <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] overflow-hidden">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-400"/> Cohort Retention (Weekly)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-500 bg-[#13131a]">
              <tr>
                <th className="px-4 py-3">Cohort</th>
                <th className="px-4 py-3">Users</th>
                <th className="px-4 py-3">Week 1</th>
                <th className="px-4 py-3">Week 2</th>
                <th className="px-4 py-3">Week 3</th>
                <th className="px-4 py-3">Week 4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35] text-gray-300">
              <tr>
                <td className="px-4 py-3 font-medium">Apr 01 - Apr 07</td>
                <td className="px-4 py-3 text-gray-500">1,240</td>
                <td className="px-4 py-3"><div className="bg-emerald-500/80 text-black px-2 py-1 rounded text-center font-bold">100%</div></td>
                <td className="px-4 py-3"><div className="bg-emerald-500/60 text-black px-2 py-1 rounded text-center font-bold">68%</div></td>
                <td className="px-4 py-3"><div className="bg-emerald-500/40 text-white px-2 py-1 rounded text-center font-bold">42%</div></td>
                <td className="px-4 py-3"><div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-center font-bold">38%</div></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Apr 08 - Apr 14</td>
                <td className="px-4 py-3 text-gray-500">1,412</td>
                <td className="px-4 py-3"><div className="bg-emerald-500/80 text-black px-2 py-1 rounded text-center font-bold">100%</div></td>
                <td className="px-4 py-3"><div className="bg-emerald-500/60 text-black px-2 py-1 rounded text-center font-bold">72%</div></td>
                <td className="px-4 py-3 text-gray-500 text-center">-</td>
                <td className="px-4 py-3 text-gray-500 text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
