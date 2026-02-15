'use client';

// components/MarkdownRenderer.tsx
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

type Props = {
  content: string;
  className?: string;
};

function CodeBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const [codeString, setCodeString] = useState('');

  useEffect(() => {
    if (codeRef.current) {
      // Defer state update to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        if (codeRef.current) {
          setCodeString(codeRef.current.textContent || '');
        }
      });
    }
  }, [children]);

  const handleCopy = async () => {
    if (codeString) {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      <pre
        className={cn(
          'whitespace-pre-wrap wrap-break-word rounded-lg p-4 bg-muted/50',
          'border border-border/50',
          'overflow-x-auto',
          'text-sm font-mono',
          className
        )}
        {...props}
      >
        <code ref={codeRef} className="text-foreground">
          {children}
        </code>
      </pre>
      {codeString && (
        <button
          onClick={handleCopy}
          className={cn(
            'absolute top-2 right-2',
            'p-1.5 rounded-md',
            'bg-background/80 backdrop-blur-sm border border-border/50',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-accent',
            'text-muted-foreground hover:text-foreground',
            'transition-colors'
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}

function InlineCode({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'px-1.5 py-0.5 rounded',
        'bg-muted/70 text-foreground',
        'text-sm font-mono',
        'border border-border/30'
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function MarkdownRenderer({ content, className }: Props) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-foreground',
        'prose-headings:mt-6 prose-headings:mb-3',
        'prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2',
        'prose-h2:text-xl prose-h2:mt-8',
        'prose-h3:text-lg prose-h3:mt-6',
        'prose-p:text-foreground prose-p:leading-7 prose-p:my-4',
        'prose-a:text-primary prose-a:no-underline',
        'prose-a:hover:text-primary/80 prose-a:hover:underline',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-em:text-foreground prose-em:italic',
        'prose-ul:my-4 prose-ul:pl-6',
        'prose-ol:my-4 prose-ol:pl-6',
        'prose-li:my-2 prose-li:text-foreground',
        'prose-blockquote:border-l-4 prose-blockquote:border-primary/50',
        'prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4',
        'prose-blockquote:rounded-r-md prose-blockquote:my-4',
        'prose-blockquote:text-foreground/90 prose-blockquote:italic',
        'prose-hr:border-border prose-hr:my-6',
        'prose-table:w-full prose-table:my-4',
        'prose-thead:border-b prose-thead:border-border',
        'prose-th:text-foreground prose-th:font-semibold prose-th:p-2',
        'prose-td:text-foreground prose-td:p-2 prose-td:border-b prose-td:border-border/50',
        'prose-tr:hover:bg-muted/30',
        'prose-img:rounded-lg prose-img:my-4 prose-img:border prose-img:border-border',
        'prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-4',
        'dark:prose-invert',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
            >
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p className="whitespace-pre-wrap wrap-break-word leading-7">
              {children}
            </p>
          ),
          pre: ({ children, className, ...props }) => (
            <CodeBlock className={className} {...props}>
              pre: {children}
            </CodeBlock>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return <InlineCode {...props}>{children}</InlineCode>;
            }
            return (
              <code className={cn('text-foreground', className)} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 bg-muted/30 py-2 px-4 rounded-r-md my-4 italic text-foreground/90">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2 pl-6 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 pl-6 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="my-0 text-foreground leading-7">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold mt-8 mb-2 pb-2 border-b border-border text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-4 mb-0 text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mt-2 mb-0 text-foreground">
              {children}
            </h4>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 border-b border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="text-left p-3 font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 text-foreground">{children}</td>
          ),
          hr: () => <hr className="border-border my-6" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg my-4 border border-border max-w-full h-auto"
              loading="lazy"
            />
          ),
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              className="mr-2 accent-primary"
              readOnly
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
