import React, { useState, useEffect } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

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
  const [editorState, setEditorState] = useState(() => {
    if (value) {
      try {
        const contentState = convertFromRaw(JSON.parse(value));
        return EditorState.createWithContent(contentState);
      } catch {
        // Fallback für plain text
        const contentState = ContentState.createFromText(value);
        return EditorState.createWithContent(contentState);
      }
    }
    return EditorState.createEmpty();
  });

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    const contentState = state.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    
    // Für einfache Textausgabe im PDF verwenden wir nur den Plain Text
    const plainText = contentState.getPlainText();
    onChange(plainText);
  };

  // Update editor state when value prop changes
  useEffect(() => {
    if (value !== editorState.getCurrentContent().getPlainText()) {
      try {
        const contentState = convertFromRaw(JSON.parse(value));
        setEditorState(EditorState.createWithContent(contentState));
      } catch {
        const contentState = ContentState.createFromText(value);
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-md min-h-64">
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        placeholder={placeholder}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline'],
          },
          blockType: {
            options: ['Normal', 'H1', 'H2', 'H3'],
          },
          list: {
            options: ['unordered', 'ordered'],
          },
          textAlign: {
            options: ['left', 'center', 'right', 'justify'],
          },
        }}
        editorClassName="px-4 py-2 min-h-48"
        toolbarClassName="border-b border-gray-200"
        wrapperClassName="w-full"
      />
    </div>
  );
};