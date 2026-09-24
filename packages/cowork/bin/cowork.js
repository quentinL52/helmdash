#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const distCli = path.join(__dirname, '..', 'dist', 'cli', 'index.js');

if (fs.existsSync(distCli)) {
  const { runCli } = require(distCli);
  runCli();
} else {
  // Development mode: compile or run via tsx/ts-node if available, or transpile
  try {
    require('tsx/cjs');
    const { runCli } = require('../src/cli/index.ts');
    runCli();
  } catch {
    console.error('Packages/cowork must be built first: run `npm run build` in packages/cowork.');
    process.exit(1);
  }
}
