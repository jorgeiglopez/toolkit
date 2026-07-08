# Claude Config Viewer

A minimal local web UI to visualize your entire **Claude Code** configuration in one place. Read-only. Always points at your `~/.claude` directory (and `~/.claude.json` for MCP).

Tabs: Dashboard · CLAUDE.md · Settings · Agents · Skills · Hooks · MCP Servers · Rules · Plugins · Keybindings · Statusline. Plus one **global full-text search** across everything, and **live-reload** when files change on disk.

## Run

```bash
npm run install:deps   # installs root + server + client deps
npm run dev            # starts API (:7818) + UI (:7817)
```

Then open http://localhost:7817.

- **Config directory**: defaults to `~/.claude`. Override with `--config-dir <path>` (passed to the server) or `CLAUDE_CONFIG_DIR`.
- **Ports**: `CLIENT_PORT` (default 7817) and `API_PORT` (default 7818).

## What it does (and doesn't)

- **Read-only.** No editing, no git versioning, no dependency graph (deferred).
- Resolves **symlinks** and shows link → target (this config is heavily symlinked).
- MCP servers are read from `~/.claude.json`, **only** the `mcpServers` keys — never account/oauth data.
- **Secrets masked**: env values whose keys look like `TOKEN|KEY|SECRET|PASSWORD` are shown as `••••`.
- Skills render **RULES.md first** (collapsed) then **SKILL.md**.

## Layout

```
server/   Express API + chokidar file-watch + WebSocket; one reader per config category
client/   Vite + React + Tailwind; one tab per category + global search
shared/   Types shared between server and client
```
