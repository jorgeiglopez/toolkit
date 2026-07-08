import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Field, Pill } from '../components/shared/primitives';
import { ListDetail, type ListItem } from '../components/shared/ListDetail';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { PathLine, SymlinkBadge } from '../components/shared/SymlinkBadge';
import type { AgentEntry } from '../../../shared/types';

type Item = ListItem & { agent: AgentEntry };

export default function Agents() {
  const { data, loading, error } = useLiveConfig(api.agents);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const items: Item[] = data.agents.map((a) => ({
    id: a.id,
    title: a.name,
    subtitle: a.description,
    searchText: a.body,
    badges: (
      <>
        {a.isSymlink && <SymlinkBadge file={a} />}
        {a.hasHooks && <Pill tone="warning">hooks</Pill>}
      </>
    ),
    agent: a,
  }));

  const toolsText = (t: AgentEntry['tools']) => (Array.isArray(t) ? t.join(', ') : t);

  return (
    <div>
      <PageHeader title="Agents" count={data.agents.length} subtitle="Custom subagents in agents/*.md" />
      <ListDetail
        items={items}
        placeholder="Filter agents..."
        emptyTitle="No agents"
        emptyDescription="No agents/ directory in this config."
        renderDetail={(item) => {
          const a = item.agent;
          return (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-(--color-text-primary)">{a.name}</h2>
                {a.isSymlink && <SymlinkBadge file={a} />}
              </div>
              {a.description && <p className="text-sm text-(--color-text-secondary) mb-3">{a.description}</p>}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {a.model && <Field label="Model">{a.model}</Field>}
                {a.tools && <Field label="Tools"><span className="font-mono text-xs">{toolsText(a.tools)}</span></Field>}
                {a.hasHooks && <Field label="Hooks">defined in frontmatter (see Hooks tab)</Field>}
              </div>
              <PathLine file={a} />
              <div className="mt-4 border-t border-(--color-border-light) pt-4">
                <MarkdownRenderer content={a.body} />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
