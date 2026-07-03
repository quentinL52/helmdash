import fs from 'fs';
import path from 'path';

const colorRegex = /\b(text|bg|border|ring)-(green|emerald|lime|red|rose|yellow|amber|blue|cyan|sky|indigo|teal|purple|violet|pink|fuchsia|orange)-[1-9]00(\/[0-9]+)?\b/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  content = content.replace(colorRegex, (match, prefix, color, opacity) => {
    hasChanges = true;
    const op = opacity ? opacity : '';
    switch(color) {
      case 'green':
      case 'emerald':
      case 'lime':
        return `${prefix}-success${op}`;
      case 'red':
      case 'rose':
        return `${prefix}-danger${op}`;
      case 'yellow':
      case 'amber':
        return `${prefix}-warning${op}`;
      case 'blue':
      case 'cyan':
      case 'sky':
      case 'indigo':
      case 'teal':
        // Spec says info|chart-N. Marking as info and adding TODO if needed, 
        // but to keep it simple we just map to info
        return `${prefix}-info${op}`;
      case 'purple':
      case 'violet':
      case 'pink':
      case 'fuchsia':
        return `${prefix}-secondary${op}`;
      case 'orange':
        // Ambiguous -> /* TODO-COLOR */ + manual pass
        return `/* TODO-COLOR */ ${prefix}-primary${op}`;
      default:
        return match;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

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
for (const file of allFiles) {
  processFile(file);
}
console.log("Codemod completed");
