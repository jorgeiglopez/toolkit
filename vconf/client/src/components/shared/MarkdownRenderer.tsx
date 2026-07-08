import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="text-(--color-text-secondary)">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold tracking-tight text-(--color-text-primary) mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold tracking-tight text-(--color-text-primary) mt-5 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-(--color-text-primary) mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-(--color-text-primary) mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => <p className="text-sm leading-7 mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-7">{children}</li>,
          a: ({ href, children }) => {
            const safeHref = href && /^https?:\/\//i.test(href) ? href : undefined;
            return (
              <a
                href={safeHref}
                className="text-(--color-accent) underline underline-offset-2 hover:text-(--color-accent-hover)"
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-(--color-border) pl-4 py-1 italic text-(--color-text-tertiary) my-3">{children}</blockquote>
          ),
          hr: () => <hr className="border-(--color-border-light) my-5" />,
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className="block bg-(--color-surface-secondary) border border-(--color-border-light) rounded-lg p-3 text-xs leading-6 text-(--color-text-primary) overflow-x-auto" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-(--color-surface-secondary) border border-(--color-border-light) rounded px-1 py-0.5 text-xs text-(--color-accent)" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="mb-3">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-(--color-surface-secondary)">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-(--color-border-light) px-3 py-2 text-left font-semibold text-(--color-text-primary)">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-(--color-border-light) px-3 py-2 text-(--color-text-secondary)">{children}</td>
          ),
          strong: ({ children }) => <strong className="font-semibold text-(--color-text-primary)">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
