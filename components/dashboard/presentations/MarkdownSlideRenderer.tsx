// components/presentations/MarkdownSlideRenderer.tsx
"use client";

import React from 'react';
import { CheckCircle, ArrowRight, Star, Lightbulb, Target, TrendingUp } from 'lucide-react';

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
    const elements: React.ReactElement[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent 
            key={`list-${elements.length}`} 
            className="space-y-3 mb-4"
            style={{ color: textColor }}
          >
            {currentList.map((item, index) => (
              <li key={index} className="flex items-start gap-3 group">
                {listType === 'ul' && (
                  <div className="flex-shrink-0 mt-1.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full transition-all duration-200 group-hover:scale-110"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                )}
                {listType === 'ol' && (
                  <div 
                    className="font-semibold text-base mt-0.5 flex-shrink-0 min-w-[1.5rem] transition-all duration-200 group-hover:scale-105"
                    style={{ color: accentColor }}
                  >
                    {index + 1}.
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-base md:text-lg leading-relaxed font-medium break-words transition-all duration-200 group-hover:translate-x-0.5">
                    {parseInlineMarkdown(item)}
                  </span>
                </div>
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

      // Headers with improved sizing for container constraints
      if (trimmedLine.startsWith('###')) {
        flushList();
        const headerText = trimmedLine.replace(/^###\s*/, '');
        elements.push(
          <h3 
            key={`h3-${index}`} 
            className="text-lg md:text-xl lg:text-2xl font-bold mb-3 mt-4 break-words leading-tight"
            style={{ color: accentColor }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="min-w-0">{parseInlineMarkdown(headerText)}</span>
            </div>
          </h3>
        );
      } else if (trimmedLine.startsWith('##')) {
        flushList();
        const headerText = trimmedLine.replace(/^##\s*/, '');
        elements.push(
          <h2 
            key={`h2-${index}`} 
            className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 mt-5 break-words leading-tight"
            style={{ color: accentColor }}
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="min-w-0">{parseInlineMarkdown(headerText)}</span>
            </div>
          </h2>
        );
      } else if (trimmedLine.startsWith('#')) {
        flushList();
        const headerText = trimmedLine.replace(/^#\s*/, '');
        elements.push(
          <h1 
            key={`h1-${index}`} 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 mt-6 break-words leading-tight"
            style={{ color: accentColor }}
          >
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
              <span className="min-w-0">{parseInlineMarkdown(headerText)}</span>
            </div>
          </h1>
        );
      }
      // Enhanced unordered list items
      else if (trimmedLine.match(/^[\*\-\+]\s/)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        const itemText = trimmedLine.replace(/^[\*\-\+]\s*/, '');
        currentList.push(itemText);
      }
      // Enhanced ordered list items
      else if (trimmedLine.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        const itemText = trimmedLine.replace(/^\d+\.\s*/, '');
        currentList.push(itemText);
      }
      // Enhanced blockquotes with size constraints
      else if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <blockquote 
            key={`quote-${index}`} 
            className="border-l-4 pl-4 py-3 mb-4 italic text-base md:text-lg break-words rounded-r-lg"
            style={{ 
              borderColor: accentColor,
              backgroundColor: `${accentColor}15`,
              color: textColor 
            }}
          >
            <div className="flex items-start gap-3">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
              <span className="min-w-0">{parseInlineMarkdown(quoteText)}</span>
            </div>
          </blockquote>
        );
      }
      // Code blocks (simplified)
      else if (trimmedLine.startsWith('```')) {
        flushList();
        return;
      }
      // Enhanced regular paragraphs with size constraints
      else if (trimmedLine.length > 0) {
        flushList();
        elements.push(
          <p 
            key={`p-${index}`} 
            className="text-base md:text-lg leading-relaxed mb-3 break-words font-medium"
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
    // Handle bold text with enhanced styling
    text = text.replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 700; color: ${accentColor};">$1</strong>`);
    text = text.replace(/__(.*?)__/g, `<strong style="font-weight: 700; color: ${accentColor};">$1</strong>`);
    
    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');
    
    // Handle inline code with better sizing
    text = text.replace(/`(.*?)`/g, `<code style="background-color: ${accentColor}20; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.9em; font-weight: 500;">$1</code>`);
    
    // Handle links with better styling
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color: ${accentColor}; text-decoration: underline; font-weight: 600; transition: all 0.2s ease;">$1</a>`);

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className={`markdown-slide-content ${className} h-full overflow-hidden`}>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden px-2 md:px-4">
        <div className="max-w-none space-y-2 py-2">
          {parseMarkdown(content)}
        </div>
      </div>
    </div>
  );
};

export default MarkdownSlideRenderer;

