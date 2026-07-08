import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Pill } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';
import type { HookEntry } from '../../../shared/types';

export default function Hooks() {
  const { data, loading, error } = useLiveConfig(api.hooks);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  if (data.hooks.length === 0) {
    return (
      <>
        <PageHeader title="Hooks" />
        <EmptyState title="No hooks" description="No hooks in settings.json or agent frontmatter." />
      </>
    );
  }

  // Group by event.
  const byEvent = data.hooks.reduce<Record<string, HookEntry[]>>((acc, h) => {
    (acc[h.event] ??= []).push(h);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Hooks" count={data.hooks.length} subtitle="From settings.json and per-agent frontmatter" />
      <div className="space-y-5">
        {Object.entries(byEvent).map(([event, hooks]) => (
          <div key={event} className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-(--color-border-light) flex items-center gap-2">
              <h3 className="text-sm font-bold text-(--color-text-primary)">{event}</h3>
              <span className="text-xs text-(--color-text-tertiary)">{hooks.length}</span>
            </div>
            <div className="divide-y divide-(--color-border-light)">
              {hooks.map((h) => (
                <div key={h.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Pill tone="accent">{h.type}</Pill>
                    {h.matcher && <Pill>matcher: {h.matcher}</Pill>}
                    {h.async && <Pill tone="warning">async</Pill>}
                    <Pill tone={h.source.startsWith('agent:') ? 'cool' : 'neutral'}>{h.source}</Pill>
                  </div>
                  {h.command && (
                    <code className="block text-xs font-mono text-(--color-text-secondary) bg-(--color-surface-secondary) rounded-lg px-3 py-2 mt-1 overflow-x-auto">
                      {h.command}
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
