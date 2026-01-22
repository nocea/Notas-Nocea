'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getFileContentAction } from '@/app/actions';
import styles from './NotePreview.module.css';

interface NotePreviewProps {
  path: string;
  x: number;
  y: number;
}

export default function NotePreview({ path, x, y }: NotePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    getFileContentAction(path).then(result => {
      if (isMounted) {
        if (result.success) {
          setContent(result.content || '');
        } else {
          setContent('Error al cargar la nota.');
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [path]);

  // Adjust position to keep it on screen
  const top = y + 20;
  const left = x + 20;

  return (
    <div className={styles.previewOverlay} style={{ top, left }}>
      <div className={styles.previewScroll}>
        {loading ? (
          <div className={styles.loading}>Cargando vista previa...</div>
        ) : (
          <div className={styles.markdown}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {content || ''}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
