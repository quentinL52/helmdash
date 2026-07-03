#!/usr/bin/env node

/**
 * Heuristic scanner for hardcoded French strings in React components.
 * Searches for common French words and accented characters in TSX files.
 * Outputs a count (warning, not blocking).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcDir = resolve(root, 'src');

const FR_PATTERNS = [
  /[àâäéèêëïîôùûüÿçœæ]/,
  /\b(Paramètres|Tableau de bord|Ajouter|Supprimer|Modifier|Enregistrer|Annuler|Rechercher|Chargement)\b/,
  /\b(Connexion|Déconnexion|Bienvenue|Erreur|Succès|Fonctionnalité|Abonnement|Facturation)\b/,
  /\b(Commencer|Continuer|Confirmer|Retour|Suivant|Fermer|Ouvrir)\b/i,
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'messages') continue;
      files.push(...walk(full));
    } else if (extname(full) === '.tsx') {
      files.push(full);
    }
  }
  return files;
}

let totalHits = 0;
const findings = [];

for (const file of walk(srcDir)) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip imports, comments, classNames
    if (line.trim().startsWith('import ')) continue;
    if (line.trim().startsWith('//')) continue;
    if (line.trim().startsWith('*')) continue;
    if (/className/.test(line)) continue;

    for (const pattern of FR_PATTERNS) {
      if (pattern.test(line)) {
        const relPath = relative(root, file);
        findings.push(`  ${relPath}:${i + 1}: ${line.trim().slice(0, 100)}`);
        totalHits++;
        break;
      }
    }
  }
}

console.log(`\n🔍 Hardcoded French strings scan: ${totalHits} hits found`);
if (findings.length > 0) {
  console.log('\nSample findings (first 30):');
  findings.slice(0, 30).forEach((f) => console.log(f));
  if (findings.length > 30) {
    console.log(`  ... and ${findings.length - 30} more`);
  }
}
console.log(`\nBaseline: ${totalHits}`);
