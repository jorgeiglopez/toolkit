import { useState } from 'react';
import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader } from '../components/shared/primitives';
import { EmptyState } from '../components/shared/EmptyState';
import { JsonTree } from '../components/shared/JsonTree';
import { CodeBlock } from '../components/shared/CodeBlock';
import { PathLine } from '../components/shared/SymlinkBadge';

export default function Settings() {
  const { data, loading, error } = useLiveConfig(api.settings);
  const [raw, setRaw] = useState(false);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  if (!data.present) {
    return (
      <>
        <PageHeader title="Settings" />
        <EmptyState title="No settings.json" description="No settings.json in this config directory." />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle={<PathLine file={data} />}
        actions={
          <button
            onClick={() => setRaw((r) => !r)}
            className="text-sm px-3 py-1.5 rounded-lg border border-(--color-border-light) text-(--color-text-secondary) hover:bg-(--color-surface-secondary)"
          >
            {raw ? 'Sections' : 'Raw JSON'}
          </button>
        }
      />
      <p className="text-xs text-(--color-text-tertiary) mb-4">Secret-looking values are masked (••••).</p>

      {raw ? (
        <CodeBlock text={JSON.stringify(data.raw, null, 2)} language="json" />
      ) : (
        <div className="space-y-4">
          {data.sections.map((section) => (
            <div key={section.key} className="bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-(--color-text-primary) mb-3">{section.label}</h3>
              <JsonTree data={section.value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
