import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Text eingeben...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to use custom one
        bulletList: false, // Disable default to use custom one
        orderedList: false, // Disable default to use custom one
        listItem: false, // Disable default to use custom one
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      ListItem,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-48 p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }> = ({ onClick, isActive, children, title, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : isActive
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden tiptap-container">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Fett"
          >
            <Bold size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Kursiv"
          >
            <Italic size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            title="Unterstrichen"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
            title="Überschrift 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
            title="Überschrift 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
            title="Überschrift 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            title="Aufzählung"
          >
            <List size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            title="Nummerierte Liste"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            disabled={!editor.can().chain().focus().setTextAlign('left').run()}
            title="Linksbündig"
          >
            <AlignLeft size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            disabled={!editor.can().chain().focus().setTextAlign('center').run()}
            title="Zentriert"
          >
            <AlignCenter size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            disabled={!editor.can().chain().focus().setTextAlign('right').run()}
            title="Rechtsbündig"
          >
            <AlignRight size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            disabled={!editor.can().chain().focus().setTextAlign('justify').run()}
            title="Blocksatz"
          >
            <AlignJustify size={16} />
          </ToolbarButton>
        </div>

        {/* History */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Rückgängig"
          >
            <Undo size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Wiederholen"
          >
            <Redo size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-48 max-h-96 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .tiptap-container .tiptap-editor {
          line-height: 1.4;
        }
        
        .tiptap-container .tiptap-editor p {
          margin: 0 0 0.5em 0;
          line-height: 1.4;
        }
        
        .tiptap-container .tiptap-editor h1 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          line-height: 1.2;
        }
        
        .tiptap-container .tiptap-editor h2 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 0.4em 0;
          line-height: 1.2;
        }
        
        .tiptap-container .tiptap-editor h3 {
          font-size: 1.1em;
          font-weight: bold;
          margin: 0.3em 0;
          line-height: 1.2;
        }
        
        .tiptap-container .tiptap-editor ul,
        .tiptap-container .tiptap-editor ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        .tiptap-container .tiptap-editor li {
          margin: 0.2em 0;
          line-height: 1.4;
        }
        
        .tiptap-container .tiptap-editor strong {
          font-weight: bold;
        }
        
        .tiptap-container .tiptap-editor em {
          font-style: italic;
        }
        
        .tiptap-container .tiptap-editor u {
          text-decoration: underline;
        }
        
        .tiptap-container .tiptap-editor [style*="text-align: center"] {
          text-align: center;
        }
        
        .tiptap-container .tiptap-editor [style*="text-align: right"] {
          text-align: right;
        }
        
        .tiptap-container .tiptap-editor [style*="text-align: justify"] {
          text-align: justify;
        }
      `}</style>
    </div>
  );
};