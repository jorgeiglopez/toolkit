import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';
import { PathLine } from '../components/shared/SymlinkBadge';

export default function Keybindings() {
  const { data, loading, error } = useLiveConfig(api.keybindings);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  if (!data.present || data.contexts.length === 0) {
    return (
      <>
        <PageHeader title="Keybindings" />
        <EmptyState title="No keybindings" description="No keybindings.json in this config directory." />
      </>
    );
  }

  return (
    <div>
      <PageHeader title="Keybindings" subtitle={<PathLine file={data} />} />
      <div className="space-y-5">
        {data.contexts.map((ctx) => (
          <div key={ctx.context} className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-(--color-border-light)">
              <h3 className="text-sm font-bold text-(--color-text-primary)">{ctx.context}</h3>
            </div>
            <div className="divide-y divide-(--color-border-light)">
              {ctx.bindings.map((b) => (
                <div key={b.keys} className="px-5 py-2.5 flex items-center justify-between gap-4">
                  <kbd className="text-xs font-mono font-semibold text-(--color-text-primary) bg-(--color-surface-secondary) border border-(--color-border-light) rounded-md px-2 py-1">
                    {b.keys}
                  </kbd>
                  <span className={`text-sm font-mono ${b.action ? 'text-(--color-text-secondary)' : 'text-(--color-danger) italic'}`}>
                    {b.action ?? 'unbound'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
