import path from 'node:path';
import type {
  PluginsData,
  InstalledPluginEntry,
  MarketplaceEntry,
} from '../../../shared/types.js';
import { readJson, exists } from './util.js';

interface InstalledEntry {
  scope?: string;
  installPath?: string;
  projectPath?: string;
  version?: string;
  gitCommitSha?: string;
}

export async function readPlugins(configRoot: string): Promise<PluginsData> {
  const pluginsDir = path.join(configRoot, 'plugins');
  const plugins: InstalledPluginEntry[] = [];
  const marketplaces: MarketplaceEntry[] = [];

  const installedPath = path.join(pluginsDir, 'installed_plugins.json');
  if (exists(installedPath)) {
    const doc = await readJson<{ plugins?: Record<string, InstalledEntry[]> }>(installedPath);
    for (const [key, list] of Object.entries(doc?.plugins ?? {})) {
      // key looks like "name@marketplace"
      const at = key.lastIndexOf('@');
      const name = at > 0 ? key.slice(0, at) : key;
      const marketplace = at > 0 ? key.slice(at + 1) : '';
      for (const inst of Array.isArray(list) ? list : []) {
        plugins.push({
          id: `${key}:${inst.scope ?? ''}:${inst.projectPath ?? ''}`,
          name,
          marketplace,
          scope: inst.scope ?? 'user',
          version: inst.version,
          installPath: inst.installPath,
        });
      }
    }
  }

  const marketplacesPath = path.join(pluginsDir, 'known_marketplaces.json');
  if (exists(marketplacesPath)) {
    const doc = await readJson<Record<string, unknown>>(marketplacesPath);
    // Shape varies; handle both { marketplaces: {...} } and a flat map.
    const container =
      doc && typeof doc === 'object' && 'marketplaces' in doc
        ? (doc.marketplaces as Record<string, Record<string, unknown>>)
        : (doc as Record<string, Record<string, unknown>>);
    for (const [name, m] of Object.entries(container ?? {})) {
      if (!m || typeof m !== 'object') continue;
      const src = m.source as Record<string, unknown> | string | undefined;
      const sourceStr =
        typeof src === 'string'
          ? src
          : src && typeof src === 'object'
            ? ((src.source as string) || (src.repo as string) || JSON.stringify(src))
            : undefined;
      marketplaces.push({
        id: name,
        name,
        source: sourceStr,
        autoUpdate: m.autoUpdate as boolean | undefined,
        lastUpdated: m.lastUpdated as string | undefined,
        installLocation: m.installLocation as string | undefined,
      });
    }
  }

  plugins.sort((a, b) => a.name.localeCompare(b.name));
  marketplaces.sort((a, b) => a.name.localeCompare(b.name));
  return { plugins, marketplaces };
}
