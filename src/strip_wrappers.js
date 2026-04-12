import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagesDir = path.join(__dirname, 'pages');

// Pages that use AppLayout (need app/phone wrapper + speed dial removed)
const layoutPages = [
  'ExploreFeed', 'CollegeFeed', 'Communities', 'Dms', 'Profile',
  'Settings', 'NotificationsEmails', 'SubscriptionBilling',
  'UserTiers', 'EventsContests'
];

for (const pageName of layoutPages) {
  const filePath = path.join(pagesDir, pageName + '.tsx');
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Remove the outer <div className="app"><div className="phone"> wrapper
  // These are always the first JSX after the fragment
  content = content.replace(/<div className="app">\s*\n\s*<div className="phone">/g, '');

  // Remove matching closing tags at the end (before the </>)
  // Pattern: </div>\n</div> right before the fragment close
  content = content.replace(/<\/div>\s*\n\s*<\/div>\s*\n\s*\n\s*\n\s*\n\s*<\/>/g, '</>');

  // Remove the speed dial section from each page
  // The speed dial block starts with <div className="dial-backdrop" and ends before closing </div></div>
  content = content.replace(
    /\s*<div className="dial-backdrop"[^>]*>.*?<\/div>\s*\n\s*<div className="campx-nav-dock"[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*/g,
    '\n'
  );

  // Also remove the <script src="/campx-speed-dial.js"> if present
  content = content.replace(/<script[^>]*campx-speed-dial[^>]*>[\s\S]*?<\/script>/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${pageName}.tsx`);
  } else {
    console.log(`No changes needed: ${pageName}.tsx`);
  }
}

console.log('\nDone!');
