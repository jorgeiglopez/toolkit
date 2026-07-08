import path from 'node:path';
import type { HookEntry, HooksData } from '../../../shared/types.js';
import { readJson, readText, listDir, parseFrontmatter, exists } from './util.js';

interface RawHook {
  type?: string;
  command?: string;
  async?: boolean;
  [k: string]: unknown;
}
interface RawHookGroup {
  matcher?: string;
  hooks?: RawHook[];
}

/** Flatten a `hooks` object ({ EVENT: [{matcher, hooks:[...]}] }) into entries. */
function flatten(
  hooksObj: Record<string, unknown> | undefined,
  source: string,
  idPrefix: string,
): HookEntry[] {
  if (!hooksObj || typeof hooksObj !== 'object') return [];
  const out: HookEntry[] = [];
  let n = 0;
  for (const [event, groupsRaw] of Object.entries(hooksObj)) {
    const groups = Array.isArray(groupsRaw) ? (groupsRaw as RawHookGroup[]) : [];
    for (const group of groups) {
      const list = Array.isArray(group.hooks) ? group.hooks : [];
      for (const h of list) {
        out.push({
          id: `${idPrefix}-${n++}`,
          event,
          matcher: group.matcher,
          type: h.type || 'command',
          command: typeof h.command === 'string' ? h.command : undefined,
          detail: h as Record<string, unknown>,
          source,
          async: h.async === true,
        });
      }
    }
  }
  return out;
}

/** Aggregate hooks from settings.json AND each agent's frontmatter `hooks:` block. */
export async function readHooks(configRoot: string): Promise<HooksData> {
  const hooks: HookEntry[] = [];

  const settingsPath = path.join(configRoot, 'settings.json');
  if (exists(settingsPath)) {
    const settings = (await readJson<Record<string, unknown>>(settingsPath)) ?? {};
    hooks.push(...flatten(settings.hooks as Record<string, unknown>, 'settings.json', 'settings'));
  }

  const agentsDir = path.join(configRoot, 'agents');
  if (exists(agentsDir)) {
    for (const file of (await listDir(agentsDir)).filter((f) => f.endsWith('.md'))) {
      const raw = await readText(path.join(agentsDir, file));
      if (!raw) continue;
      const { frontmatter } = parseFrontmatter(raw);
      if (frontmatter.hooks) {
        const agentName = (frontmatter.name as string) || path.basename(file, '.md');
        hooks.push(
          ...flatten(frontmatter.hooks as Record<string, unknown>, `agent:${agentName}`, `agent-${agentName}`),
        );
      }
    }
  }

  return { hooks };
}
