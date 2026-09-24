import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { readTasks, writeTasks, readDecisions, writeDecisions, readHypotheses, writeHypotheses } from '../core/csv-engine';
import { writeCalendar } from '../core/ical-builder';
import { CoworkConfig, CoworkConfigSchema, Task, Decision, Hypothesis } from '../types';

export function startLocalServer(
  projectDir: string,
  port: number = 3333,
  idleTimeoutMinutes: number = 15,
  onAutoShutdown?: () => void
): http.Server {
  const coworkDir = path.join(projectDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  const decisionsFile = path.join(coworkDir, 'decisions.csv');
  const hypothesesFile = path.join(coworkDir, 'hypotheses.csv');
  const configFile = path.join(coworkDir, 'config.json');
  const contextFile = path.join(coworkDir, 'context.md');
  const calendarFile = path.join(coworkDir, 'calendar.ics');

  const getConfig = (): CoworkConfig => {
    if (fs.existsSync(configFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        return CoworkConfigSchema.parse(raw);
      } catch {
        // Fallback
      }
    }
    return CoworkConfigSchema.parse({ projectName: path.basename(projectDir) });
  };

  let idleTimer: NodeJS.Timeout | null = null;

  const resetIdleTimer = () => {
    if (idleTimeoutMinutes <= 0) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      console.log(`\n[Cowork UI] Arrêt automatique après ${idleTimeoutMinutes} minutes d'inactivité pour préserver vos ressources.`);
      if (onAutoShutdown) {
        onAutoShutdown();
      } else {
        server.close();
        process.exit(0);
      }
    }, idleTimeoutMinutes * 60 * 1000);
  };

  resetIdleTimer();

  const readJsonBody = <T>(request: http.IncomingMessage, response: http.ServerResponse, maxBytes: number = 1024 * 1024): Promise<T | null> => {
    return new Promise((resolve) => {
      let body = '';
      let tooLarge = false;

      request.on('data', chunk => {
        if (tooLarge) return;
        body += chunk;
        if (body.length > maxBytes) {
          tooLarge = true;
          response.writeHead(413, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Payload too large (max 1MB)' }));
          request.destroy();
          resolve(null);
        }
      });

      request.on('end', () => {
        if (tooLarge) return;
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err: any) {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          resolve(null);
        }
      });

      request.on('error', () => {
        resolve(null);
      });
    });
  };

  const server = http.createServer(async (req, res) => {
    resetIdleTimer();

    // Enable CORS for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const pathname = (req.url || '/').split('?')[0];

    // 1. API: Get all project data
    if (pathname === '/api/data' && req.method === 'GET') {
      const config = getConfig();
      const tasks = readTasks(tasksFile);
      const decisions = readDecisions(decisionsFile);
      const hypotheses = readHypotheses(hypothesesFile);
      const context = fs.existsSync(contextFile) ? fs.readFileSync(contextFile, 'utf8') : '';

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ config, tasks, decisions, hypotheses, context }));
      return;
    }

    // 2. API: Update tasks
    if (pathname === '/api/tasks' && req.method === 'POST') {
      const parsed = await readJsonBody<{ tasks: Task[] }>(req, res);
      if (!parsed) return;
      if (Array.isArray(parsed.tasks)) {
        writeTasks(tasksFile, parsed.tasks);
        const config = getConfig();
        writeCalendar(calendarFile, parsed.tasks, config);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, count: parsed.tasks.length }));
        return;
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Field "tasks" must be an array' }));
      return;
    }

    // 3. API: Update decisions
    if (pathname === '/api/decisions' && req.method === 'POST') {
      const parsed = await readJsonBody<{ decisions: Decision[] }>(req, res);
      if (!parsed) return;
      if (Array.isArray(parsed.decisions)) {
        writeDecisions(decisionsFile, parsed.decisions);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, count: parsed.decisions.length }));
        return;
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Field "decisions" must be an array' }));
      return;
    }

    // 4. Serve calendar.ics
    if (pathname === '/calendar.ics' && req.method === 'GET') {
      if (fs.existsSync(calendarFile)) {
        const icsData = fs.readFileSync(calendarFile, 'utf8');
        res.writeHead(200, {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'inline; filename="calendar.ics"',
        });
        res.end(icsData);
        return;
      } else {
        res.writeHead(404);
        res.end('Calendar file not found');
        return;
      }
    }

    // 5. Serve HTML Dashboard
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getDashboardHtml());
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.on('close', () => {
    if (idleTimer) clearTimeout(idleTimer);
  });

  server.listen(port);
  return server;
}

export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Helmdash Cowork - Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; }
    .kanban-col { min-height: 480px; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Top Header -->
    <header class="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 id="proj-name" class="text-2xl font-bold tracking-tight text-white">Helmdash Cowork</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Local-First</span>
        </div>
        <p class="text-sm text-slate-400 mt-1">Binôme IA & Suivi de Projet Solopreneur</p>
      </div>

      <!-- Quick Actions & MVP Countdown -->
      <div class="flex items-center gap-4">
        <div id="mvp-box" class="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
          <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cible MVP</span>
          <span id="mvp-countdown" class="text-sm font-bold text-amber-400">Non définie</span>
        </div>
        <a href="/calendar.ics" download class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition">
          📅 Exporter .ics
        </a>
        <button onclick="refreshData()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-lg font-medium transition">
          🔄 Actualiser
        </button>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="flex gap-2 border-b border-slate-800 text-sm">
      <button onclick="switchTab('kanban')" id="tab-kanban" class="px-4 py-2 font-medium text-emerald-400 border-b-2 border-emerald-500">Kanban des Tâches</button>
      <button onclick="switchTab('decisions')" id="tab-decisions" class="px-4 py-2 font-medium text-slate-400 hover:text-slate-200">Journal des Décisions</button>
      <button onclick="switchTab('hypotheses')" id="tab-hypotheses" class="px-4 py-2 font-medium text-slate-400 hover:text-slate-200">Hypothèses & Validation</button>
      <button onclick="switchTab('context')" id="tab-context" class="px-4 py-2 font-medium text-slate-400 hover:text-slate-200">Lean Canvas</button>
    </nav>

    <!-- TAB 1: KANBAN -->
    <section id="view-kanban" class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <!-- Backlog -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backlog</span>
          <span id="count-backlog" class="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">0</span>
        </div>
        <div id="col-backlog" class="space-y-2.5 flex-1 kanban-col" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'backlog')"></div>
      </div>

      <!-- Todo -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider">À Faire</span>
          <span id="count-todo" class="text-xs bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded font-mono">0</span>
        </div>
        <div id="col-todo" class="space-y-2.5 flex-1 kanban-col" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'todo')"></div>
      </div>

      <!-- In Progress -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">En Cours</span>
          <span id="count-in_progress" class="text-xs bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded font-mono">0</span>
        </div>
        <div id="col-in_progress" class="space-y-2.5 flex-1 kanban-col" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'in_progress')"></div>
      </div>

      <!-- Blocked -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Bloqué</span>
          <span id="count-blocked" class="text-xs bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded font-mono">0</span>
        </div>
        <div id="col-blocked" class="space-y-2.5 flex-1 kanban-col" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'blocked')"></div>
      </div>

      <!-- Done -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Terminé</span>
          <span id="count-done" class="text-xs bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded font-mono">0</span>
        </div>
        <div id="col-done" class="space-y-2.5 flex-1 kanban-col" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'done')"></div>
      </div>
    </section>

    <!-- TAB 2: DECISIONS -->
    <section id="view-decisions" class="hidden bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
      <h2 class="text-base font-semibold text-white">Journal des Décisions & Dilemmes Stratégiques</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="text-slate-400 border-b border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-2.5 px-3">Date</th>
              <th class="py-2.5 px-3">Décision</th>
              <th class="py-2.5 px-3">Statut</th>
              <th class="py-2.5 px-3">Option Choisie</th>
              <th class="py-2.5 px-3">Trade-offs</th>
            </tr>
          </thead>
          <tbody id="decisions-tbody" class="divide-y divide-slate-800/60"></tbody>
        </table>
      </div>
    </section>

    <!-- TAB 3: HYPOTHESES -->
    <section id="view-hypotheses" class="hidden space-y-4">
      <h2 class="text-base font-semibold text-white">Hypothèses Risquées & Critères de Succès</h2>
      <div id="hypotheses-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </section>

    <!-- TAB 4: LEAN CANVAS -->
    <section id="view-context" class="hidden bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <pre id="context-raw" class="whitespace-pre-wrap font-mono text-xs text-slate-300"></pre>
    </section>
  </div>

  <script>
    let appData = { tasks: [], decisions: [], hypotheses: [], config: {} };

    async function refreshData() {
      try {
        const res = await fetch('/api/data');
        appData = await res.json();
        renderHeader();
        renderKanban();
        renderDecisions();
        renderHypotheses();
        document.getElementById('context-raw').textContent = appData.context || 'Aucun contexte défini.';
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }

    function renderHeader() {
      if (appData.config.projectName) {
        document.getElementById('proj-name').textContent = appData.config.projectName;
      }
      const mvpDate = appData.config.mvpTargetDate;
      if (mvpDate) {
        const diff = Math.ceil((new Date(mvpDate) - new Date()) / (1000 * 60 * 60 * 24));
        document.getElementById('mvp-countdown').textContent = diff > 0 ? \`J-\${diff} (\${mvpDate})\` : \`Échue (\${mvpDate})\`;
      }
    }

    function renderKanban() {
      const cols = ['backlog', 'todo', 'in_progress', 'blocked', 'done'];
      cols.forEach(c => {
        document.getElementById('col-' + c).innerHTML = '';
        document.getElementById('count-' + c).textContent = '0';
      });

      const counts = { backlog: 0, todo: 0, in_progress: 0, blocked: 0, done: 0 };

      appData.tasks.forEach(t => {
        const col = t.status || 'todo';
        if (counts[col] !== undefined) counts[col]++;

        const card = document.createElement('div');
        card.className = 'p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs cursor-grab transition space-y-2';
        card.draggable = true;
        card.ondragstart = (e) => e.dataTransfer.setData('text/plain', t.id);

        const badgeColor = t.priority === 'critical' ? 'bg-red-950 text-red-400 border-red-800' :
                           t.priority === 'high' ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-slate-700 text-slate-300 border-slate-600';

        card.innerHTML = \`
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] px-1.5 py-0.5 rounded border \${badgeColor} font-semibold uppercase">\${t.priority}</span>
            <span class="text-[10px] text-slate-500 font-mono">\${t.category}</span>
          </div>
          <p class="font-medium text-slate-200 leading-snug">\${t.title}</p>
          \${t.dueDate ? \`<div class="text-[10px] text-slate-400">📅 \${t.dueDate}</div>\` : ''}
        \`;

        const targetCol = document.getElementById('col-' + col);
        if (targetCol) targetCol.appendChild(card);
      });

      cols.forEach(c => {
        document.getElementById('count-' + c).textContent = counts[c];
      });
    }

    function renderDecisions() {
      const tbody = document.getElementById('decisions-tbody');
      tbody.innerHTML = '';
      appData.decisions.forEach(d => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/30';
        tr.innerHTML = \`
          <td class="py-2.5 px-3 text-slate-400 font-mono">\${d.date}</td>
          <td class="py-2.5 px-3 font-medium text-slate-200">\${d.title}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold">\${d.status}</span></td>
          <td class="py-2.5 px-3 text-slate-300">\${d.chosenOption}</td>
          <td class="py-2.5 px-3 text-slate-400">\${d.tradeOffs}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function renderHypotheses() {
      const container = document.getElementById('hypotheses-container');
      container.innerHTML = '';
      appData.hypotheses.forEach(h => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs';
        card.innerHTML = \`
          <div class="flex items-center justify-between">
            <span class="font-mono text-slate-500 font-semibold">#\${h.id}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-semibold uppercase">\${h.status}</span>
          </div>
          <p class="font-semibold text-slate-200 text-sm">\${h.hypothesis}</p>
          <div class="space-y-1 text-slate-400 mt-2">
            <div><strong class="text-slate-300">Test :</strong> \${h.validationMethod}</div>
            <div><strong class="text-slate-300">Critère :</strong> \${h.successCriteria}</div>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function allowDrop(e) { e.preventDefault(); }
    async function handleDrop(e, targetStatus) {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      const task = appData.tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        task.status = targetStatus;
        renderKanban();
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks: appData.tasks })
        });
      }
    }

    function switchTab(tab) {
      ['kanban', 'decisions', 'hypotheses', 'context'].forEach(t => {
        document.getElementById('view-' + t).classList.add('hidden');
        document.getElementById('tab-' + t).className = 'px-4 py-2 font-medium text-slate-400 hover:text-slate-200';
      });
      document.getElementById('view-' + tab).classList.remove('hidden');
      document.getElementById('tab-' + tab).className = 'px-4 py-2 font-medium text-emerald-400 border-b-2 border-emerald-500';
    }

    refreshData();
  </script>
</body>
</html>`;
}
