import React, { useState } from "react";
import { Search, Filter, CalendarDays, Check, X, MapPin, Users, IndianRupee } from "lucide-react";

interface EventItem {
  id: string;
  name: string;
  organizer: string;
  college: string;
  date: string;
  tickets: number;
  revenue: string;
  status: "Pending" | "Live" | "Completed" | "Rejected";
}

const MOCK_EVENTS: EventItem[] = [
  { id: "e1", name: "TechNova 2026", organizer: "CBIT Tech Club", college: "CBIT", date: "Aug 15, 2026", tickets: 250, revenue: "₹25,000", status: "Live" },
  { id: "e2", name: "AI Summit Hyd", organizer: "CampX Internal", college: "Multiple", date: "Sep 10, 2026", tickets: 1200, revenue: "₹3,40,000", status: "Live" },
  { id: "e3", name: "VNR Coding Marathon", organizer: "VNR CSE Dept", college: "VNRVJIET", date: "Nov 01, 2026", tickets: 0, revenue: "₹0", status: "Pending" },
  { id: "e4", name: "SNIST Cultural Fest", organizer: "Student Council", college: "SNIST", date: "Dec 12, 2026", tickets: 0, revenue: "₹0", status: "Rejected" },
];

export default function Events() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredEvents = activeTab === "All" 
    ? MOCK_EVENTS 
    : MOCK_EVENTS.filter(e => e.status === activeTab);

  const getStatusBadge = (status: EventItem["status"]) => {
    switch (status) {
      case "Live": return <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">Live</span>;
      case "Pending": return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/20">Pending</span>;
      case "Completed": return <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-xs font-bold border border-blue-400/20">Completed</span>;
      case "Rejected": return <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-bold border border-red-400/20">Rejected</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Events & Contests</h1>
          <p className="text-gray-400 text-sm mt-1">Manage proposals, ticket sales, and platform activities.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white text-sm font-semibold rounded-lg hover:bg-[#5b54e5] transition border border-transparent">
          <CalendarDays size={16} /> Create Event
        </button>
      </div>

      <div className="flex border-b border-[#2a2a35] space-x-6">
        {["All", "Pending", "Live", "Completed"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium text-sm transition-colors ${
              activeTab === tab ? "border-b-2 border-[#6c63ff] text-[#6c63ff]" : "text-gray-400 hover:text-white border-b-2 border-transparent"
            }`}
          >
            {tab} Events
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-[#1c1c27] border border-[#2a2a35] rounded-xl overflow-hidden flex flex-col hover:border-[#6c63ff]/30 transition">
            <div className="h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 relative">
              <div className="absolute top-3 right-3">{getStatusBadge(event.status)}</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1">{event.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{event.organizer} • {event.college}</p>
              
              <div className="space-y-2 text-sm mt-auto">
                <div className="flex items-center gap-2 text-gray-300"><CalendarDays size={16} className="text-gray-500"/> {event.date}</div>
                <div className="flex items-center gap-2 text-gray-300"><MapPin size={16} className="text-gray-500"/> {event.college === "Multiple" ? "Platform-wide" : "On-Campus"}</div>
              </div>

              <div className="mt-5 p-3 bg-[#13131a] rounded-lg border border-[#2a2a35] flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                   <Users size={16} className="text-[#6c63ff]"/> {event.tickets} Tickets
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold">
                   <IndianRupee size={16} /> {event.revenue}
                </div>
              </div>

              {event.status === "Pending" && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded font-bold text-sm hover:bg-red-500/20 transition flex items-center justify-center gap-1"><X size={16}/> Reject</button>
                  <button className="py-2 bg-emerald-500 text-black rounded font-bold text-sm hover:bg-emerald-400 transition flex items-center justify-center gap-1"><Check size={16}/> Approve</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border border-[#2a2a35] rounded-xl border-dashed">
            No events found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
