import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/** Resolve the Claude config root: --config-dir flag, CLAUDE_CONFIG_DIR env, else ~/.claude. */
export function getConfigRoot(): string {
  const args = process.argv.slice(2);
  const flagIdx = args.indexOf('--config-dir');
  if (flagIdx !== -1 && args[flagIdx + 1]) {
    return path.resolve(args[flagIdx + 1]);
  }
  if (process.env.CLAUDE_CONFIG_DIR) {
    return path.resolve(process.env.CLAUDE_CONFIG_DIR);
  }
  return path.join(os.homedir(), '.claude');
}

/**
 * Path to ~/.claude.json (holds MCP servers + a lot of sensitive account state).
 * It's a sibling of the config dir under the home directory. Returns null if absent.
 */
export function getClaudeJsonPath(configRoot: string): string | null {
  // Standard layout: <home>/.claude  ->  <home>/.claude.json
  const candidate = path.join(path.dirname(configRoot), '.claude.json');
  if (fs.existsSync(candidate)) return candidate;
  const homeCandidate = path.join(os.homedir(), '.claude.json');
  if (fs.existsSync(homeCandidate)) return homeCandidate;
  return null;
}

/** Assert the config root exists; throw a clear message otherwise. */
export function assertConfigRoot(configRoot: string): void {
  if (!fs.existsSync(configRoot)) {
    throw new Error(
      `Claude config directory not found at: ${configRoot}\n` +
        `Set CLAUDE_CONFIG_DIR or pass --config-dir <path> to point at your ~/.claude.`,
    );
  }
}
