import { ThemeToggle } from '../shared/ThemeToggle';
import { GlobalSearch } from './GlobalSearch';

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="h-14 flex items-center gap-4 px-5 bg-(--color-panel) border-b border-(--color-border-light)">
      <div className="flex-1 max-w-2xl">
        <GlobalSearch />
      </div>
      <div className="flex-1" />
      <div
        className="flex items-center gap-1.5 text-[11px] font-medium text-(--color-text-tertiary)"
        title={connected ? 'Watching config for changes' : 'Reconnecting to server'}
      >
        <span className="relative flex h-1.5 w-1.5">
          {connected && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-success) opacity-60 animate-ping" />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${connected ? 'bg-(--color-success)' : 'bg-(--color-danger)'}`} />
        </span>
        {connected ? 'Live' : 'Offline'}
      </div>
      <div className="w-px h-5 bg-(--color-border-light)" />
      <ThemeToggle />
    </header>
  );
}
