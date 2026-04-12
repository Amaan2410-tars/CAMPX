import fs from 'fs';
import path from 'path';

const pagesDir = 'src/pages';

for (const f of fs.readdirSync(pagesDir)) {
  const filePath = path.join(pagesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Remove remaining onkeydown handlers (string-based HTML handlers, not React)
  content = content.replace(/\s*onkeydown="[^"]*"/g, '');
  
  // Fix tabIndex="0" to tabIndex={0}
  content = content.replace(/tabIndex="0"/g, 'tabIndex={0}');
  
  // Fix <a href=...> to note (we can't auto-convert to Link without imports, but remove broken links)
  // Actually just leave them for now - they'll cause full page reloads but won't break
  
  // Fix hidden attribute (JSX needs it as a boolean)
  content = content.replace(/ hidden>/g, ' style={{display:"none"}}>');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', f);
  }
}
console.log('Done!');
