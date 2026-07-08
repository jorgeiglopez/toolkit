import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Pill } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { PathLine } from '../components/shared/SymlinkBadge';

export default function Memory() {
  const { data, loading, error } = useLiveConfig(api.memory);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  if (data.files.length === 0) {
    return (
      <>
        <PageHeader title="CLAUDE.md" />
        <EmptyState title="No CLAUDE.md" description="No global instructions file found in this config directory." />
      </>
    );
  }

  return (
    <div>
      <PageHeader title="CLAUDE.md" subtitle="Global instructions loaded into every session." />
      <div className="space-y-6">
        {data.files.map((f) => (
          <div key={f.id} className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-base font-semibold text-(--color-text-primary)">{f.title}</h2>
              {f.imports.length > 0 && <Pill tone="accent">{f.imports.length} imports</Pill>}
            </div>
            <PathLine file={f} />
            {f.imports.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {f.imports.map((imp) => (
                  <span key={imp} className="text-xs font-mono text-(--color-accent) bg-(--color-accent)/10 rounded px-1.5 py-0.5">
                    @{imp}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 border-t border-(--color-border-light) pt-4">
              <MarkdownRenderer content={f.content} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
