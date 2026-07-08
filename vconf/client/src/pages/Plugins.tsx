import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Pill } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';

export default function Plugins() {
  const { data, loading, error } = useLiveConfig(api.plugins);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  if (data.plugins.length === 0 && data.marketplaces.length === 0) {
    return (
      <>
        <PageHeader title="Plugins" />
        <EmptyState title="No plugins" description="No installed plugins or marketplaces found." />
      </>
    );
  }

  return (
    <div>
      <PageHeader title="Plugins" count={data.plugins.length} subtitle="Installed plugins and known marketplaces" />

      <h3 className="text-sm font-bold text-(--color-text-primary) mb-3">Installed plugins</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {data.plugins.map((p) => (
          <div key={p.id} className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-(--color-text-primary) truncate">{p.name}</span>
              <Pill tone={p.scope === 'user' ? 'accent' : 'neutral'}>{p.scope}</Pill>
            </div>
            <div className="text-xs text-(--color-text-tertiary) mt-1">@{p.marketplace}</div>
            {p.version && <div className="text-xs text-(--color-text-tertiary) mt-1 font-mono">{p.version}</div>}
          </div>
        ))}
      </div>

      <h3 className="text-sm font-bold text-(--color-text-primary) mb-3">Marketplaces</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.marketplaces.map((m) => (
          <div key={m.id} className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-(--color-text-primary) truncate">{m.name}</span>
              {m.autoUpdate && <Pill tone="success">auto-update</Pill>}
            </div>
            {m.source && <div className="text-xs text-(--color-text-tertiary) mt-1 font-mono break-all">{m.source}</div>}
            {m.lastUpdated && <div className="text-xs text-(--color-text-tertiary) mt-1">updated {m.lastUpdated}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
