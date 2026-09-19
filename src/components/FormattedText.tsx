import katex from 'katex';
import { useMemo } from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

interface Segment {
  kind: 'text' | 'math-inline' | 'math-display';
  content: string;
}

function parseMathSegments(text: string): Segment[] {
  if (!text) return [];

  // Match $$...$$, \[...\], \(...\), or $...$
  const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$[^$\n]+?\$)/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', content: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith('$$') && raw.endsWith('$$')) {
      segments.push({ kind: 'math-display', content: raw.slice(2, -2).trim() });
    } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
      segments.push({ kind: 'math-display', content: raw.slice(2, -2).trim() });
    } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      segments.push({ kind: 'math-inline', content: raw.slice(2, -2).trim() });
    } else if (raw.startsWith('$') && raw.endsWith('$')) {
      segments.push({ kind: 'math-inline', content: raw.slice(1, -1).trim() });
    } else {
      segments.push({ kind: 'text', content: raw });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

export function FormattedText({ text, className, as: Component = 'span' }: FormattedTextProps) {
  const segments = useMemo(() => parseMathSegments(text), [text]);

  return (
    <Component className={className}>
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return <span key={idx}>{seg.content}</span>;
        }

        const isDisplay = seg.kind === 'math-display';
        const html = katex.renderToString(seg.content, {
          displayMode: isDisplay,
          throwOnError: false,
          output: 'htmlAndMathml',
        });

        return (
          <span
            key={idx}
            className={isDisplay ? 'equation-display-inline' : 'equation-inline-span'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </Component>
  );
}
