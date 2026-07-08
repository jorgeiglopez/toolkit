import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { FileChangeEvent } from '../../../shared/types';

export const MAX_RETRIES = 20;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_CAP_MS = 30000;

function getBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt), BACKOFF_CAP_MS);
}

interface WebSocketState {
  connected: boolean;
  lastEvent: FileChangeEvent | null;
}

const WebSocketContext = createContext<WebSocketState | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<FileChangeEvent | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      retryCountRef.current = 0;
      setConnected(true);
    };
    ws.onmessage = (event) => {
      try {
        setLastEvent(JSON.parse(event.data) as FileChangeEvent);
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => {
      setConnected(false);
      if (retryCountRef.current >= MAX_RETRIES) return;
      const delay = getBackoffDelay(retryCountRef.current);
      retryCountRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ connected, lastEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketState {
  const ctx = useContext(WebSocketContext);
  if (ctx === null) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
}
