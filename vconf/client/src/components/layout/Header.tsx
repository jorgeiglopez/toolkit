import { ThemeToggle } from '../shared/ThemeToggle';
import { GlobalSearch } from './GlobalSearch';

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="h-14 flex items-center gap-4 px-6 bg-(--color-surface) border-b border-(--color-border-light)">
      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${connected ? 'bg-(--color-success)' : 'bg-(--color-danger)'}`}
          title={connected ? 'Live' : 'Reconnecting'}
        />
        <span className="text-xs text-(--color-text-tertiary) w-20">
          {connected ? 'Live' : 'Reconnecting'}
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}
