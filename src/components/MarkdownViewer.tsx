
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import clsx from 'clsx';
// import rehypeSanitize from 'rehype-sanitize'; // Optional: for security if content is untrusted
// import remarkMath from 'remark-math'; // Optional: if math support needed later
// import rehypeKatex from 'rehype-katex'; 

import styles from './MarkdownViewer.module.scss';
import NotePreview from './NotePreview';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [hoveredNote, setHoveredNote] = React.useState<{ path: string; x: number; y: number } | null>(null);
  // Extract headers for TOC
  const headers = React.useMemo(() => {
    if (!content) return [];
    const lines = content.split(/\r?\n/);
    const extracted: { level: number; text: string; id: string }[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match #, ##, or ### followed by space and then text
      const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const text = match[2].trim();
        extracted.push({
          level: match[1].length,
          text: text,
          id: text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
        });
      }
    }
    return extracted;
  }, [content]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const container = element.closest(`.${styles.viewer}`);
      if (container) {
        const top = element.offsetTop - 20;
        container.scrollTo({ top, behavior: 'smooth' });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.viewer}>
        <div className={styles.markdown}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
                return <h1 id={id}>{children}</h1>;
              },
              h2: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
                return <h3 id={id}>{children}</h3>;
              },
              a: ({ href, children }) => {
                const isInternal = href?.startsWith('/') || href?.startsWith('./') || (!href?.startsWith('http') && href?.endsWith('.md'));
                
                const handleMouseEnter = (e: React.MouseEvent) => {
                  if (isInternal && href) {
                    // Clean up path
                    let cleanPath = href.startsWith('/') ? href.slice(1) : href;
                    if (!cleanPath.endsWith('.md')) cleanPath += '.md';
                    setHoveredNote({ path: cleanPath, x: e.clientX, y: e.clientY });
                  }
                };

                const handleMouseLeave = () => {
                  setHoveredNote(null);
                };

                return (
                  <a 
                    href={href} 
                    onMouseEnter={handleMouseEnter} 
                    onMouseLeave={handleMouseLeave}
                  >
                    {children}
                  </a>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      
      {hoveredNote && (
        <NotePreview 
          path={hoveredNote.path} 
          x={hoveredNote.x} 
          y={hoveredNote.y} 
        />
      )}
      
      {headers.length > 0 && (
        <>
          {isCollapsed && (
            <button 
              className={styles.expandBtn} 
              onClick={() => setIsCollapsed(false)}
              title="Mostrar Índice"
            >
              <PanelRightOpen size={18} />
            </button>
          )}
          <div className={clsx(styles.tocContainer, isCollapsed && styles.collapsed)}>
            <div style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s', display: isCollapsed ? 'none' : 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div className={styles.tocTitle}>En esta nota</div>
                <button 
                  className={styles.toggleBtn} 
                  onClick={() => setIsCollapsed(true)}
                  title="Ocultar Índice"
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
              <div className={styles.tocList}>
                {headers.map((header, index) => {
                  let label = "";
                  if (header.level === 1) {
                    const h1Index = headers.filter((h, i) => h.level === 1 && i <= index).length;
                    label = `${h1Index}. `;
                  } else if (header.level === 2) {
                    const precedingH1s = headers.filter((h, i) => h.level === 1 && i < index);
                    const lastH1Index = precedingH1s.length > 0 ? headers.indexOf(precedingH1s[precedingH1s.length - 1]) : -1;
                    const h2Index = headers.filter((h, i) => h.level === 2 && i > lastH1Index && i <= index).length;
                    label = `${String.fromCharCode(64 + h2Index)}. `;
                  }

                  return (
                    <a
                      key={`${header.id}-${index}`}
                      onClick={() => scrollToId(header.id)}
                      className={`${styles.tocItem} ${
                        header.level === 1 ? styles.tocItemH1 : 
                        header.level === 2 ? styles.tocItemH2 : 
                        styles.tocItemH3
                      }`}
                      title={header.text}
                    >
                      {label}{header.text}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
