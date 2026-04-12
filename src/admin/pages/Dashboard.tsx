import React from "react";
import { Users2, ShieldCheck, GraduationCap, Building2, CreditCard, Star, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const METRICS = [
  { label: "Total Users", value: "24,592", icon: Users2, color: "text-blue-400" },
  { label: "Verified Users", value: "18,401", icon: ShieldCheck, color: "text-green-400" },
  { label: "Colleges Live", value: "42", icon: Building2, color: "text-purple-400" },
  { label: "Active Communities", value: "318", icon: Activity, color: "text-orange-400" },
  { label: "Pro Subscribers", value: "8,204", icon: Star, color: "text-yellow-400" },
  { label: "Plus Subscribers", value: "1,140", icon: Star, color: "text-pink-400" },
  { label: "Revenue (MTD)", value: "₹4.2L", icon: CreditCard, color: "text-emerald-400" },
  { label: "Pending KYC", value: "142", icon: GraduationCap, color: "text-red-400" },
];

const SIGNUP_DATA = [
  { name: "1 Apr", users: 400 },
  { name: "5 Apr", users: 300 },
  { name: "10 Apr", users: 550 },
  { name: "15 Apr", users: 480 },
  { name: "20 Apr", users: 600 },
  { name: "25 Apr", users: 800 },
  { name: "30 Apr", users: 950 },
];

const REVENUE_DATA = [
  { name: "Nov", rev: 120000 },
  { name: "Dec", rev: 180000 },
  { name: "Jan", rev: 210000 },
  { name: "Feb", rev: 280000 },
  { name: "Mar", rev: 350000 },
  { name: "Apr", rev: 420000 },
];

const TIER_DATA = [
  { name: "Verified", value: 9057, color: "#4ade80" },
  { name: "Basic", value: 6191, color: "#9ca3af" },
  { name: "Pro", value: 8204, color: "#a855f7" },
  { name: "Plus", value: 1140, color: "#ec4899" },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "New Pro Subscription", user: "Aditya Sharma", college: "CBIT", time: "2 mins ago", type: "monetization" },
  { id: 2, action: "KYC Approved", user: "Priya Singh", college: "VNR VJIET", time: "15 mins ago", type: "moderation" },
  { id: 3, action: "New College Created", user: "System", college: "IIT Hyderabad", time: "1 hour ago", type: "system" },
  { id: 4, action: "Community Created: AI Club", user: "Karan Verma", college: "CBIT", time: "2 hours ago", type: "content" },
  { id: 5, action: "User Flagged for Spam", user: "Rahul K", college: "SNIST", time: "3 hours ago", type: "moderation" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((item, idx) => (
          <div key={idx} className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-[#13131a] ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35] lg:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4">User Growth (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SIGNUP_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#13131a", borderColor: "#2a2a35" }} />
                <Line type="monotone" dataKey="users" stroke="#6c63ff" strokeWidth={3} dot={{ r: 4, fill: "#6c63ff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1c1c27] p-5 rounded-xl border border-[#2a2a35]">
          <h3 className="text-base font-semibold text-white mb-4">Tier Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={TIER_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {TIER_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#13131a", borderColor: "#2a2a35" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TIER_DATA.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></div>
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-[#1c1c27] rounded-xl border border-[#2a2a35] overflow-hidden">
          <div className="p-4 border-b border-[#2a2a35]">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Action Items Queue</h3>
          </div>
          <div className="divide-y divide-[#2a2a35]">
            <div className="p-4 flex items-center justify-between hover:bg-[#13131a] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg"><GraduationCap size={20} /></div>
                <div>
                  <div className="text-sm font-medium text-white">Pending KYC Reviews</div>
                  <div className="text-xs text-gray-400">142 users waiting for video verification</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-[#13131a] border border-[#333] rounded text-xs text-white hover:bg-[#6c63ff] hover:border-[#6c63ff] transition">Review</button>
            </div>
            
            <div className="p-4 flex items-center justify-between hover:bg-[#13131a] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Building2 size={20} /></div>
                <div>
                  <div className="text-sm font-medium text-white">Colleges Missing Ambassador</div>
                  <div className="text-xs text-gray-400">12 active colleges have no representative</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-[#13131a] border border-[#333] rounded text-xs text-white hover:bg-[#6c63ff] hover:border-[#6c63ff] transition">Assign</button>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-[#13131a] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg"><ShieldCheck size={20} /></div>
                <div>
                  <div className="text-sm font-medium text-white">Reported Posts</div>
                  <div className="text-xs text-gray-400">45 high-priority content flags</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-[#13131a] border border-[#333] rounded text-xs text-white hover:bg-[#6c63ff] hover:border-[#6c63ff] transition">Moderate</button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1c1c27] rounded-xl border border-[#2a2a35] overflow-hidden">
          <div className="p-4 border-b border-[#2a2a35] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Live Activity</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </div>
          <div className="p-2 h-[260px] overflow-y-auto custom-scrollbar">
            {RECENT_ACTIVITY.map(act => (
              <div key={act.id} className="p-3 mb-1 flex gap-3 text-sm rounded-lg hover:bg-[#13131a]">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#6c63ff] shrink-0"></div>
                <div className="flex-1">
                  <div className="text-gray-200"><span className="font-semibold text-white">{act.user}</span> • {act.action}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>{act.college}</span>
                    <span>{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
