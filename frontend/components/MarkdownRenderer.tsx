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
    <div className={`markdown-content space-y-2 text-slate-800 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-slate-900 pt-1 pb-1 border-b border-pink-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-pink-950 pt-1.5 pb-0.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-pink-900 pt-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-slate-700 text-xs sm:text-[13px]">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-600 italic">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-1.5 pl-4 list-disc list-outside marker:text-pink-500 text-slate-700 text-xs sm:text-[13px]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-1.5 pl-4 list-decimal list-outside marker:text-pink-500 font-medium text-slate-700 text-xs sm:text-[13px]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-pink-400 pl-3 py-1 my-2 bg-pink-50/50 rounded-r-lg text-slate-700 italic text-xs">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-pink-50 border border-pink-200/60 text-pink-900 font-mono text-[11px]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-pink-100 font-mono text-xs overflow-x-auto my-2">
                <code>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-2.5 rounded-xl border border-pink-100 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-pink-50/70 border-b border-pink-100 text-pink-950 font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2 sm:px-2.5 text-pink-900 font-semibold tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2 sm:px-2.5 border-t border-pink-50 text-slate-700">
              {children}
            </td>
          ),
          hr: () => <hr className="my-2.5 border-pink-100" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
