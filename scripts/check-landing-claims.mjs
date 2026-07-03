import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANNED_EVERYWHERE = [
  'sso', 'sla', 'team seats', 'per seat', 'on-premise', 'on premise',
  'audit logs', 'automatic monitoring', 'automated monitoring',
  'custom mcp', 'openrouter', 'local models', 'unlimited agents', 'guaranteed'
];

const BANNED_OUTSIDE_ROADMAP = [
  'notion', 'csv import', 'gmail', 'calendar', 'social publishing',
  'conversational onboarding', 'command center'
];

const filesToCheck = [
  { path: path.join(__dirname, '../messages/fr.json'), type: 'json' },
  { path: path.join(__dirname, '../messages/en.json'), type: 'json' },
  { path: path.join(__dirname, '../src/app/(marketing)/page.tsx'), type: 'tsx' }
];

let hasError = false;

function createRegex(keyword) {
  // Use word boundaries. For special characters like '-', \b handles it gracefully.
  return new RegExp(`\\b${keyword}\\b`, 'i');
}

filesToCheck.forEach(fileObj => {
  if (!fs.existsSync(fileObj.path)) {
    console.error(`❌ [ERREUR FATALE] Le fichier requis ${fileObj.path} est introuvable.`);
    process.exit(1);
  }

  const content = fs.readFileSync(fileObj.path, 'utf8');
  let roadmapContent = '';
  let outsideRoadmapContent = content;

  if (fileObj.type === 'tsx') {
    const roadmapMatch = content.match(/<section id="roadmap"[^>]*>([\s\S]*?)<\/section>/i);
    if (roadmapMatch) {
      roadmapContent = roadmapMatch[0];
      outsideRoadmapContent = content.replace(roadmapContent, '');
    }
  } else if (fileObj.type === 'json') {
    try {
      const data = JSON.parse(content);
      const landing = data.landing || {};
      const roadmapData = {};
      const outsideData = {};
      
      for (const [key, value] of Object.entries(landing)) {
        if (key.toLowerCase().startsWith('roadmap')) {
          roadmapData[key] = value;
        } else {
          outsideData[key] = value;
        }
      }
      roadmapContent = JSON.stringify(roadmapData);
      outsideRoadmapContent = JSON.stringify(outsideData);
    } catch (e) {
      console.error(`❌ [ERREUR] JSON invalide dans ${fileObj.path}`);
      hasError = true;
    }
  }

  // Check EVERYWHERE
  BANNED_EVERYWHERE.forEach(keyword => {
    const regex = createRegex(keyword);
    if (regex.test(content)) {
      console.error(`❌ [ERREUR BANNED_EVERYWHERE] "${keyword}" trouvé dans ${path.basename(fileObj.path)}.`);
      hasError = true;
    }
  });

  // Check OUTSIDE ROADMAP
  BANNED_OUTSIDE_ROADMAP.forEach(keyword => {
    const regex = createRegex(keyword);
    if (regex.test(outsideRoadmapContent)) {
      console.error(`❌ [ERREUR BANNED_OUTSIDE_ROADMAP] "${keyword}" trouvé HORS de la roadmap dans ${path.basename(fileObj.path)}.`);
      hasError = true;
    }
  });
});

if (hasError) {
  console.error("❌ Échec : Veuillez retirer ces claims non validés avant de merger.");
  process.exit(1);
} else {
  console.log("✅ Landing claims check passed. Aucun mot interdit détecté.");
  process.exit(0);
}
