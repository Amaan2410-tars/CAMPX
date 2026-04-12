import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.resolve(__dirname, 'pages');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

function kebabToPascal(str) {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function processHtmlToTsx(htmlContent, componentName) {
  // Extract body content roughly
  const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<\/body>/);
  let content = bodyMatch ? bodyMatch[1] : htmlContent;

  // Remove trailing scripts
  content = content.replace(/<script[\s\S]*?<\/script>/g, '');
  
  // Basic JSX conversions
  let jsx = content
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/readonly/g, 'readOnly')
    .replace(/onclick=/g, 'onClick=') // these will need manual fixing to {() => ...} if they contain JS
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    
  // close self-closing tags (very rough approach)
  jsx = jsx.replace(/<(img|input|br|hr|meta|link)([^>]*?)(?<!\/)>/g, '<$1$2 />');

  // Any inline styles like `style="..."` to `style={{...}}` is tricky to regex perfectly.
  // We'll leave `style=` alone for now and developers will fix manually, or we try a simple regex:
  // (ignoring for now to prevent breaking complex properties)

  const template = `import React from 'react';
import '../index.css';

export default function ${componentName}() {
  return (
    <>
      ${jsx}
    </>
  );
}
`;
  return template;
}

const files = fs.readdirSync(rootDir);
const htmlFiles = files.filter(f => f.endsWith('.html') && f.startsWith('campx-') && f !== 'campx-swift-zone.html');

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  
  // naming: campx-user-tiers.html -> UserTiers
  let baseName = file.replace('.html', '').replace('campx-', '');
  let componentName = kebabToPascal(baseName);
  
  const tsxContent = processHtmlToTsx(htmlContent, componentName);
  
  const targetFilePath = path.join(pagesDir, `${componentName}.tsx`);
  fs.writeFileSync(targetFilePath, tsxContent, 'utf8');
  
  // remove the old html file
  fs.unlinkSync(filePath);
  
  console.log(`Migrated ${file} to ${componentName}.tsx`);
}
