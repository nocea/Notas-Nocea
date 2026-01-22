
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
// import rehypeSanitize from 'rehype-sanitize'; // Optional: for security if content is untrusted
// import remarkMath from 'remark-math'; // Optional: if math support needed later
// import rehypeKatex from 'rehype-katex'; 

import styles from './MarkdownViewer.module.scss';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (

    <div className={styles.viewer}>
      <div className={styles.markdown}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Custom components can be added here
            // e.g. code blocks, callouts, etc.
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
