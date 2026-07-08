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
    <div ref={containerRef} className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)">
        <Search size={15} strokeWidth={1.75} />
      </span>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder={`Search ${indexSize} config items…`}
        className="w-full pl-9 pr-14 py-2 bg-(--color-surface-secondary) border border-(--color-border-light) rounded-lg text-[13px] text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/25 focus:border-(--color-accent)/60 transition-all"
      />
      {query ? (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      ) : (
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-(--color-text-tertiary) bg-(--color-surface-tertiary) border border-(--color-border-light) rounded px-1.5 py-0.5 pointer-events-none">
          /
        </kbd>
      )}

      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-[72vh] overflow-y-auto bg-(--color-surface) border border-(--color-border) rounded-xl shadow-(--shadow-pop) p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-(--color-text-tertiary)">
              No matches for <span className="text-(--color-text-secondary) font-medium">{query}</span>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-0.5">
                <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold text-(--color-text-tertiary) uppercase tracking-[0.08em] flex items-center gap-1.5">
                  {CATEGORY_LABEL[cat] ?? cat}
                  <span className="tnum font-mono text-(--color-text-tertiary)/70">{items.length}</span>
                </div>
                {items.map((r) => (
                  <button
                    key={`${r.category}-${r.id}`}
                    onClick={() => {
                      navigate(`${r.route}?focus=${encodeURIComponent(r.id)}`);
                      setOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-(--color-surface-secondary) transition-colors"
                  >
                    <div className="text-[13px] font-medium text-(--color-text-primary) truncate">{r.title}</div>
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
