import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Pill } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';

/** ISO timestamp -> YYYY-MM-DD (fall back to raw string). */
function shortDate(iso?: string): string | null {
  if (!iso) return null;
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : iso;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-(--color-text-tertiary) mb-2 px-1">
        {title}
      </h2>
      <div className="rounded-(--radius-card) border border-(--color-border-light) bg-(--color-surface) overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-(--color-border-light) first:border-t-0">
      {children}
    </div>
  );
}

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

      <Section title={`Installed · ${data.plugins.length}`}>
        {data.plugins.map((p) => (
          <Row key={p.id}>
            <span className="w-44 shrink-0 text-[14px] font-medium text-(--color-text-primary) truncate">{p.name}</span>
            <span className="flex-1 text-[13px] text-(--color-text-tertiary) truncate font-mono">@{p.marketplace}</span>
            {p.version && (
              <span className="tnum font-mono text-[12px] text-(--color-text-tertiary) truncate max-w-32">{p.version}</span>
            )}
            <Pill tone={p.scope === 'user' ? 'accent' : 'neutral'}>{p.scope}</Pill>
          </Row>
        ))}
      </Section>

      <Section title={`Marketplaces · ${data.marketplaces.length}`}>
        {data.marketplaces.map((m) => (
          <Row key={m.id}>
            <span className="w-44 shrink-0 text-[14px] font-medium text-(--color-text-primary) truncate">{m.name}</span>
            <span className="flex-1 text-[13px] text-(--color-text-tertiary) truncate font-mono">{m.source ?? ''}</span>
            {shortDate(m.lastUpdated) && (
              <span className="tnum font-mono text-[12px] text-(--color-text-tertiary)">{shortDate(m.lastUpdated)}</span>
            )}
            {m.autoUpdate && <Pill tone="success">auto</Pill>}
          </Row>
        ))}
      </Section>
    </div>
  );
}
