import { Link } from 'react-router-dom';
import { GitBranch, FolderTree, FileJson } from 'lucide-react';
import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { NAV_ITEMS } from '../components/layout/Sidebar';
import { Loading, ErrorState, Field } from '../components/shared/primitives';
import type { ConfigCategory } from '../../../shared/types';

const CATEGORY_ROUTE: Record<ConfigCategory, string> = {
  memory: '/memory',
  settings: '/settings',
  agents: '/agents',
  skills: '/skills',
  hooks: '/hooks',
  mcp: '/mcp',
  rules: '/rules',
  plugins: '/plugins',
  keybindings: '/keybindings',
  statusline: '/statusline',
};

const CATEGORY_LABEL: Record<ConfigCategory, string> = {
  memory: 'CLAUDE.md',
  settings: 'Settings',
  agents: 'Agents',
  skills: 'Skills',
  hooks: 'Hooks',
  mcp: 'MCP Servers',
  rules: 'Rules',
  plugins: 'Plugins',
  keybindings: 'Keybindings',
  statusline: 'Statusline',
};

export default function Dashboard() {
  const { data, loading, error } = useLiveConfig(api.dashboard);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const iconFor = (cat: string) => NAV_ITEMS.find((n) => n.to === CATEGORY_ROUTE[cat as ConfigCategory])?.icon;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-(--color-text-primary) mb-1">Dashboard</h1>
      <p className="text-sm text-(--color-text-tertiary) mb-6">Everything Claude Code loads from your config directory.</p>

      {/* Config root card */}
      <div className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Config root">
            <span className="font-mono text-xs break-all flex items-center gap-1">
              <FolderTree size={13} /> {data.configRoot}
            </span>
          </Field>
          <Field label="Model">{data.highlights.model ?? '—'}</Field>
          <Field label="Effort">{data.highlights.effortLevel ?? '—'}</Field>
          <Field label="Permission mode">{data.highlights.permissionMode ?? '—'}</Field>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {data.isGitRepo && (
            <span className="inline-flex items-center gap-1 text-xs text-(--color-success) bg-(--color-success)/10 rounded-md px-2 py-1">
              <GitBranch size={12} /> git-tracked
            </span>
          )}
          {data.configRootRealPath !== data.configRoot && (
            <span className="inline-flex items-center gap-1 text-xs text-(--color-purple) bg-(--color-purple)/10 rounded-md px-2 py-1">
              symlinked → {data.configRootRealPath}
            </span>
          )}
          {data.claudeJsonPath && (
            <span className="inline-flex items-center gap-1 text-xs text-(--color-text-secondary) bg-(--color-surface-tertiary) rounded-md px-2 py-1">
              <FileJson size={12} /> MCP from {data.claudeJsonPath}
            </span>
          )}
        </div>
      </div>

      {/* Count grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(CATEGORY_LABEL) as ConfigCategory[]).map((cat) => (
          <Link
            key={cat}
            to={CATEGORY_ROUTE[cat]}
            className={`group bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-4 transition-all hover:shadow-(--shadow-card-hover) ${
              data.present[cat] ? '' : 'opacity-55'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-(--color-text-tertiary) group-hover:text-(--color-accent) transition-colors">
                {iconFor(cat)}
              </span>
              <span className="text-2xl font-bold text-(--color-text-primary)">{data.counts[cat]}</span>
            </div>
            <div className="text-sm font-medium text-(--color-text-secondary) mt-2">{CATEGORY_LABEL[cat]}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
