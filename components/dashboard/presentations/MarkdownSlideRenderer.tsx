// components/presentations/MarkdownSlideRenderer.tsx
"use client";

import React from 'react';

interface MarkdownSlideRendererProps {
  content: string;
  textColor: string;
  accentColor?: string;
  className?: string;
}

const MarkdownSlideRenderer: React.FC<MarkdownSlideRendererProps> = ({ 
  content, 
  textColor, 
  accentColor = '#6366f1',
  className = '' 
}) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent 
            key={`list-${elements.length}`} 
            className="space-y-3 mb-6"
            style={{ color: textColor }}
          >
            {currentList.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                {listType === 'ul' && (
                  <div 
                    className="w-2 h-2 rounded-full mt-3 flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
                {listType === 'ol' && (
                  <span 
                    className="font-semibold mt-1 flex-shrink-0 min-w-[1.5rem]"
                    style={{ color: accentColor }}
                  >
                    {index + 1}.
                  </span>
                )}
                <span className="text-lg md:text-xl leading-relaxed break-words">
                  {parseInlineMarkdown(item)}
                </span>
              </li>
            ))}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Headers
      if (trimmedLine.startsWith('###')) {
        flushList();
        const headerText = trimmedLine.replace(/^###\s*/, '');
        elements.push(
          <h3 
            key={`h3-${index}`} 
            className="text-2xl md:text-3xl font-bold mb-4 mt-6 break-words"
            style={{ color: accentColor }}
          >
            {parseInlineMarkdown(headerText)}
          </h3>
        );
      } else if (trimmedLine.startsWith('##')) {
        flushList();
        const headerText = trimmedLine.replace(/^##\s*/, '');
        elements.push(
          <h2 
            key={`h2-${index}`} 
            className="text-3xl md:text-4xl font-bold mb-6 mt-8 break-words"
            style={{ color: accentColor }}
          >
            {parseInlineMarkdown(headerText)}
          </h2>
        );
      } else if (trimmedLine.startsWith('#')) {
        flushList();
        const headerText = trimmedLine.replace(/^#\s*/, '');
        elements.push(
          <h1 
            key={`h1-${index}`} 
            className="text-4xl md:text-5xl font-bold mb-8 mt-10 break-words"
            style={{ color: accentColor }}
          >
            {parseInlineMarkdown(headerText)}
          </h1>
        );
      }
      // Unordered list items
      else if (trimmedLine.match(/^[\*\-\+]\s/)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        const itemText = trimmedLine.replace(/^[\*\-\+]\s*/, '');
        currentList.push(itemText);
      }
      // Ordered list items
      else if (trimmedLine.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        const itemText = trimmedLine.replace(/^\d+\.\s*/, '');
        currentList.push(itemText);
      }
      // Blockquotes
      else if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <blockquote 
            key={`quote-${index}`} 
            className="border-l-4 pl-6 py-4 mb-6 italic text-lg md:text-xl break-words"
            style={{ 
              borderColor: accentColor,
              backgroundColor: `${accentColor}10`,
              color: textColor 
            }}
          >
            {parseInlineMarkdown(quoteText)}
          </blockquote>
        );
      }
      // Code blocks (simplified)
      else if (trimmedLine.startsWith('```')) {
        flushList();
        // For now, just treat as regular text
        return;
      }
      // Regular paragraphs
      else if (trimmedLine.length > 0) {
        flushList();
        elements.push(
          <p 
            key={`p-${index}`} 
            className="text-lg md:text-xl leading-relaxed mb-4 break-words"
            style={{ color: textColor }}
          >
            {parseInlineMarkdown(trimmedLine)}
          </p>
        );
      }
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Handle inline code
    text = text.replace(/`(.*?)`/g, `<code style="background-color: ${accentColor}20; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>`);
    
    // Handle links (basic)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color: ${accentColor}; text-decoration: underline;">$1</a>`);

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className={`markdown-slide-content ${className} overflow-hidden`}>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};

export default MarkdownSlideRenderer;

