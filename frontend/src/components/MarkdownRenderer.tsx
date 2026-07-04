import React from 'react';

interface MarkdownProps {
  content: string;
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\`.*?\`|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-zinc-900 text-violet-300 font-mono text-xs border border-zinc-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const MarkdownRenderer: React.FC<MarkdownProps> = ({ content }) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  
  const flushList = (key: number) => {
    if (currentList.length > 0) {
      if (currentListType === 'ul') {
        blocks.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1.5 text-zinc-300 text-sm">
            {currentList}
          </ul>
        );
      } else if (currentListType === 'ol') {
        blocks.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 my-2 space-y-1.5 text-zinc-300 text-sm">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      currentListType = null;
    }
  };
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // 1. Heading match
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList(idx);
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const parsedText = parseInline(text);
      
      switch (level) {
        case 1:
          blocks.push(<h1 key={idx} className="text-xl font-bold text-white mt-5 mb-2.5">{parsedText}</h1>);
          break;
        case 2:
          blocks.push(<h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{parsedText}</h2>);
          break;
        case 3:
        default:
          blocks.push(<h3 key={idx} className="text-base font-bold text-white mt-3.5 mb-1.5">{parsedText}</h3>);
          break;
      }
      return;
    }
    
    // 2. Unordered list match (*, -, •)
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
    if (bulletMatch) {
      if (currentListType !== 'ul') {
        flushList(idx);
        currentListType = 'ul';
      }
      const text = bulletMatch[1];
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed pl-1">
          {parseInline(text)}
        </li>
      );
      return;
    }
    
    // 3. Ordered list match (1.)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (currentListType !== 'ol') {
        flushList(idx);
        currentListType = 'ol';
      }
      const text = orderedMatch[2];
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed pl-1">
          {parseInline(text)}
        </li>
      );
      return;
    }
    
    // 4. Empty line
    if (trimmed === '') {
      flushList(idx);
      blocks.push(<div key={`spacer-${idx}`} className="h-2" />);
      return;
    }
    
    // 5. Default paragraph
    flushList(idx);
    blocks.push(
      <p key={idx} className="my-2 leading-relaxed text-zinc-300 text-sm">
        {parseInline(line)}
      </p>
    );
  });
  
  flushList(lines.length);
  
  return <div className="space-y-1">{blocks}</div>;
};
