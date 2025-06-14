'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link' // NEW: Import Link extension
import Highlight from '@tiptap/extension-highlight' // NEW: Import Highlight extension
import React, { useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Type,
  Underline as UnderlineIcon,
  Link2, // NEW: Import Link icon
  Highlighter, // NEW: Import Highlighter icon
  CodeSquare, // NEW: Import CodeSquare icon for Code Blocks
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onUpdate,
  placeholder = "Start writing...",
  className,
  autoSave = true,
  autoSaveDelay = 2000
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        // No need to configure codeBlock here, it's enabled by default in StarterKit
      }),
      Underline,
      Highlight, // NEW: Add Highlight extension
      Link.configure({ // NEW: Configure the Link extension
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
          'min-h-[200px] max-w-none p-4 border rounded-md',
          'prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
          'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-code-block:bg-gray-100 dark:prose-code-block:bg-gray-800', // Optional: Style for code blocks
          className
        ),
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor || !autoSave) return;

    let timeoutId: NodeJS.Timeout;

    const handleUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onUpdate(editor.getHTML());
      }, autoSaveDelay);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(timeoutId);
    };
  }, [editor, onUpdate, autoSave, autoSaveDelay]);

  // --- Callback handlers ---
  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleCode = useCallback(() => editor?.chain().focus().toggleCode().run(), [editor]);
  const setHorizontalRule = useCallback(() => editor?.chain().focus().setHorizontalRule().run(), [editor]);
  const undo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
  const redo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);
  const setHeading = useCallback((level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run(), [editor]);
  
  // NEW: Callback for setting a link
  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // NEW: Callback for toggling a code block
  const toggleCodeBlock = useCallback(() => editor?.chain().focus().toggleCodeBlock().run(), [editor]);
  
  // NEW: Callback for toggling highlight
  const toggleHighlight = useCallback(() => editor?.chain().focus().toggleHighlight().run(), [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-gray-900 p-2 flex flex-wrap gap-1">
        {/* Headings */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'} size="sm" onClick={() => setHeading(1)} className="h-8 w-8 p-0"><Type className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} size="sm" onClick={() => setHeading(2)} className="h-8 w-8 p-0">H2</Button>
          <Button variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'} size="sm" onClick={() => setHeading(3)} className="h-8 w-8 p-0">H3</Button>
        </div>

        {/* Text style */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button variant={editor.isActive('bold') ? 'default' : 'ghost'} size="sm" onClick={toggleBold} className="h-8 w-8 p-0"><Bold className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('italic') ? 'default' : 'ghost'} size="sm" onClick={toggleItalic} className="h-8 w-8 p-0"><Italic className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('underline') ? 'default' : 'ghost'} size="sm" onClick={toggleUnderline} className="h-8 w-8 p-0"><UnderlineIcon className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('highlight') ? 'default' : 'ghost'} size="sm" onClick={toggleHighlight} className="h-8 w-8 p-0">{/* NEW: Highlight Button */}<Highlighter className="h-4 w-4" /></Button>
        </div>
        
        {/* Code, Links */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button variant={editor.isActive('link') ? 'default' : 'ghost'} size="sm" onClick={setLink} className="h-8 w-8 p-0">{/* NEW: Link Button */}<Link2 className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('code') ? 'default' : 'ghost'} size="sm" onClick={toggleCode} className="h-8 w-8 p-0"><Code className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('codeBlock') ? 'default' : 'ghost'} size="sm" onClick={toggleCodeBlock} className="h-8 w-8 p-0">{/* NEW: Code Block Button */}<CodeSquare className="h-4 w-4" /></Button>
        </div>

        {/* Lists and blocks */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button variant={editor.isActive('bulletList') ? 'default' : 'ghost'} size="sm" onClick={toggleBulletList} className="h-8 w-8 p-0"><List className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('orderedList') ? 'default' : 'ghost'} size="sm" onClick={toggleOrderedList} className="h-8 w-8 p-0"><ListOrdered className="h-4 w-4" /></Button>
          <Button variant={editor.isActive('blockquote') ? 'default' : 'ghost'} size="sm" onClick={toggleBlockquote} className="h-8 w-8 p-0"><Quote className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={setHorizontalRule} className="h-8 w-8 p-0"><Minus className="h-4 w-4" /></Button>
        </div>

        {/* History */}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={undo} disabled={!editor.can().undo()} className="h-8 w-8 p-0"><Undo className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={!editor.can().redo()} className="h-8 w-8 p-0"><Redo className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[200px] max-h-[600px] overflow-y-auto">
        <EditorContent
          editor={editor}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default RichTextEditor