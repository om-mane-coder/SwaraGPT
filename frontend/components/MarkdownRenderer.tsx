'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content space-y-2.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold text-white pt-2 pb-1 border-b border-amber-500/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-amber-300 pt-2 pb-0.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-amber-400 pt-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-zinc-200">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-amber-300">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-300 italic">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-4 list-disc list-outside marker:text-amber-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-4 list-decimal list-outside marker:text-amber-400 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-zinc-200 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-500/60 pl-3 py-1 my-2 bg-amber-500/5 rounded-r-lg text-zinc-300 italic">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-black/60 border border-amber-500/30 text-amber-300 font-mono text-[11px] sm:text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-amber-300 font-mono text-xs overflow-x-auto my-2">
                <code>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-amber-500/15 border-b border-amber-500/30 text-amber-300 font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2.5 sm:px-3 text-amber-400 font-semibold tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 sm:px-3 border-t border-white/5 text-zinc-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-white/10" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
