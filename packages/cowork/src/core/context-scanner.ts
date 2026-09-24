import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ScannedContext {
  projectName: string;
  description: string;
  stack: string[];
  hasGit: boolean;
  branch: string;
  recentCommits: string[];
  existingDocs: string[];
  packageManager: string;
}

export function scanRepository(targetDir: string): ScannedContext {
  const result: ScannedContext = {
    projectName: path.basename(path.resolve(targetDir)),
    description: '',
    stack: [],
    hasGit: false,
    branch: '',
    recentCommits: [],
    existingDocs: [],
    packageManager: 'unknown',
  };

  // 1. Detect Node / Package.json
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) result.projectName = pkg.name;
      if (pkg.description) result.description = pkg.description;

      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      // Detect frameworks
      if (allDeps.next) result.stack.push('Next.js');
      if (allDeps.react) result.stack.push('React');
      if (allDeps.vue) result.stack.push('Vue');
      if (allDeps.svelte) result.stack.push('Svelte');
      if (allDeps.express) result.stack.push('Express');
      if (allDeps['@fastify'] || allDeps.fastify) result.stack.push('Fastify');
      if (allDeps.hono) result.stack.push('Hono');
      if (allDeps['@prisma/client'] || allDeps.prisma) result.stack.push('Prisma');
      if (allDeps['@supabase/supabase-js']) result.stack.push('Supabase');
      if (allDeps.tailwindcss) result.stack.push('Tailwind CSS');
      if (allDeps.typescript) result.stack.push('TypeScript');
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Detect Lockfiles / Package Manager
  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) {
    result.packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) {
    result.packageManager = 'yarn';
  } else if (fs.existsSync(path.join(targetDir, 'package-lock.json'))) {
    result.packageManager = 'npm';
  } else if (fs.existsSync(path.join(targetDir, 'bun.lockb')) || fs.existsSync(path.join(targetDir, 'bun.lock'))) {
    result.packageManager = 'bun';
  }

  // 2. Detect Python
  if (fs.existsSync(path.join(targetDir, 'pyproject.toml')) || fs.existsSync(path.join(targetDir, 'requirements.txt'))) {
    result.stack.push('Python');
    if (fs.existsSync(path.join(targetDir, 'uv.lock'))) result.packageManager = 'uv';
  }

  // 3. Detect Git info
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) {
    result.hasGit = true;
    try {
      result.branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: targetDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      const logOutput = execSync('git log -n 5 --oneline', {
        cwd: targetDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      if (logOutput) {
        result.recentCommits = logOutput.split('\n').map(l => l.trim());
      }
    } catch {
      // Git command failed, keep defaults
    }
  }

  // 4. Scan Existing Docs
  const commonDocs = [
    'README.md',
    'PLAN_DEV.md',
    'ROADMAP.md',
    'AGENTS.md',
    'CONTRIBUTING.md',
    'docs/pain-points.md',
  ];

  for (const doc of commonDocs) {
    if (fs.existsSync(path.join(targetDir, doc))) {
      result.existingDocs.push(doc);
    }
  }

  return result;
}
