import type { McpData, McpServerEntry } from '../../../shared/types.js';
import { readJson } from './util.js';
import { redactEnv } from './redact.js';

interface RawMcpServer {
  type?: string;
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  [k: string]: unknown;
}

function transportOf(s: RawMcpServer): McpServerEntry['transport'] {
  if (s.type === 'http' || s.type === 'sse') return s.type;
  if (s.url) return 'http';
  if (s.command) return 'stdio';
  return 'unknown';
}

function toEntry(name: string, scope: string, s: RawMcpServer): McpServerEntry {
  // Whitelist only the fields we render; never pass through unknown keys blindly,
  // and redact env + headers.
  const safeRaw: Record<string, unknown> = {
    type: s.type,
    command: s.command,
    args: s.args,
    url: s.url,
    env: redactEnv(s.env),
    headers: redactEnv(s.headers),
  };
  return {
    id: `${scope}:${name}`,
    name,
    scope,
    transport: transportOf(s),
    command: s.command,
    args: s.args,
    url: s.url,
    env: redactEnv(s.env),
    raw: safeRaw,
  };
}

/**
 * Read MCP servers from ~/.claude.json. CRITICAL: only the `mcpServers` map and
 * `projects[*].mcpServers` are ever touched — never oauthAccount/userID/etc.
 */
export async function readMcp(claudeJsonPath: string | null): Promise<McpData> {
  if (!claudeJsonPath) return { sourcePath: null, servers: [] };

  const doc = await readJson<{
    mcpServers?: Record<string, RawMcpServer>;
    projects?: Record<string, { mcpServers?: Record<string, RawMcpServer> }>;
  }>(claudeJsonPath);
  if (!doc) return { sourcePath: claudeJsonPath, servers: [] };

  const servers: McpServerEntry[] = [];

  for (const [name, s] of Object.entries(doc.mcpServers ?? {})) {
    servers.push(toEntry(name, 'global', s));
  }

  for (const [projPath, proj] of Object.entries(doc.projects ?? {})) {
    for (const [name, s] of Object.entries(proj.mcpServers ?? {})) {
      servers.push(toEntry(name, `project:${projPath}`, s));
    }
  }

  servers.sort((a, b) => a.scope.localeCompare(b.scope) || a.name.localeCompare(b.name));
  return { sourcePath: claudeJsonPath, servers };
}
