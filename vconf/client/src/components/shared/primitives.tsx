import type { ReactNode } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

export function PageHeader({
  title,
  count,
  subtitle,
  actions,
}: {
  title: string;
  count?: number;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--color-text-primary) flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-sm font-medium text-(--color-text-tertiary) bg-(--color-surface-tertiary) rounded-full px-2.5 py-0.5">
              {count}
            </span>
          )}
        </h1>
        {subtitle && <div className="text-sm text-(--color-text-tertiary) mt-1">{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-20 text-(--color-text-tertiary)">
      <Loader2 size={22} className="animate-spin" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle size={28} className="text-(--color-danger) mb-3" />
      <h3 className="text-base font-medium text-(--color-text-primary) mb-1">Something went wrong</h3>
      <p className="text-sm text-(--color-text-tertiary) max-w-md font-mono">{message}</p>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-(--color-text-tertiary) uppercase tracking-wide">{label}</span>
      <span className="text-sm text-(--color-text-primary)">{children}</span>
    </div>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'purple' | 'success' | 'warning' }) {
  const tones: Record<string, string> = {
    neutral: 'text-(--color-text-secondary) bg-(--color-surface-tertiary)',
    accent: 'text-(--color-accent) bg-(--color-accent)/10',
    purple: 'text-(--color-purple) bg-(--color-purple)/10',
    success: 'text-(--color-success) bg-(--color-success)/10',
    warning: 'text-(--color-warning) bg-(--color-warning)/10',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-1.5 py-0.5 ${tones[tone]}`}>
      {children}
    </span>
  );
}
