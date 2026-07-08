import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

/** Minimal collapsible JSON tree viewer (objects/arrays expandable). */
export function JsonTree({ data, defaultOpen = true }: { data: unknown; defaultOpen?: boolean }) {
  return (
    <div className="font-mono text-xs leading-6 text-(--color-text-primary)">
      <Node value={data} name={null} depth={0} defaultOpen={defaultOpen} />
    </div>
  );
}

function Node({
  value,
  name,
  depth,
  defaultOpen,
}: {
  value: unknown;
  name: string | null;
  depth: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(depth < 1 ? true : defaultOpen);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object';

  const label =
    name !== null ? <span className="text-(--color-accent)">{name}</span> : null;

  if (!isObject) {
    return (
      <div style={{ paddingLeft: depth * 14 }}>
        {label}
        {label && <span className="text-(--color-text-tertiary)">: </span>}
        <ValueLeaf value={value} />
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);

  const bracket = isArray ? ['[', ']'] : ['{', '}'];

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 hover:opacity-80"
      >
        <ChevronRight
          size={12}
          className={`text-(--color-text-tertiary) transition-transform ${open ? 'rotate-90' : ''}`}
        />
        {label}
        {label && <span className="text-(--color-text-tertiary)">: </span>}
        <span className="text-(--color-text-tertiary)">
          {bracket[0]}
          {!open && `…${entries.length}${bracket[1]}`}
        </span>
      </button>
      {open && (
        <div>
          {entries.map(([k, v]) => (
            <Node key={k} name={k} value={v} depth={depth + 1} defaultOpen={defaultOpen} />
          ))}
          <div style={{ paddingLeft: 0 }} className="text-(--color-text-tertiary)">
            {bracket[1]}
          </div>
        </div>
      )}
    </div>
  );
}

function ValueLeaf({ value }: { value: unknown }) {
  if (value === null) return <span className="text-(--color-text-tertiary)">null</span>;
  if (typeof value === 'string')
    return <span className="text-(--color-success)">"{value}"</span>;
  if (typeof value === 'number')
    return <span className="text-(--color-warning)">{value}</span>;
  if (typeof value === 'boolean')
    return <span className="text-(--color-purple)">{String(value)}</span>;
  return <span>{String(value)}</span>;
}
