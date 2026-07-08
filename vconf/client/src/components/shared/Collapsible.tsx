import { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface CollapsibleProps {
  title: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}

export function Collapsible({ title, defaultOpen = false, badge, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-(--color-border-light) rounded-xl overflow-hidden bg-(--color-surface)">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-(--color-surface-secondary) transition-colors"
      >
        <ChevronRight
          size={16}
          strokeWidth={2}
          className={`text-(--color-text-tertiary) transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <span className="text-sm font-semibold text-(--color-text-primary)">{title}</span>
        {badge}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-(--color-border-light)">{children}</div>}
    </div>
  );
}
