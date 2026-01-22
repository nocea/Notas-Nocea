'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import MarkdownViewer from './MarkdownViewer';
import { saveFile } from '@/app/actions';
import { Save, Eye, Edit, Columns, File as FileIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './EditorLayout.module.css';

interface EditorLayoutProps {
  initialContent: string;
  filePath: string;
}

type ViewMode = 'edit' | 'view' | 'split';

export default function EditorLayout({ initialContent, filePath }: EditorLayoutProps) {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<ViewMode>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Update content if initialContent changes (e.g. navigation)
  useEffect(() => {
    setContent(initialContent);
    setIsDirty(false);
    // Default to view mode on navigation? Or keep previous? 
    // Let's keep previous for now or default to view.
  }, [initialContent, filePath]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const result = await saveFile(filePath, content);
    setIsSaving(false);
    if (result.success) {
      setIsDirty(false);
    } else {
      alert('Error saving file');
    }
  }, [filePath, content]);

  // Keyboard shortcut for Save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.fileInfo}>
          <FileIcon size={16} />
          <span className={styles.filePath}>{filePath}</span>
          {isDirty && <span className={styles.dirtyIndicator}>*</span>}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={clsx(styles.button, mode === 'view' && styles.active)} 
            onClick={() => setMode('view')}
            title="View Mode"
          >
            <Eye size={16} />
          </button>
          <button 
            className={clsx(styles.button, mode === 'edit' && styles.active)} 
            onClick={() => setMode('edit')}
            title="Edit Mode"
          >
            <Edit size={16} />
          </button>
          <button 
            className={clsx(styles.button, mode === 'split' && styles.active)} 
            onClick={() => setMode('split')}
            title="Split Mode"
          >
            <Columns size={16} />
          </button>
          <div className={styles.separator} />
          <button 
            className={clsx(styles.button, styles.saveButton)} 
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        {(mode === 'edit' || mode === 'split') && (
          <div className={clsx(styles.pane, styles.editorPane)}>
            <CodeEditor value={content} onChange={handleContentChange} />
          </div>
        )}
        
        {(mode === 'view' || mode === 'split') && (
          <div className={clsx(styles.pane, styles.viewerPane)}>
            <MarkdownViewer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
