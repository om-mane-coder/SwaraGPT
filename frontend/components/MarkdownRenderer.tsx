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
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 pt-2 pb-1 border-b border-amber-300/60 font-serif">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-amber-950 pt-2 pb-0.5 font-serif">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-amber-900 pt-1 font-serif">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-slate-800 font-normal">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-amber-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-700 italic font-medium">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-4 list-disc list-outside marker:text-amber-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-4 list-decimal list-outside marker:text-amber-700 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-800 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-amber-500 pl-3.5 py-1.5 my-2 bg-amber-50/80 rounded-r-lg text-slate-800 italic font-medium">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-amber-100/90 border border-amber-300/80 text-amber-950 font-mono text-[11px] sm:text-xs font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto my-2">
                <code>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-amber-300/80 bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-amber-100/90 border-b border-amber-300 text-amber-950 font-bold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2.5 sm:px-3 text-amber-950 font-bold tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 sm:px-3 border-t border-amber-100/90 text-slate-800 font-medium">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-amber-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
