import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface LessonSection {
  title: string;
  content: string;
}

interface LessonContentProps {
  sections: LessonSection[];
  className?: string;
}

export default function LessonContent({ sections, className = "" }: LessonContentProps) {
  // If no sections provided, show empty state
  if (!sections || sections.length === 0) {
    return (
      <div className={`text-center text-muted-foreground p-8 ${className}`}>
        <p>No content available for this lesson.</p>
      </div>
    );
  }

  // If sections is empty array, show empty state
  if (sections.length === 0) {
    return (
      <div className={`text-center text-muted-foreground p-8 ${className}`}>
        <p>No content available for this lesson.</p>
      </div>
    );
  }

  // Check if all sections have empty content
  const hasContent = sections.some(section => section.content && section.content.trim().length > 0);
  
  if (!hasContent) {
    return (
      <div className={`text-center text-muted-foreground p-8 ${className}`}>
        <p>No content available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, index) => {
        // Skip sections with no content
        if (!section.content || section.content.trim().length === 0) {
          return null;
        }

        return (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {section.title || `Section ${index + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-blockquote:border-l-4 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:dark:bg-blue-950/20">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground">{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>;
                      }
                      return <code className={className}>{children}</code>;
                    },
                    pre: ({ children }) => (
                      <pre className="bg-muted border rounded-lg p-4 overflow-x-auto mb-4">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 pl-4 py-2 my-4 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </CardContent>
            {index < sections.length - 1 && (
              <div className="px-6 pb-4">
                <Separator />
              </div>
            )}
          </Card>
        );
      }).filter(Boolean)} {/* Filter out null sections */}
    </div>
  );
}

