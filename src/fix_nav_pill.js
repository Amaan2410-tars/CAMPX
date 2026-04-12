import fs from 'fs';
import path from 'path';

const files = [
  'CollegeFeed.tsx',
  'Communities.tsx',
  'Profile.tsx',
  'Settings.tsx'
];

for (const file of files) {
  const filePath = path.join('src', 'pages', file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // This regex matches <div className="nav-pill" id="campx-navPill">...</div>  </div>
  // Specifically:
  // <div className="nav-pill" id="campx-navPill">
  //   <div className="pill-arrows"><span></span><span></span></div>
  //   <span className="pill-label" id="campx-pillLabel">College</span>
  //   <div className="pill-dot"></div>
  // </div>
  // </div>
  content = content.replace(/<div className="nav-pill"[^>]*>[\s\S]*?<\/div>\s*<\/div>/, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', file);
}

// Delete duplicate speed dial
try {
  fs.unlinkSync('src/pages/SpeeddialNav.tsx');
  fs.unlinkSync('src/pages/SpeeddialNav.html'); // if exists
} catch(e) {}
