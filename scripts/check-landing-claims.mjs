import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On vérifie les fichiers JSON de traduction qui contiennent les claims de la landing
const filesToCheck = [
  path.join(__dirname, '../messages/fr.json'),
  path.join(__dirname, '../messages/en.json'),
  path.join(__dirname, '../src/app/(marketing)/page.tsx')
];

// Mots interdits ou promesses non tenues (selon claims-register)
const forbiddenKeywords = [
  'suppression de compte',
  'account deletion',
  'export en 1 clic',
  '1-click export'
];

let hasError = false;

filesToCheck.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  
  forbiddenKeywords.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      console.error(`❌ [ERREUR] Le claim interdit "${keyword}" a été trouvé dans ${path.basename(file)}.`);
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
