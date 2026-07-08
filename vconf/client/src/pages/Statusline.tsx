import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Field } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';
import { CodeBlock } from '../components/shared/CodeBlock';
import { PathLine } from '../components/shared/SymlinkBadge';

export default function Statusline() {
  const { data, loading, error } = useLiveConfig(api.statusline);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  if (!data.present) {
    return (
      <>
        <PageHeader title="Statusline" />
        <EmptyState title="No statusline" description="No statusLine configured in settings.json." />
      </>
    );
  }

  return (
    <div>
      <PageHeader title="Statusline" subtitle="Custom terminal status bar (settings.json statusLine)" />
      <div className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          {data.command && <Field label="Command"><span className="font-mono text-xs">{data.command}</span></Field>}
          {data.padding !== undefined && <Field label="Padding">{data.padding}</Field>}
        </div>
      </div>

      {data.scripts.map((s) => (
        <div key={s.path} className="mb-5">
          <div className="mb-2">
            <PathLine file={s} />
          </div>
          {s.content !== null ? (
            <CodeBlock text={s.content} language={s.path.split('.').pop()} />
          ) : (
            <p className="text-sm text-(--color-text-tertiary)">Script content not readable.</p>
          )}
        </div>
      ))}
    </div>
  );
}
