import fs from 'fs';
import path from 'path';

const d = 'src/pages';
for (const f of fs.readdirSync(d)) {
  const c = fs.readFileSync(path.join(d,f),'utf8');
  const hasApp = c.includes('className="app"');
  const hasPhone = c.includes('className="phone"');
  const hasDial = c.includes('campx-nav-dock');
  console.log(f.padEnd(40), 'app:', hasApp, '  phone:', hasPhone, '  dial:', hasDial);
}
