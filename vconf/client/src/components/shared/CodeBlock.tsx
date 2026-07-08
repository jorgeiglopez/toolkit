export function CodeBlock({ text, language }: { text: string; language?: string }) {
  return (
    <pre className="bg-(--color-surface-secondary) border border-(--color-border-light) rounded-xl p-4 text-xs leading-6 text-(--color-text-primary) overflow-x-auto">
      {language && (
        <div className="text-(--color-text-tertiary) mb-2 select-none uppercase tracking-wide text-[10px]">
          {language}
        </div>
      )}
      <code>{text}</code>
    </pre>
  );
}
