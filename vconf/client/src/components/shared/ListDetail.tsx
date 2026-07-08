import { useMemo, useState, type ReactNode } from 'react';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  /** extra text to match against when filtering */
  searchText?: string;
}

interface ListDetailProps<T extends ListItem> {
  items: T[];
  renderDetail: (item: T) => ReactNode;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ListDetail<T extends ListItem>({
  items,
  renderDetail,
  placeholder = 'Filter...',
  emptyTitle = 'Nothing here',
  emptyDescription,
}: ListDetailProps<T>) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.subtitle ?? '').toLowerCase().includes(q) ||
        (i.searchText ?? '').toLowerCase().includes(q),
    );
  }, [items, query]);

  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-5 h-[calc(100vh-11rem)]">
      <div className="flex flex-col gap-3 min-h-0">
        <SearchBar value={query} onChange={setQuery} placeholder={placeholder} />
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filtered.map((item) => {
            const active = selected?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors border ${
                  active
                    ? 'bg-(--color-accent)/10 border-(--color-accent)/30'
                    : 'border-transparent hover:bg-(--color-surface-secondary)'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold truncate ${
                      active ? 'text-(--color-accent)' : 'text-(--color-text-primary)'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.badges}
                </div>
                {item.subtitle && (
                  <div className="text-xs text-(--color-text-tertiary) truncate mt-0.5">
                    {item.subtitle}
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-sm text-(--color-text-tertiary) px-3 py-4">No matches.</div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto min-h-0 bg-(--color-surface) border border-(--color-border-light) rounded-2xl p-6">
        {selected ? renderDetail(selected) : null}
      </div>
    </div>
  );
}
