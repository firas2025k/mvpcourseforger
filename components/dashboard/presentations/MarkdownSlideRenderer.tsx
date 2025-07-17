// components/presentations/MarkdownSlideRenderer.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Zap,
  Award,
  Bookmark,
  ChevronRight,
  Sparkles,
  Flame,
  Heart,
  Shield,
  Rocket,
  ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MarkdownSlideRendererProps {
  content: string;
  textColor: string;
  accentColor?: string;
  className?: string;
  slideType?: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout?: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  imageUrl?: string;
  imageAlt?: string;
  title?: string;
}

const MarkdownSlideRenderer: React.FC<MarkdownSlideRendererProps> = ({ 
  content, 
  textColor, 
  accentColor = '#6366f1',
  className = '',
  slideType = 'content',
  layout = 'default',
  imageUrl,
  imageAlt,
  title = ''
}) => {
  
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Enhanced icon selection based on content and context
  const getContextualIcon = (index: number, content: string) => {
    const icons = [
      <Zap className="w-3 h-3 md:w-4 md:h-4" />,
      <Star className="w-3 h-3 md:w-4 md:h-4" />,
      <Target className="w-3 h-3 md:w-4 md:h-4" />,
      <Award className="w-3 h-3 md:w-4 md:h-4" />,
      <Rocket className="w-3 h-3 md:w-4 md:h-4" />,
      <Shield className="w-3 h-3 md:w-4 md:h-4" />,
      <Heart className="w-3 h-3 md:w-4 md:h-4" />,
      <Flame className="w-3 h-3 md:w-4 md:h-4" />
    ];
    
    // Smart icon selection based on content keywords
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('goal') || lowerContent.includes('objective')) return <Target className="w-3 h-3 md:w-4 md:h-4" />;
    if (lowerContent.includes('success') || lowerContent.includes('achievement')) return <Award className="w-3 h-3 md:w-4 md:h-4" />;
    if (lowerContent.includes('innovation') || lowerContent.includes('new')) return <Rocket className="w-3 h-3 md:w-4 md:h-4" />;
    if (lowerContent.includes('security') || lowerContent.includes('protection')) return <Shield className="w-3 h-3 md:w-4 md:h-4" />;
    if (lowerContent.includes('passion') || lowerContent.includes('love')) return <Heart className="w-3 h-3 md:w-4 md:h-4" />;
    if (lowerContent.includes('energy') || lowerContent.includes('power')) return <Zap className="w-3 h-3 md:w-4 md:h-4" />;
    
    return icons[index % icons.length];
  };

  // Image component with loading and error states
  const SlideImage = ({ url, alt, className: imgClassName }: { url: string; alt: string; className?: string }) => (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${imgClassName}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
      {imageError ? (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-400">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      ) : (
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          style={{ opacity: imageLoading ? 0 : 1 }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );

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
            className="space-y-4 md:space-y-5 mb-6"
            style={{ color: textColor }}
          >
            {currentList.map((item, index) => (
              <li key={index} className="flex items-start gap-4 group transform transition-all duration-300 hover:translate-x-2">
                {listType === 'ul' && (
                  <div className="flex-shrink-0 mt-2">
                    <div className="relative">
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
                        style={{ 
                          backgroundColor: `${accentColor}20`,
                          border: `2px solid ${accentColor}`,
                          boxShadow: `0 4px 12px ${accentColor}30`
                        }}
                      >
                        <div style={{ color: accentColor }}>
                          {getContextualIcon(index, item)}
                        </div>
                      </div>
                      <div 
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>
                  </div>
                )}
                {listType === 'ol' && (
                  <div className="flex-shrink-0 mt-1">
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 group-hover:scale-110 shadow-lg"
                      style={{ 
                        backgroundColor: accentColor,
                        color: 'white',
                        boxShadow: `0 4px 12px ${accentColor}40`
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0 mt-1">
                  <div className="relative">
                    <span className="text-lg md:text-xl lg:text-2xl leading-relaxed font-medium break-words transition-all duration-300 group-hover:text-opacity-90">
                      {parseInlineMarkdown(item)}
                    </span>
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                      style={{ backgroundColor: `${accentColor}40` }}
                    />
                  </div>
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

      // Enhanced headers with better visual hierarchy
      if (trimmedLine.startsWith('###')) {
        flushList();
        const headerText = trimmedLine.replace(/^###\s*/, '');
        elements.push(
          <div key={`h3-${index}`} className="mb-6 mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                  boxShadow: `0 8px 25px ${accentColor}30`
                }}
              >
                <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight break-words"
                  style={{ color: accentColor }}
                >
                  {parseInlineMarkdown(headerText)}
                </h3>
                <div 
                  className="h-1 w-20 md:w-24 rounded-full mt-2"
                  style={{ backgroundColor: `${accentColor}60` }}
                />
              </div>
            </div>
          </div>
        );
      } else if (trimmedLine.startsWith('##')) {
        flushList();
        const headerText = trimmedLine.replace(/^##\s*/, '');
        elements.push(
          <div key={`h2-${index}`} className="mb-8 mt-10">
            <div className="flex items-center gap-5 mb-6">
              <div 
                className="w-16 h-16 md:w-18 md:h-18 rounded-3xl flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}90)`,
                  boxShadow: `0 12px 30px ${accentColor}40`
                }}
              >
                <Target className="w-8 h-8 md:w-9 md:h-9 text-white" />
              </div>
              <div className="flex-1">
                <h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight break-words"
                  style={{ color: accentColor }}
                >
                  {parseInlineMarkdown(headerText)}
                </h2>
                <div 
                  className="h-1.5 w-28 md:w-32 rounded-full mt-3"
                  style={{ backgroundColor: `${accentColor}70` }}
                />
              </div>
            </div>
          </div>
        );
      } else if (trimmedLine.startsWith('#')) {
        flushList();
        const headerText = trimmedLine.replace(/^#\s*/, '');
        elements.push(
          <div key={`h1-${index}`} className="mb-10 mt-12">
            <div className="flex items-center gap-6 mb-8">
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}A0)`,
                  boxShadow: `0 16px 40px ${accentColor}50`
                }}
              >
                <Star className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight break-words"
                  style={{ color: accentColor }}
                >
                  {parseInlineMarkdown(headerText)}
                </h1>
                <div 
                  className="h-2 w-36 md:w-40 rounded-full mt-4"
                  style={{ backgroundColor: `${accentColor}80` }}
                />
              </div>
            </div>
          </div>
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
      // Enhanced blockquotes with modern design
      else if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <div key={`quote-${index}`} className="mb-8 transform transition-all duration-300 hover:scale-[1.02]">
            <div 
              className="relative p-6 md:p-8 rounded-2xl shadow-lg border-l-4"
              style={{ 
                borderColor: accentColor,
                backgroundColor: `${accentColor}08`,
                boxShadow: `0 8px 25px ${accentColor}15`
              }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span 
                    className="text-lg md:text-xl lg:text-2xl font-medium italic leading-relaxed break-words"
                    style={{ color: textColor }}
                  >
                    {parseInlineMarkdown(quoteText)}
                  </span>
                </div>
              </div>
              <div 
                className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-20"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
        );
      }
      // Code blocks (simplified but enhanced)
      else if (trimmedLine.startsWith('```')) {
        flushList();
        return;
      }
      // Enhanced regular paragraphs
      else if (trimmedLine.length > 0) {
        flushList();
        elements.push(
          <div key={`p-${index}`} className="mb-6 transform transition-all duration-300 hover:translate-x-1">
            <p 
              className="text-lg md:text-xl lg:text-2xl leading-relaxed font-medium break-words"
              style={{ color: textColor }}
            >
              {parseInlineMarkdown(trimmedLine)}
            </p>
          </div>
        );
      }
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Enhanced bold text with gradient effect
    text = text.replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 700; background: linear-gradient(135deg, ${accentColor}, ${accentColor}80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$1</strong>`);
    text = text.replace(/__(.*?)__/g, `<strong style="font-weight: 700; background: linear-gradient(135deg, ${accentColor}, ${accentColor}80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$1</strong>`);
    
    // Enhanced italic text
    text = text.replace(/\*(.*?)\*/g, '<em style="font-style: italic; opacity: 0.9;">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em style="font-style: italic; opacity: 0.9;">$1</em>');
    
    // Enhanced inline code with better styling
    text = text.replace(/`(.*?)`/g, `<code style="background: linear-gradient(135deg, ${accentColor}15, ${accentColor}25); padding: 4px 8px; border-radius: 8px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.9em; font-weight: 600; border: 1px solid ${accentColor}30; box-shadow: 0 2px 4px ${accentColor}20;">$1</code>`);
    
    // Enhanced links with hover effects
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color: ${accentColor}; text-decoration: none; font-weight: 600; border-bottom: 2px solid ${accentColor}40; transition: all 0.3s ease; padding-bottom: 1px;" onmouseover="this.style.borderBottomColor='${accentColor}'; this.style.transform='translateY(-1px)'" onmouseout="this.style.borderBottomColor='${accentColor}40'; this.style.transform='translateY(0)'">$1</a>`);

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  // Render content based on layout
  const renderContent = () => {
    switch (layout) {
      case 'image-left':
        return (
          <div className="h-full flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-full">
              {imageUrl ? (
                <SlideImage url={imageUrl} alt={imageAlt || title} className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col">
              {title && (
                <div className="mb-6">
                  <h2 
                    className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                    style={{ color: textColor }}
                  >
                    {title}
                  </h2>
                  <div 
                    className="h-1 w-16 rounded-full mt-2"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-3 md:space-y-4">
                  {parseMarkdown(content)}
                </div>
              </div>
            </div>
          </div>
        );

      case 'image-right':
        return (
          <div className="h-full flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col">
              {title && (
                <div className="mb-6">
                  <h2 
                    className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                    style={{ color: textColor }}
                  >
                    {title}
                  </h2>
                  <div 
                    className="h-1 w-16 rounded-full mt-2"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-3 md:space-y-4">
                  {parseMarkdown(content)}
                </div>
              </div>
            </div>
            
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-full">
              {imageUrl ? (
                <SlideImage url={imageUrl} alt={imageAlt || title} className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'full-image':
        return (
          <div className="h-full relative">
            {imageUrl ? (
              <>
                <SlideImage url={imageUrl} alt={imageAlt || title} className="w-full h-full" />
                {/* Overlay content */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-8">
                  <div className="text-center text-white max-w-4xl">
                    {title && (
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-lg">
                        {title}
                      </h2>
                    )}
                    <div className="text-lg md:text-xl lg:text-2xl leading-relaxed">
                      {parseMarkdown(content)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-24 h-24 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
                    {title}
                  </h2>
                  <div className="max-w-2xl">
                    {parseMarkdown(content)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        // Default layout with optional image at the top
        return (
          <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden">
            {title && (
              <div className="mb-6 flex-shrink-0">
                <h2 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                  style={{ color: textColor }}
                >
                  {title}
                </h2>
                <div 
                  className="h-1 w-16 rounded-full mt-2"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            )}
            
            {imageUrl && (
              <div className="mb-6 flex-shrink-0">
                <SlideImage url={imageUrl} alt={imageAlt || title} className="w-full h-48 md:h-64" />
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 md:space-y-4">
                {parseMarkdown(content)}
              </div>
            </div>
          </div>
        );
    }
  };

  // Enhanced container styling based on slide type and layout
  const getContainerClasses = () => {
    let baseClasses = "markdown-slide-content h-full overflow-hidden relative";
    
    if (slideType === 'title') {
      baseClasses += " flex items-center justify-center text-center";
    }
    
    return `${baseClasses} ${className}`;
  };

  return (
    <div className={getContainerClasses()}>
      {renderContent()}
      
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-5 blur-3xl"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute bottom-10 left-10 w-24 h-24 rounded-full opacity-5 blur-2xl"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
};

export default MarkdownSlideRenderer;

