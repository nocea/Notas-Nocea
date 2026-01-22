import React from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Terminal, 
  Link, 
  Image as ImageIcon, 
  Minus 
} from 'lucide-react';
import styles from './MarkdownToolbar.module.css';

interface MarkdownToolbarProps {
  editor: any;
  monaco: any;
}

export default function MarkdownToolbar({ editor, monaco }: MarkdownToolbarProps) {
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!editor || !monaco) return;

    const selection = editor.getSelection();
    const range = new monaco.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn
    );

    const selectedText = editor.getModel().getValueInRange(range) || placeholder;
    const replacement = `${before}${selectedText}${after}`;

    editor.executeEdits('markdown-toolbar', [
      {
        range: range,
        text: replacement,
        forceMoveMarkers: true,
      },
    ]);

    // If there was no selection, select the placeholder text
    if (editor.getSelection().isEmpty() && placeholder) {
      const newLineNumber = selection.startLineNumber;
      const newStartColumn = selection.startColumn + before.length;
      const newEndColumn = newStartColumn + placeholder.length;
      editor.setSelection(new monaco.Selection(newLineNumber, newStartColumn, newLineNumber, newEndColumn));
    }

    editor.focus();
  };

  const insertLinePrefix = (prefix: string) => {
    if (!editor || !monaco) return;

    const selection = editor.getSelection();
    
    const edits: any[] = [];
    for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
      edits.push({
        range: new monaco.Range(i, 1, i, 1),
        text: prefix,
      });
    }

    editor.executeEdits('markdown-toolbar', edits);
    editor.focus();
  };

  const toolbarButtons = [
    { icon: <Heading1 size={18} />, title: 'H1', action: () => insertLinePrefix('# ') },
    { icon: <Heading2 size={18} />, title: 'H2', action: () => insertLinePrefix('## ') },
    { icon: <Heading3 size={18} />, title: 'H3', action: () => insertLinePrefix('### ') },
    { type: 'separator' },
    { icon: <Bold size={18} />, title: 'Bold', action: () => insertText('**', '**', 'negrita') },
    { icon: <Italic size={18} />, title: 'Italic', action: () => insertText('*', '*', 'cursiva') },
    { icon: <Strikethrough size={18} />, title: 'Strikethrough', action: () => insertText('~~', '~~', 'tachado') },
    { type: 'separator' },
    { icon: <List size={18} />, title: 'Bullet List', action: () => insertLinePrefix('- ') },
    { icon: <ListOrdered size={18} />, title: 'Numbered List', action: () => insertLinePrefix('1. ') },
    { icon: <CheckSquare size={18} />, title: 'Task List', action: () => insertLinePrefix('- [ ] ') },
    { type: 'separator' },
    { icon: <Quote size={18} />, title: 'Quote', action: () => insertLinePrefix('> ') },
    { icon: <Code size={18} />, title: 'Inline Code', action: () => insertText('`', '`', 'código') },
    { icon: <Terminal size={18} />, title: 'Code Block', action: () => insertText('```\n', '\n```', 'bloque de código') },
    { type: 'separator' },
    { icon: <Link size={18} />, title: 'Link', action: () => insertText('[', '](url)', 'texto') },
    { icon: <ImageIcon size={18} />, title: 'Image', action: () => insertText('![', '](url)', 'alt text') },
    { icon: <Minus size={18} />, title: 'Horizontal Rule', action: () => insertText('\n---\n') },
  ];

  return (
    <div className={styles.toolbar} style={{ borderTop: '2px solid #7b97aa' }}>
      {toolbarButtons.map((btn, index) => (
        btn.type === 'separator' ? (
          <div key={`sep-${index}`} className={styles.separator} />
        ) : (
          <button
            key={index}
            className={styles.button}
            onClick={(e) => {
              e.preventDefault();
              btn.action?.();
            }}
            title={btn.title}
            style={{ opacity: 1, visibility: 'visible' }}
          >
            {btn.icon}
          </button>
        )
      ))}
    </div>
  );
}
