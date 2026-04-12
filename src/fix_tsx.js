import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'pages');

for (const file of fs.readdirSync(dir)) {
  if (file === 'SwiftZone.tsx') continue;
  let p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Basic TSX fixes
  content = content.replace(/style="[^"]*"/g, '');
  content = content.replace(/onclick="[^"]*"/ig, '');
  content = content.replace(/onchange="[^"]*"/ig, '');
  content = content.replace(/onsubmit="[^"]*"/ig, '');
  content = content.replace(/style='[^']*'/g, '');
  content = content.replace(/onclick='[^']*'/ig, '');
  
  content = content.replace(/disabled="disabled"/g, 'disabled');
  content = content.replace(/checked="checked"/g, 'defaultChecked');
  content = content.replace(/selected="selected"/g, 'defaultValue');
  content = content.replace(/autofocus/g, 'autoFocus');
  content = content.replace(/autocomplete/g, 'autoComplete');

  content = content.replace(/class=/g, 'className=');
  
  fs.writeFileSync(p, content, 'utf8');
}
console.log('Fixed inline attributes in TSX files');
