import fs from 'node:fs';
import path from 'node:path';
import type {
  DashboardData,
  SearchIndex,
  SearchDoc,
  ConfigCategory,
} from '../../../shared/types.js';
import { readMemory } from './memory.js';
import { readSettings } from './settings.js';
import { readAgents } from './agents.js';
import { readSkills } from './skills.js';
import { readHooks } from './hooks.js';
import { readMcp } from './mcp.js';
import { readRules } from './rules.js';
import { readPlugins } from './plugins.js';
import { readKeybindings } from './keybindings.js';
import { readStatusline } from './statusline.js';
import { readJson, exists } from './util.js';

export {
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
};

/** Aggregate a compact summary for the Dashboard. */
export async function buildDashboard(
  configRoot: string,
  claudeJsonPath: string | null,
): Promise<DashboardData> {
  const [memory, settings, agents, skills, hooks, mcp, rules, plugins, keybindings, statusline] =
    await Promise.all([
      readMemory(configRoot),
      readSettings(configRoot),
      readAgents(configRoot),
      readSkills(configRoot),
      readHooks(configRoot),
      readMcp(claudeJsonPath),
      readRules(configRoot),
      readPlugins(configRoot),
      readKeybindings(configRoot),
      readStatusline(configRoot),
    ]);

  const counts: Record<ConfigCategory, number> = {
    memory: memory.files.length,
    settings: settings.present ? 1 : 0,
    agents: agents.agents.length,
    skills: skills.skills.length,
    hooks: hooks.hooks.length,
    mcp: mcp.servers.length,
    rules: rules.rules.length,
    plugins: plugins.plugins.length,
    keybindings: keybindings.contexts.reduce((n, c) => n + c.bindings.length, 0),
    statusline: statusline.present ? 1 : 0,
  };

  const present: Record<ConfigCategory, boolean> = {
    memory: memory.files.length > 0,
    settings: settings.present,
    agents: agents.agents.length > 0,
    skills: skills.skills.length > 0,
    hooks: hooks.hooks.length > 0,
    mcp: mcp.servers.length > 0,
    rules: rules.rules.length > 0,
    plugins: plugins.plugins.length > 0 || plugins.marketplaces.length > 0,
    keybindings: keybindings.present,
    statusline: statusline.present,
  };

  const raw = (settings.raw as Record<string, unknown>) || {};
  const perms = raw.permissions as Record<string, unknown> | undefined;

  let realPath = configRoot;
  try {
    realPath = fs.realpathSync(configRoot);
  } catch {
    /* ignore */
  }

  return {
    configRoot,
    configRootRealPath: realPath,
    isGitRepo: exists(path.join(configRoot, '.git')),
    claudeJsonPath,
    counts,
    present,
    highlights: {
      model: raw.model as string | undefined,
      effortLevel: raw.effortLevel as string | undefined,
      permissionMode: perms?.defaultMode as string | undefined,
      outputStyle: raw.outputStyle as string | undefined,
      statusLine: statusline.command,
    },
  };
}

function jsonText(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

/** Build the global search index across every category. */
export async function buildSearchIndex(
  configRoot: string,
  claudeJsonPath: string | null,
): Promise<SearchIndex> {
  const [memory, settings, agents, skills, hooks, mcp, rules, plugins, keybindings, statusline] =
    await Promise.all([
      readMemory(configRoot),
      readSettings(configRoot),
      readAgents(configRoot),
      readSkills(configRoot),
      readHooks(configRoot),
      readMcp(claudeJsonPath),
      readRules(configRoot),
      readPlugins(configRoot),
      readKeybindings(configRoot),
      readStatusline(configRoot),
    ]);

  const docs: SearchDoc[] = [];

  for (const f of memory.files) {
    docs.push({ category: 'memory', route: '/memory', id: f.id, title: f.title, text: f.content });
  }
  if (settings.present) {
    docs.push({
      category: 'settings',
      route: '/settings',
      id: 'settings',
      title: 'settings.json',
      text: jsonText(settings.raw),
    });
  }
  for (const a of agents.agents) {
    docs.push({
      category: 'agents',
      route: '/agents',
      id: a.id,
      title: a.name,
      subtitle: a.description,
      text: `${a.name} ${a.description ?? ''} ${jsonText(a.frontmatter)} ${a.body}`,
    });
  }
  for (const s of skills.skills) {
    docs.push({
      category: 'skills',
      route: '/skills',
      id: s.id,
      title: s.name,
      subtitle: s.description,
      text: `${s.name} ${s.description ?? ''} ${s.rulesMd ?? ''} ${s.skillMd}`,
    });
  }
  for (const h of hooks.hooks) {
    docs.push({
      category: 'hooks',
      route: '/hooks',
      id: h.id,
      title: `${h.event}${h.matcher ? ` (${h.matcher})` : ''}`,
      subtitle: h.source,
      text: `${h.event} ${h.matcher ?? ''} ${h.command ?? ''} ${jsonText(h.detail)} ${h.source}`,
    });
  }
  for (const m of mcp.servers) {
    docs.push({
      category: 'mcp',
      route: '/mcp',
      id: m.id,
      title: m.name,
      subtitle: m.scope,
      text: `${m.name} ${m.scope} ${m.command ?? ''} ${(m.args ?? []).join(' ')} ${m.url ?? ''}`,
    });
  }
  for (const r of rules.rules) {
    docs.push({
      category: 'rules',
      route: '/rules',
      id: r.id,
      title: r.title,
      text: `${r.relPath} ${(r.paths ?? []).join(' ')} ${r.content}`,
    });
  }
  for (const p of plugins.plugins) {
    docs.push({
      category: 'plugins',
      route: '/plugins',
      id: p.id,
      title: p.name,
      subtitle: p.marketplace,
      text: `${p.name} ${p.marketplace} ${p.scope} ${p.version ?? ''}`,
    });
  }
  for (const mk of plugins.marketplaces) {
    docs.push({
      category: 'plugins',
      route: '/plugins',
      id: `mk:${mk.id}`,
      title: mk.name,
      subtitle: 'marketplace',
      text: `${mk.name} ${mk.source ?? ''}`,
    });
  }
  for (const c of keybindings.contexts) {
    for (const b of c.bindings) {
      docs.push({
        category: 'keybindings',
        route: '/keybindings',
        id: `${c.context}:${b.keys}`,
        title: `${b.keys} → ${b.action ?? '(unbound)'}`,
        subtitle: c.context,
        text: `${c.context} ${b.keys} ${b.action ?? ''}`,
      });
    }
  }
  if (statusline.present) {
    docs.push({
      category: 'statusline',
      route: '/statusline',
      id: 'statusline',
      title: 'Status line',
      text: `${statusline.command ?? ''} ${statusline.scripts.map((s) => s.content ?? '').join(' ')}`,
    });
  }

  return { docs };
}
