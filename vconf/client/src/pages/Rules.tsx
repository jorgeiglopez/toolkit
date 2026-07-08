import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Pill } from '../components/shared/primitives';
import { ListDetail, type ListItem } from '../components/shared/ListDetail';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { PathLine } from '../components/shared/SymlinkBadge';
import type { RuleEntry } from '../../../shared/types';

type Item = ListItem & { rule: RuleEntry };

export default function Rules() {
  const { data, loading, error } = useLiveConfig(api.rules);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const items: Item[] = data.rules.map((r) => ({
    id: r.id,
    title: r.relPath,
    subtitle: r.paths ? `scoped: ${r.paths.join(', ')}` : 'always loaded',
    searchText: r.content,
    badges: r.paths ? <Pill tone="warning">scoped</Pill> : undefined,
    rule: r,
  }));

  return (
    <div>
      <PageHeader title="Rules" count={data.rules.length} subtitle="rules/**/*.md" />
      <ListDetail
        items={items}
        placeholder="Filter rules..."
        emptyTitle="No rules"
        emptyDescription="No rules/ directory in this config."
        renderDetail={(item) => {
          const r = item.rule;
          return (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-(--color-text-primary) font-mono">{r.relPath}</h2>
                {r.paths && <Pill tone="warning">path-scoped</Pill>}
              </div>
              {r.paths && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {r.paths.map((p) => (
                    <span key={p} className="text-xs font-mono text-(--color-warning) bg-(--color-warning)/10 rounded px-1.5 py-0.5">
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <PathLine file={r} />
              <div className="mt-4 border-t border-(--color-border-light) pt-4">
                <MarkdownRenderer content={r.content} />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
