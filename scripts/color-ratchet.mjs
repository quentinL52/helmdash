import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', 'src');

const targetColors = [
  '14,27,46',
  '#0E1B2E',
  '#F5F1E8',
  '#F0522E' // accent
];

const ALLOWED_MAX_OCCURRENCES = 250; // The threshold. The exact number from audit is ~234 but might vary slightly due to recent edits. 

function countColors(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += countColors(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      for (const color of targetColors) {
        // case insensitive search
        const regex = new RegExp(color.replace(/,/g, '\\s*,\\s*'), 'gi');
        const matches = content.match(regex);
        if (matches) {
          count += matches.length;
        }
      }
    }
  }
  return count;
}

const currentOccurrences = countColors(rootDir);
console.log(`Found ${currentOccurrences} hardcoded colors (threshold: ${ALLOWED_MAX_OCCURRENCES}).`);

if (currentOccurrences > ALLOWED_MAX_OCCURRENCES) {
  console.error(`❌ Ratchet failed! Current occurrences (${currentOccurrences}) exceed the allowed maximum (${ALLOWED_MAX_OCCURRENCES}). Please use CSS variables instead of hardcoded colors.`);
  process.exit(1);
} else {
  console.log('✅ Color ratchet passed.');
  process.exit(0);
}
