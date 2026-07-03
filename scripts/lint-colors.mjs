import fs from 'fs';
import path from 'path';

const IGNORE_FILE = '.color-lint-ignore.json';
// Familles de couleurs interdites (celles de Tailwind par défaut hors tokens sémantiques)
const REGEX = /\b(text|bg|border|ring)-(red|green|blue|yellow|purple|pink|indigo|orange|teal|cyan|emerald|rose|fuchsia|violet|sky|lime|amber)-[1-9]00\b/g;

function getFiles(dir, filesList = []) {
  if (!fs.existsSync(dir)) return filesList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      getFiles(path.join(dir, file), filesList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      filesList.push(path.join(dir, file));
    }
  }
  return filesList;
}

const allFiles = getFiles('src');
let occurrences = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = REGEX.exec(content)) !== null) {
    occurrences.push(`${file.replace(/\\/g, '/')}:${match[0]}`);
  }
}

if (process.argv.includes('--freeze')) {
  fs.writeFileSync(IGNORE_FILE, JSON.stringify(occurrences, null, 2));
  console.log(`Frozen ${occurrences.length} occurrences.`);
  process.exit(0);
}

let ignored = [];
try {
  ignored = JSON.parse(fs.readFileSync(IGNORE_FILE, 'utf8'));
} catch (e) {
  console.warn("No freeze file found. Enforcing strict rules.");
}

// Check for new occurrences
let failed = false;
let ignoredCopy = [...ignored];
for (const occ of occurrences) {
  const idx = ignoredCopy.indexOf(occ);
  if (idx !== -1) {
    ignoredCopy.splice(idx, 1);
  } else {
    console.error(`❌ NEW forbidden color: ${occ}`);
    failed = true;
  }
}

if (failed) {
  console.error("Please use design tokens instead (e.g. text-primary, text-destructive, bg-muted, etc.).");
  process.exit(1);
} else {
  console.log(`✅ Color lint passed.`);
}
