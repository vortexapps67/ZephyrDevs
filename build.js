import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

console.log('Starting Zephyr Production Build...');

// 1. Run Vite Build to compile React, TypeScript, and assets
try {
  console.log('Running Vite compiler...');
  execSync('npx vite build', { stdio: 'inherit', cwd: rootDir });
  console.log('Vite compilation complete.');
} catch (error) {
  console.error('Vite compilation failed:', error);
  process.exit(1);
}

// 2. Ignore list for extra assets (already handled by Vite build or not needed)
const ignore = new Set([
  'dist', 'node_modules', '.git', '.gemini', '.vscode', '.idea',
  'src', 'components', 'tsconfig.json', 'vite.config.ts', 'postcss.config.js', 'tailwind.config.js', 'build.js'
]);

// 3. Copy other files from root (like PDFs, Word docs, raw images, XML, JSON, etc.)
const items = fs.readdirSync(rootDir);

let count = 0;
items.forEach(item => {
  if (ignore.has(item)) return;
  
  // Skip HTML/JS/CSS files at root because Vite has already compiled and optimized them in dist/
  if (item.endsWith('.html') || item.endsWith('.js') || item.endsWith('.css')) {
    return;
  }
  
  const src = path.join(rootDir, item);
  const dest = path.join(distDir, item);

  // Only copy if it doesn't already exist in dist
  if (!fs.existsSync(dest)) {
    fs.cpSync(src, dest, { recursive: true });
    count++;
  }
});

console.log(`Success! Vite compiled the app and ${count} extra assets were packaged into dist/ directory.`);
