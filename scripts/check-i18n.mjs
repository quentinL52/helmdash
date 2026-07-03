#!/usr/bin/env node

/**
 * Checks that en.json and fr.json have identical key structures.
 * Exits with code 1 if keys are missing in either direction.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const en = JSON.parse(readFileSync(resolve(root, 'messages/en.json'), 'utf8'));
const fr = JSON.parse(readFileSync(resolve(root, 'messages/fr.json'), 'utf8'));

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getKeys(obj[key], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const frKeys = new Set(getKeys(fr));

const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));
const missingInEn = [...frKeys].filter((k) => !enKeys.has(k));

let hasError = false;

if (missingInFr.length > 0) {
  console.error(`\n❌ Keys in en.json but missing in fr.json (${missingInFr.length}):`);
  missingInFr.forEach((k) => console.error(`   - ${k}`));
  hasError = true;
}

if (missingInEn.length > 0) {
  console.error(`\n❌ Keys in fr.json but missing in en.json (${missingInEn.length}):`);
  missingInEn.forEach((k) => console.error(`   - ${k}`));
  hasError = true;
}

if (hasError) {
  process.exit(1);
} else {
  console.log(`✅ i18n keys in sync: ${enKeys.size} keys`);
}
