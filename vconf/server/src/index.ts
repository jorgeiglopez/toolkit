import express from 'express';
import cors from 'cors';
import http from 'node:http';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';

import { getConfigRoot, getClaudeJsonPath, assertConfigRoot } from './config-root.js';
import { FileWatcher } from './file-watcher.js';
import { resolveAndValidate } from './path-access.js';
import { readText } from './readers/util.js';
import type { FileChangeEvent } from '../../shared/types.js';
import {
  buildDashboard,
  buildSearchIndex,
  readMemory,
  readSettings,
  readAgents,
  readSkills,
  readHooks,
  readMcp,
  readRules,
  readPlugins,
  readKeybindings,
  readStatusline,
} from './readers/index.js';

const CONFIG_ROOT = getConfigRoot();
assertConfigRoot(CONFIG_ROOT);
const CLAUDE_JSON = getClaudeJsonPath(CONFIG_ROOT);
const PORT = parseInt(process.env.API_PORT || '7818', 10);

const app = express();
app.use(cors());
app.use(express.json());

// Wrap async handlers so rejections become 500s instead of crashing.
type Handler = (req: express.Request, res: express.Response) => Promise<unknown>;
const wrap =
  (fn: Handler) => (req: express.Request, res: express.Response) => {
    fn(req, res).catch((err) => {
      console.error('[API]', err);
      if (!res.headersSent) res.status(500).json({ error: String(err?.message || err) });
    });
  };

app.get('/api/dashboard', wrap(async (_req, res) => res.json(await buildDashboard(CONFIG_ROOT, CLAUDE_JSON))));
app.get('/api/memory', wrap(async (_req, res) => res.json(await readMemory(CONFIG_ROOT))));
app.get('/api/settings', wrap(async (_req, res) => res.json(await readSettings(CONFIG_ROOT))));
app.get('/api/agents', wrap(async (_req, res) => res.json(await readAgents(CONFIG_ROOT))));
app.get('/api/skills', wrap(async (_req, res) => res.json(await readSkills(CONFIG_ROOT))));
app.get('/api/hooks', wrap(async (_req, res) => res.json(await readHooks(CONFIG_ROOT))));
app.get('/api/mcp', wrap(async (_req, res) => res.json(await readMcp(CLAUDE_JSON))));
app.get('/api/rules', wrap(async (_req, res) => res.json(await readRules(CONFIG_ROOT))));
app.get('/api/plugins', wrap(async (_req, res) => res.json(await readPlugins(CONFIG_ROOT))));
app.get('/api/keybindings', wrap(async (_req, res) => res.json(await readKeybindings(CONFIG_ROOT))));
app.get('/api/statusline', wrap(async (_req, res) => res.json(await readStatusline(CONFIG_ROOT))));
app.get('/api/search-index', wrap(async (_req, res) => res.json(await buildSearchIndex(CONFIG_ROOT, CLAUDE_JSON))));

// Raw single-file content (support files, statusline scripts). Sandboxed to config root + home.
app.get(
  '/api/file',
  wrap(async (req, res) => {
    const requested = req.query.path;
    if (typeof requested !== 'string') {
      res.status(400).json({ error: 'Missing ?path=' });
      return;
    }
    const check = resolveAndValidate(requested, CONFIG_ROOT);
    if (!check.allowed) {
      res.status(403).json({ error: 'Path outside allowed roots' });
      return;
    }
    const content = await readText(check.canonicalPath);
    if (content === null) {
      res.status(404).json({ error: 'File not found or not readable' });
      return;
    }
    res.json({ path: requested, realPath: check.canonicalPath, content });
  }),
);

// HTTP + WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', () => console.log('[WS] client connected'));

function broadcast(event: FileChangeEvent): void {
  const msg = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

const watchPaths = [CONFIG_ROOT, ...(CLAUDE_JSON ? [CLAUDE_JSON] : [])];
const watcher = new FileWatcher(watchPaths);
watcher.on('change', (event: FileChangeEvent) => {
  console.log(`[watch] ${event.changedFiles.map((f) => path.basename(f)).join(', ')}`);
  broadcast(event);
});
watcher.start();

server.listen(PORT, () => {
  console.log(`Claude Config Viewer API on http://localhost:${PORT}`);
  console.log(`  config root: ${CONFIG_ROOT}`);
  console.log(`  claude.json: ${CLAUDE_JSON ?? '(not found)'}`);
});

process.on('SIGINT', async () => {
  await watcher.stop();
  server.close();
  process.exit(0);
});
