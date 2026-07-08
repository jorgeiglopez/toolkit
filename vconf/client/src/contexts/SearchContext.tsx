import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import type { SearchDoc, SearchIndex } from '../../../shared/types';

interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  results: SearchDoc[];
  open: boolean;
  setOpen: (o: boolean) => void;
  indexSize: number;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<SearchIndex>({ docs: [] });
  const [query, setQueryRaw] = useState('');
  const [open, setOpen] = useState(false);
  const { lastEvent } = useWebSocket();

  const load = useCallback(async () => {
    try {
      setIndex(await api.searchIndex());
    } catch {
      /* keep previous index */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Rebuild the index when files change on disk.
  useEffect(() => {
    if (lastEvent) load();
  }, [lastEvent, load]);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    setOpen(q.trim().length > 0);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.docs
      .filter((d) => d.title.toLowerCase().includes(q) || d.text.toLowerCase().includes(q))
      .slice(0, 60);
  }, [query, index]);

  const value: SearchState = {
    query,
    setQuery,
    results,
    open,
    setOpen,
    indexSize: index.docs.length,
  };
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider');
  return ctx;
}
