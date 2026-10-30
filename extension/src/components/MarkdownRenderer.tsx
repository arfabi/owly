import React from "react";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownRenderer({ content, isUser = false }: MarkdownRendererProps) {
  // Parse inline elements: **bold**, *italic*, `code`
  const renderInline = (text: string) => {
    // Regex matches: **bold**, *italic*, `code`
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong
            key={idx}
            className={
              isUser
                ? "font-extrabold text-white"
                : "font-black text-slate-900"
            }
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return (
          <em key={idx} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={idx}
            className={
              isUser
                ? "px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10.5px] font-semibold"
                : "px-1.5 py-0.5 rounded bg-purple-50 text-savvy-purple border border-purple-200/80 font-mono text-[10.5px] font-semibold"
            }
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  // Split lines into structured blocks
  const lines = content.split("\n");

  return (
    <div className={`space-y-1.5 leading-relaxed text-left ${isUser ? "text-white" : "text-slate-800"}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line -> spacing
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Unordered list item (* or -)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span
                className={`text-[10px] leading-tight select-none mt-1 shrink-0 ${
                  isUser ? "text-blue-200" : "text-slate-400"
                }`}
              >
                ●
              </span>
              <div className="flex-1 min-w-0">{renderInline(itemText)}</div>
            </div>
          );
        }

        // Ordered list item (1. 2. etc)
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (orderedMatch) {
          const num = orderedMatch[1];
          const itemText = orderedMatch[2];
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span
                className={`font-bold text-[11px] leading-tight shrink-0 mt-0.5 ${
                  isUser ? "text-blue-200" : "text-slate-500"
                }`}
              >
                {num}.
              </span>
              <div className="flex-1 min-w-0">{renderInline(itemText)}</div>
            </div>
          );
        }

        // Blockquote (> text)
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className={`pl-2.5 py-0.5 my-1 border-l-2 text-[11px] italic ${
                isUser
                  ? "border-blue-200 text-blue-100"
                  : "border-savvy-blue/40 text-slate-600 bg-slate-50/70 rounded-r-lg"
              }`}
            >
              {renderInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="min-w-0">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}
