import { Link } from 'react-router-dom';
import { GitBranch, Link2, FileJson, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { NAV_GROUPS } from '../components/layout/Sidebar';
import { Loading, ErrorState } from '../components/shared/primitives';
import type { ConfigCategory, DashboardData } from '../../../shared/types';

const ROUTE_TO_CATEGORY: Record<string, ConfigCategory> = {
  '/memory': 'memory',
  '/rules': 'rules',
  '/settings': 'settings',
  '/hooks': 'hooks',
  '/keybindings': 'keybindings',
  '/statusline': 'statusline',
  '/agents': 'agents',
  '/skills': 'skills',
  '/mcp': 'mcp',
  '/plugins': 'plugins',
};

const CATEGORY_HINT: Record<ConfigCategory, string> = {
  memory: 'Global instructions loaded every session',
  rules: 'Path-scoped guidance',
  settings: 'Permissions, environment, model',
  hooks: 'Event-driven automation',
  keybindings: 'Keyboard shortcuts',
  statusline: 'Custom terminal status bar',
  agents: 'Custom subagents',
  skills: 'Reusable procedures',
  mcp: 'Tool server connections',
  plugins: 'Installed plugins & marketplaces',
};

/** Collapse a home-dir prefix to ~ for display. */
function collapseHome(p: string): string {
  const m = /^(\/Users\/[^/]+|\/home\/[^/]+|\/root)(\/.*)?$/.exec(p);
  return m ? `~${m[2] ?? ''}` : p;
}

export default function Dashboard() {
  const { data, loading, error } = useLiveConfig(api.dashboard);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div>
      <Masthead data={data} />

      <div className="mt-9 space-y-8">
        {NAV_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-(--color-text-tertiary) mb-2 px-1">
              {group.title}
            </h2>
            <div className="rounded-(--radius-card) border border-(--color-border-light) bg-(--color-surface) overflow-hidden">
              {group.items.map((item, i) => {
                const cat = ROUTE_TO_CATEGORY[item.to];
                const count = data.counts[cat];
                const present = data.present[cat];
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-(--color-surface-secondary) ${
                      i > 0 ? 'border-t border-(--color-border-light)' : ''
                    } ${present ? '' : 'opacity-55'}`}
                  >
                    <span className="text-(--color-text-tertiary) group-hover:text-(--color-accent) transition-colors">
                      {item.icon}
                    </span>
                    <span className="w-32 shrink-0 text-[14px] font-medium text-(--color-text-primary) group-hover:text-(--color-accent) transition-colors">
                      {item.label}
                    </span>
                    <span className="flex-1 text-[13px] text-(--color-text-tertiary) truncate">
                      {CATEGORY_HINT[cat]}
                    </span>
                    <span className="tnum font-mono text-[13px] text-(--color-text-secondary) w-10 text-right">
                      {present ? count : '—'}
                    </span>
                    <ChevronRight
                      size={15}
                      className="text-(--color-text-tertiary) opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Masthead({ data }: { data: DashboardData }) {
  const meta: { label: string; value?: string }[] = [
    { label: 'model', value: data.highlights.model },
    { label: 'effort', value: data.highlights.effortLevel },
    { label: 'permissions', value: data.highlights.permissionMode },
  ].filter((m) => m.value);

  return (
    <header>
      <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-(--color-text-tertiary) mb-2">
        Config root
      </div>
      <h1 className="font-mono text-3xl font-semibold tracking-tight text-(--color-text-primary) break-all">
        {collapseHome(data.configRoot)}
      </h1>

      {meta.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[13px]">
          {meta.map((m) => (
            <span key={m.label} className="flex items-baseline gap-1.5">
              <span className="text-(--color-text-tertiary)">{m.label}</span>
              <span className="text-(--color-text-primary) font-medium">{m.value}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {data.isGitRepo && (
          <Badge tone="success" icon={<GitBranch size={12} strokeWidth={2} />}>version-controlled</Badge>
        )}
        {data.configRootRealPath !== data.configRoot && (
          <Badge tone="cool" icon={<Link2 size={12} strokeWidth={2} />} title={data.configRootRealPath}>
            symlinked
          </Badge>
        )}
        {data.claudeJsonPath && (
          <Badge tone="neutral" icon={<FileJson size={12} strokeWidth={2} />} title={data.claudeJsonPath}>
            MCP from {collapseHome(data.claudeJsonPath)}
          </Badge>
        )}
      </div>
    </header>
  );
}

function Badge({
  children,
  icon,
  tone,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: 'success' | 'cool' | 'neutral';
  title?: string;
}) {
  const tones = {
    success: 'text-(--color-success) bg-(--color-success)/12',
    cool: 'text-(--color-cool) bg-(--color-cool)/12',
    neutral: 'text-(--color-text-secondary) bg-(--color-surface-tertiary)',
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
