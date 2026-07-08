import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';

const CATEGORY_LABEL: Record<string, string> = {
  memory: 'CLAUDE.md',
  settings: 'Settings',
  agents: 'Agents',
  skills: 'Skills',
  hooks: 'Hooks',
  mcp: 'MCP',
  rules: 'Rules',
  plugins: 'Plugins',
  keybindings: 'Keybindings',
  statusline: 'Statusline',
};

/** Global search box + results dropdown, lives in the header. */
export function GlobalSearch() {
  const { query, setQuery, results, open, setOpen, indexSize } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // "/" focuses the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  // Click-outside closes the dropdown.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [setOpen]);

  // Group results by category.
  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)">
        <Search size={15} strokeWidth={1.5} />
      </span>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder={`Search all config… (${indexSize} items)  —  press /`}
        className="w-full pl-9 pr-8 py-2 bg-(--color-surface-secondary) border border-(--color-border-light) rounded-xl text-sm text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/30 focus:border-(--color-accent) transition-all"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-[70vh] overflow-y-auto bg-(--color-surface) border border-(--color-border-light) rounded-2xl shadow-(--shadow-modal) p-2">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-(--color-text-tertiary)">
              No matches for “{query}”.
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-1">
                <div className="px-3 py-1 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wide">
                  {CATEGORY_LABEL[cat] ?? cat} · {items.length}
                </div>
                {items.map((r) => (
                  <button
                    key={`${r.category}-${r.id}`}
                    onClick={() => {
                      navigate(`${r.route}?focus=${encodeURIComponent(r.id)}`);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-(--color-surface-secondary) transition-colors"
                  >
                    <div className="text-sm font-medium text-(--color-text-primary) truncate">{r.title}</div>
                    {r.subtitle && (
                      <div className="text-xs text-(--color-text-tertiary) truncate">{r.subtitle}</div>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
