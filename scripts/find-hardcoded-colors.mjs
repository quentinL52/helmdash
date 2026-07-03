import fs from 'fs';
import path from 'path';

const REGEX = /\b(text|bg|border|ring)-(red|green|blue|yellow|purple|pink|indigo|orange|teal|cyan|emerald|rose|fuchsia|violet|sky|lime|amber)-[1-9]00(\/[0-9]+)?\b/g;

function getFiles(dir, filesList = []) {
  if (!fs.existsSync(dir)) return filesList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      getFiles(path.join(dir, file), filesList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      filesList.push(path.join(dir, file));
    }
  }
  return filesList;
}

const allFiles = getFiles('src');
let occurrences = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = REGEX.exec(content)) !== null) {
    occurrences++;
    console.log(`${file}: ${match[0]}`);
  }
}

console.log(`${occurrences}`);
if (occurrences > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
