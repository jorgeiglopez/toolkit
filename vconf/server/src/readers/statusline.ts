import path from 'node:path';
import type { StatuslineData, StatuslineScript } from '../../../shared/types.js';
import { fileRef, readText, readJson, exists } from './util.js';
import { resolveAndValidate } from '../path-access.js';

interface StatusLineCfg {
  type?: string;
  command?: string;
  padding?: number;
}

/** Pull the script path out of a statusLine command like "BASH ~/.claude/statusline.sh". */
function extractScriptPath(command: string, configRoot: string): string | null {
  const tokens = command.trim().split(/\s+/);
  for (const tok of tokens) {
    const candidate = tok.replace(/^~(?=\/)/, process.env.HOME || '~');
    if (/\.(sh|py|js|ts)$/.test(candidate)) {
      const abs = path.isAbsolute(candidate) ? candidate : path.join(configRoot, candidate);
      return abs;
    }
  }
  return null;
}

export async function readStatusline(configRoot: string): Promise<StatuslineData> {
  const settingsPath = path.join(configRoot, 'settings.json');
  if (!exists(settingsPath)) return { present: false, scripts: [], raw: null };

  const settings = (await readJson<Record<string, unknown>>(settingsPath)) ?? {};
  const cfg = settings.statusLine as StatusLineCfg | undefined;
  if (!cfg) return { present: false, scripts: [], raw: null };

  const scripts: StatuslineScript[] = [];
  if (cfg.command) {
    const scriptPath = extractScriptPath(cfg.command, configRoot);
    if (scriptPath) {
      const check = resolveAndValidate(scriptPath, configRoot);
      const content = check.allowed ? await readText(check.canonicalPath) : null;
      scripts.push({ ...fileRef(scriptPath), content });
    }
  }

  return {
    present: true,
    command: cfg.command,
    padding: cfg.padding,
    scripts,
    raw: cfg,
  };
}
