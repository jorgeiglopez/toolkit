import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Field, Pill } from '../components/shared/primitives';
import { ListDetail, type ListItem } from '../components/shared/ListDetail';
import type { McpServerEntry } from '../../../shared/types';

type Item = ListItem & { server: McpServerEntry };

export default function Mcp() {
  const { data, loading, error } = useLiveConfig(api.mcp);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const items: Item[] = data.servers.map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: s.scope,
    searchText: `${s.command ?? ''} ${(s.args ?? []).join(' ')} ${s.url ?? ''}`,
    badges: <Pill tone={s.scope === 'global' ? 'success' : 'neutral'}>{s.transport}</Pill>,
    server: s,
  }));

  return (
    <div>
      <PageHeader
        title="MCP Servers"
        count={data.servers.length}
        subtitle={data.sourcePath ? `from ${data.sourcePath} (env values masked)` : 'no ~/.claude.json found'}
      />
      <ListDetail
        items={items}
        placeholder="Filter servers..."
        emptyTitle="No MCP servers"
        emptyDescription="No mcpServers configured in ~/.claude.json."
        renderDetail={(item) => {
          const s = item.server;
          return (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-bold text-(--color-text-primary)">{s.name}</h2>
                <Pill tone={s.scope === 'global' ? 'success' : 'neutral'}>{s.scope}</Pill>
                <Pill tone="accent">{s.transport}</Pill>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {s.command && (
                  <Field label="Command">
                    <span className="font-mono text-xs">{s.command} {(s.args ?? []).join(' ')}</span>
                  </Field>
                )}
                {s.url && <Field label="URL"><span className="font-mono text-xs">{s.url}</span></Field>}
                {s.env && Object.keys(s.env).length > 0 && (
                  <Field label="Environment">
                    <div className="font-mono text-xs space-y-0.5 mt-1">
                      {Object.entries(s.env).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-(--color-accent)">{k}</span>=
                          <span className="text-(--color-text-secondary)">{v}</span>
                        </div>
                      ))}
                    </div>
                  </Field>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
