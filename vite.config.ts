import { defineConfig } from "vite";
import path from "path";

const campxPages = [
  "campx-college-feed.html",
  "campx-explore-feed.html",
  "campx-communities.html",
  "campx-dms.html",
  "campx-settings.html",
  "campx-profile.html",
  "campx-swift-zone.html",
  "campx-speeddial-nav.html",
  "campx-user-tiers.html",
  "campx-notifications-emails.html",
  "campx-subscription-billing.html",
  "campx-founder-dashboard.html",
  "campx-campus-ambassador-dashboard.html",
  "campx-college-onboarding.html",
  "campx-moderation-system.html",
  "campx-events-contests.html",
] as const;

const campxInputs = Object.fromEntries(
  campxPages.map((file) => {
    const key = file.replace(".html", "").replace(/-/g, "_");
    return [key, path.resolve(__dirname, file)];
  }),
);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        prototypes: path.resolve(__dirname, "prototypes.html"),
        onboarding: path.resolve(__dirname, "campx-onboarding.html"),
        auth_login: path.resolve(__dirname, "auth/login.html"),
        feed: path.resolve(__dirname, "feed.html"),
        privacy: path.resolve(__dirname, "privacy.html"),
        terms: path.resolve(__dirname, "terms.html"),
        refunds: path.resolve(__dirname, "refunds.html"),
        contact: path.resolve(__dirname, "contact.html"),
        ...campxInputs,
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
