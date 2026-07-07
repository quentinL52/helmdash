import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', 'src');
const baselinePath = path.resolve(__dirname, 'color-baseline.json');

const targetColors = [
  '14,27,46',
  '#0E1B2E',
  '#F5F1E8',
  '#F0522E' // accent
];

const isUpdate = process.argv.includes('--update');

function getCountsPerFile(dir) {
  let fileCounts = {};
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      Object.assign(fileCounts, getCountsPerFile(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let count = 0;
      
      for (const color of targetColors) {
        // case insensitive search
        const regex = new RegExp(color.replace(/,/g, '\\s*,\\s*'), 'gi');
        const matches = content.match(regex);
        if (matches) {
          count += matches.length;
        }
      }
      if (count > 0) {
        // Store relative path to be stable across environments
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        fileCounts[relativePath] = count;
      }
    }
  }
  return fileCounts;
}

const currentCounts = getCountsPerFile(rootDir);

if (isUpdate) {
  fs.writeFileSync(baselinePath, JSON.stringify(currentCounts, null, 2));
  console.log('✅ Baseline updated.');
  process.exit(0);
}

let baseline = {};
if (fs.existsSync(baselinePath)) {
  baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
} else {
  console.log('⚠️ No baseline found. Run `node scripts/color-ratchet.mjs --update` to create one.');
}

let hasErrors = false;
let totalCurrent = 0;
let totalBaseline = 0;

for (const [file, count] of Object.entries(currentCounts)) {
  totalCurrent += count;
  const baselineCount = baseline[file] || 0;
  
  if (count > baselineCount) {
    console.error(`❌ Ratchet failed for ${file}! Current: ${count}, Baseline: ${baselineCount}.`);
    hasErrors = true;
  }
}

for (const [file, baselineCount] of Object.entries(baseline)) {
  totalBaseline += baselineCount;
  if (!currentCounts[file]) {
    // File was deleted or cleared of colors, this is good!
  }
}

console.log(`Color occurrences: ${totalCurrent} (Baseline total: ${totalBaseline})`);

if (hasErrors) {
  console.error(`❌ Color ratchet failed. Do not add new hardcoded colors. Use CSS variables instead.`);
  process.exit(1);
} else {
  console.log('✅ Color ratchet passed.');
  process.exit(0);
}
