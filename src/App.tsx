import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { getSupabase, isSupabaseConfigured } from "./lib/supabase";

// Import Student App pages
import SwiftZone from "./pages/SwiftZone";
import CampusAmbassadorDashboard from "./pages/CampusAmbassadorDashboard";
import CollegeFeed from "./pages/CollegeFeed";
import CollegeOnboarding from "./pages/CollegeOnboarding";
import Communities from "./pages/Communities";
import Dms from "./pages/Dms";
import EventsContests from "./pages/EventsContests";
import ExploreFeed from "./pages/ExploreFeed";
import FounderDashboard from "./pages/FounderDashboard";
import ModerationSystem from "./pages/ModerationSystem";
import NotificationsEmails from "./pages/NotificationsEmails";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SettingsSubPage from "./pages/SettingsSubPage";
import SubscriptionBilling from "./pages/SubscriptionBilling";
import UserTiers from "./pages/UserTiers";
import Branding from "./pages/Branding";

// Import Admin App pages
import AdminAuthGuard from "./admin/AdminAuthGuard";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import Colleges from "./admin/pages/Colleges";
import Users from "./admin/pages/Users";
import KycQueue from "./admin/pages/KycQueue";
import AdminCommunities from "./admin/pages/Communities";
import PostsModeration from "./admin/pages/PostsModeration";
import Events from "./admin/pages/Events";
import Brands from "./admin/pages/Brands";
import Subscriptions from "./admin/pages/Subscriptions";
import Ambassadors from "./admin/pages/Ambassadors";
import Announcements from "./admin/pages/Announcements";
import Analytics from "./admin/pages/Analytics";
import AdminSettings from "./admin/pages/Settings";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const sb = getSupabase();
    sb?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: authListener } = sb?.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    ) || { data: { subscription: { unsubscribe: () => {} } } };
    return () => authListener.subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff'}}>Loading...</div>;

  if (!session && isSupabaseConfigured()) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default function App() {
  // Intercept the 'branding' subdomain to serve it as a standalone app openly.
  if (window.location.hostname.includes('branding')) {
    return <Branding />;
  }

  return (
    <Routes>
      {/* ---------------- Public / Branding Routes ---------------- */}
      <Route path="/branding" element={<Branding />} />

      {/* ---------------- Admin Panel Routes ---------------- */}
      <Route path="/auth/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminAuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="colleges" element={<Colleges />} />
          <Route path="users" element={<Users />} />
          <Route path="kyc" element={<KycQueue />} />
          <Route path="communities" element={<AdminCommunities />} />
          <Route path="moderation" element={<PostsModeration />} />
          <Route path="events" element={<Events />} />
          <Route path="brands" element={<Brands />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="ambassadors" element={<Ambassadors />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* ---------------- Student/Core App Routes ---------------- */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/explore-feed" replace />} />
        <Route path="/explore-feed" element={<ExploreFeed />} />
        <Route path="/college-feed" element={<CollegeFeed />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/dms" element={<Dms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/:pageId" element={<SettingsSubPage />} />
        <Route path="/swift-zone" element={<SwiftZone />} />
        <Route path="/notifications-emails" element={<NotificationsEmails />} />
        <Route path="/subscription-billing" element={<SubscriptionBilling />} />
        <Route path="/user-tiers" element={<UserTiers />} />
        <Route path="/events-contests" element={<EventsContests />} />
      </Route>

      {/* Standalone pages (no phone frame) */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/campus-ambassador" element={<CampusAmbassadorDashboard />} />
      <Route path="/founder-dashboard" element={<FounderDashboard />} />
      <Route path="/college-onboarding" element={<CollegeOnboarding />} />
      <Route path="/moderation-system" element={<ModerationSystem />} />
    </Routes>
  );
}
