import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div
      className={`prose dark:prose-invert max-w-none text-sm text-[var(--text-main)] leading-relaxed ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
