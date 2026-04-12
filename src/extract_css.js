import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(rootDir).filter(f => f.startsWith('temp_campx-') && f.endsWith('.html'));

let allCss = `/* ══════════════════════════════════════════════════════════
   CampX — Complete Page-Specific Styles
   Recovered from original HTML files
   ══════════════════════════════════════════════════════════ */\n\n`;

for (const file of files) {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const pageName = file.replace('temp_campx-', '').replace('.html', '');
  
  // Extract all <style> blocks
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  let pageCSS = '';
  
  while ((match = styleRegex.exec(content)) !== null) {
    pageCSS += match[1] + '\n';
  }
  
  if (pageCSS.trim()) {
    allCss += `/* ── ${pageName.toUpperCase()} ─────────────────────────────── */\n`;
    allCss += pageCSS + '\n\n';
  }
}

fs.writeFileSync(path.join(rootDir, 'src', 'campx-pages.css'), allCss, 'utf8');
console.log(`Extracted CSS from ${files.length} files`);
console.log(`Output: src/campx-pages.css (${allCss.length} bytes)`);
