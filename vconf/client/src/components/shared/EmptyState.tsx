import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-(--color-text-tertiary)">{icon ?? <Inbox size={32} strokeWidth={1.5} />}</div>
      <h3 className="text-base font-medium text-(--color-text-primary) mb-1">{title}</h3>
      {description && <p className="text-sm text-(--color-text-tertiary) max-w-sm">{description}</p>}
    </div>
  );
}
