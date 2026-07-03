import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCheck = [
  path.join(__dirname, '../messages/fr.json'),
  path.join(__dirname, '../messages/en.json'),
  path.join(__dirname, '../src/app/(marketing)/page.tsx')
];

// V3 Spec strict forbidden keywords
const forbiddenKeywords = [
  'sso',
  'sla',
  'seats',
  'on-premise',
  'audit logs',
  'automatic monitoring',
  'automated monitoring',
  'custom mcp',
  'openrouter',
  'local models',
  'unlimited agents',
  'notion',
  'gmail',
  'calendar',
  'social publishing',
  '<Roadmap>'
];

let hasError = false;

filesToCheck.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  
  forbiddenKeywords.forEach(keyword => {
    // Note: <Roadmap> checking lowercase
    if (content.includes(keyword.toLowerCase())) {
      console.error(`❌ [ERREUR] Le claim interdit V3 "${keyword}" a été trouvé dans ${path.basename(file)}.`);
      hasError = true;
    }
  });
});

if (hasError) {
  console.error("Veuillez retirer ces claims non validés avant de merger.");
  process.exit(1);
} else {
  console.log("✅ Landing claims check passed. Aucun mot interdit détecté.");
  process.exit(0);
}
