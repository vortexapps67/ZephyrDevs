import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

console.log('Starting Zephyr Production Build...');

// 1. Recreate dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Ignore list for production build
const ignore = new Set(['dist', 'node_modules', '.git', '.gemini', '.vscode', '.idea']);

// 3. Copy all project assets to dist
const items = fs.readdirSync(rootDir);

let count = 0;
items.forEach(item => {
  if (ignore.has(item)) return;
  const src = path.join(rootDir, item);
  const dest = path.join(distDir, item);

  fs.cpSync(src, dest, { recursive: true });
  count++;
});

console.log(`Success! ${count} assets packaged into dist/ directory for Vercel deployment.`);
