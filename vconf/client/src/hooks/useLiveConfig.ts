import { useEffect } from 'react';
import { useConfig } from './useConfig';
import { useWebSocket } from './useWebSocket';

/** useConfig + automatic refetch whenever the server reports a file change. */
export function useLiveConfig<T>(fetchFn: (signal?: AbortSignal) => Promise<T>) {
  const state = useConfig(fetchFn);
  const { lastEvent } = useWebSocket();
  useEffect(() => {
    if (lastEvent) state.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvent]);
  return state;
}

/** Read the ?focus=<id> query param (set by global search deep-links). */
export function getFocusId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('focus');
}
