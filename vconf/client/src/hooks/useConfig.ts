import { useState, useEffect, useCallback, useRef } from 'react';

type FetchFn<T> = (signal?: AbortSignal) => Promise<T>;

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  return (err as { name?: string }).name === 'AbortError';
}

export function useConfig<T>(fetchFn: FetchFn<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    const version = ++versionRef.current;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn(controller.signal);
      if (version !== versionRef.current) return;
      setData(result);
    } catch (err) {
      if (isAbortError(err)) return;
      if (version !== versionRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      if (version !== versionRef.current) return;
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
    return () => {
      controllerRef.current?.abort();
    };
  }, [load]);

  return { data, loading, error, refetch: load };
}
